import { z } from "zod";
import type { VectorStore } from "@langchain/core/vectorstores";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { getVectorStorePath } from "@/lib/vectorStore";

// --- DEFINIÇÃO DO ESTADO ---
interface AgentState {
  question: string;
  context: string[];
  loopCount: number;
  finalAnswer?: string;
  messages: BaseMessage[];
  route?: "retrieve" | "generate";
}

export class LamarzitoAgent {
  private llm: ChatGoogleGenerativeAI;
  private vectorStore: VectorStore;
  private workflow: any;

  private constructor(vectorStore: VectorStore, llm: ChatGoogleGenerativeAI) {
    this.llm = llm;
    this.vectorStore = vectorStore;
    this.setupWorkflow();
  }

  /** Cria o agente carregando o vector store a partir do disco (assíncrono). */
  static async create(): Promise<LamarzitoAgent> {
    const apiKey = process.env.GEMINI_API_KEY;
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.5,
      maxRetries: 2,
      apiKey: apiKey,
    });
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "models/gemini-embedding-001",
      taskType: TaskType.RETRIEVAL_QUERY,
      apiKey: apiKey,
    });
    let vectorStore: VectorStore;
    try {
      vectorStore = await HNSWLib.load(getVectorStorePath(), embeddings);
    } catch (err) {
      console.error("Erro ao carregar o vector store (execute npm run populate-rag primeiro):", err);
      throw new Error(
        "O índice do conteúdo da disciplina não foi encontrado. Execute 'npm run populate-rag' e tente novamente."
      );
    }
    return new LamarzitoAgent(vectorStore, llm);
  }

  private setupWorkflow() {
    const workflow = new StateGraph<AgentState>({
      channels: {
        question: { value: (x, y) => y ?? x, default: () => "" },
        context: { value: (x, y) => y, default: () => [] },
        loopCount: { value: (x, y) => y, default: () => 0 },
        finalAnswer: { value: (x, y) => y, default: () => "" },
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        route: { value: (x, y) => y, default: () => undefined }
      }
    });

    workflow.addNode("router", this.router.bind(this));
    workflow.addNode("retrieve", this.retrieve.bind(this));
    workflow.addNode("gradeDocuments", this.gradeDocuments.bind(this));
    workflow.addNode("generate", this.generate.bind(this));
    workflow.addNode("transformQuery", this.transformQuery.bind(this));

    workflow.addEdge(START, "router" as any);

    workflow.addConditionalEdges(
      "router" as any,
      (state: AgentState) => state.route || "generate",
      {
        retrieve: "retrieve",
        generate: "generate",
      } as any
    );

    workflow.addEdge("retrieve" as any, "gradeDocuments" as any);

    workflow.addConditionalEdges(
      "gradeDocuments" as any,
      this.decideToGenerate.bind(this),
      {
        generate: "generate",
        transformQuery: "transformQuery",
      } as any
    );

    workflow.addEdge("transformQuery" as any, "retrieve" as any);
    workflow.addEdge("generate" as any, END);

    this.workflow = workflow.compile();
  }

  // NÓ: Router - Decide se precisa buscar no RAG ou não
  private async router(state: AgentState) {
    const { question, messages } = state;

    const routeSchema = z.object({
      route: z.enum(["retrieve", "generate"]).describe("Devemos buscar no banco de dados vetorial ou responder diretamente?")
    });

    const structuredLlm = this.llm.withStructuredOutput(routeSchema);
    
    const result = await structuredLlm.invoke([
      new SystemMessage(`Você é um roteador inteligente para o Lamarzito (Assistente de ISC).
      Analise a última pergunta do usuário e o histórico da conversa.
      
      - Escolha 'retrieve' se for uma pergunta técnica sobre Arquitetura de Computadores, RISC-V, ISA, MIPS, Pipeline, Memória, Binários, ou qualquer conteúdo específico de ISC que precise de embasamento nos slides/vídeos.
      - Escolha 'generate' se for uma saudação (Olá, tudo bem?), agradecimento, conversa casual ou se a pergunta puder ser respondida sem consulta técnica específica.
      
      Sempre prefira ser cauteloso e buscar se houver dúvida.`),
      ...messages
    ]);

    return { route: result.route };
  }

  // NÓ: Recuperação (REAL)
  private async retrieve(state: AgentState) {
    try {
      const results = await this.vectorStore.similaritySearch(state.question, 4);
      const docsContent = results.map(doc => doc.pageContent);
      return { context: docsContent };
    } catch (error) {
      console.error("❌ Erro ao buscar no vector store:", error);
      return { context: [] };
    }
  }

  // NÓ: Avaliador (Grader)
  private async gradeDocuments(state: AgentState) {
    const { context, question } = state;
    if (context.length === 0) return { context: [] };

    const gradeSchema = z.object({
      score: z.enum(["yes", "no"]).describe("O documento é relevante para a pergunta?"),
    });

    const structuredLlm = this.llm.withStructuredOutput(gradeSchema);
    const relevantDocs: string[] = [];

    const evaluations = await Promise.all(context.map(async (doc) => {
      try {
        const result = await structuredLlm.invoke([
          new SystemMessage("Você é um avaliador rigoroso. O documento ajuda a responder a pergunta? Responda 'yes' ou 'no'."),
          new HumanMessage(`PERGUNTA: ${question}\n\nDOCUMENTO A AVALIAR:\n${doc}`)
        ]);
        // @ts-ignore
        return { doc, score: result.score };
      } catch (e) {
        return { doc, score: "no" };
      }
    }));

    for (const item of evaluations) {
      if (item.score === "yes") {
        relevantDocs.push(item.doc);
      }
    }
    
    return { context: relevantDocs };
  }

  // NÓ: Geração de Resposta
  private async generate(state: AgentState) {
    const { question, context, messages } = state;

    let systemPrompt = "";
    if (context.length > 0) {
      systemPrompt = `Você é o Lamarzito, um professor Universitário de Arquitetura de Computadores (UnB).
      Responda à pergunta do aluno com base EXCLUSIVAMENTE no contexto fornecido.
      Se o contexto não tiver a resposta, use seu conhecimento para complementar mas prioritize o contexto.
      Use linguagem técnica, cite slides se mencionado.
      
      CONTEXTO:
      ${context.join("\n\n")}`;
    } else {
      systemPrompt = `Você é o Lamarzito, um professor Universitário de Arquitetura de Computadores (UnB).
      Seja simpático, didático e apaixonado por hardware.
      Se for uma saudação, responda amigavelmente.
      Se for uma dúvida fora do contexto técnico, responda educadamente.`;
    }

    const response = await this.llm.invoke([
      new SystemMessage(systemPrompt),
      ...messages
    ]);
    
    return { finalAnswer: response.content as string };
  }

  // NÓ: Reescrita de Query
  private async transformQuery(state: AgentState) {
    const { question, messages } = state;

    const prompt = `
      A busca no banco vetorial falhou para a pergunta do usuário.
      Atue como um Especialista em RAG. Reescreva essa pergunta para encontrar melhor termos sobre Arquitetura de Computadores (Pipeline, MIPS, Binário, etc).
      Considere o histórico da conversa para dar contexto.
      Mantenha o idioma Português. Retorne apenas a nova frase.
    `;

    const response = await this.llm.invoke([
      new SystemMessage(prompt),
      ...messages
    ]);
    
    const newQuery = response.content as string;
    
    return { 
      question: newQuery, 
      loopCount: state.loopCount + 1,
      context: [] 
    }; 
  }

  private decideToGenerate(state: AgentState) {
    const { context, loopCount } = state;
    if (context.length > 0 || loopCount >= 2) {
      return "generate";
    }
    return "transformQuery";
  }

  public async chat(question: string, history: any[] = []) {
    const formattedHistory = history.map(msg => 
      msg.sender === "user" ? new HumanMessage(msg.text) : new AIMessage(msg.text)
    );

    const result = await this.workflow.invoke({
      question: question,
      loopCount: 0,
      context: [],
      messages: formattedHistory.concat(new HumanMessage(question))
    });
    
    return result.finalAnswer;
  }
}

let agentInstance: Promise<LamarzitoAgent> | null = null;

/** Obtém o LamarzitoAgent (carrega o vector store uma vez e reutiliza). */
export async function getLamarzitoAgent(): Promise<LamarzitoAgent> {
  if (!agentInstance) agentInstance = LamarzitoAgent.create();
  return agentInstance;
}
