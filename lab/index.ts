import "dotenv/config";
import { z } from "zod";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai"; // Importante para definir o tipo de embedding
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// --- CONFIGURAÇÃO LLM ---
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // Flash é ideal para o loop rápido
  temperature: 0.5,
  maxRetries: 2,
  apiKey: process.env.GEMINI_API_KEY,
});

// --- CONFIGURAÇÃO DO VECTOR STORE ---
// 1. O modelo de Embedding TEM que ser igual ao usado no Python para os vetores baterem
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/text-embedding-004",
  taskType: TaskType.RETRIEVAL_QUERY, // Define que agora estamos fazendo perguntas
  apiKey: process.env.GEMINI_API_KEY,
});

// 2. Conexão com o Chroma (Assumindo que você rodou 'npx chromadb run --path ./rag_db')
const vectorStore = new Chroma(embeddings, {
  collectionName: "arquitetura_computadores", // Mesmo nome definido no Python
  url: "http://localhost:8000", // URL padrão do servidor local Chroma
});

// --- 1. DEFINIÇÃO DO ESTADO ---
interface AgentState {
  question: string;
  context: string[];
  loopCount: number;
  finalAnswer?: string;
}

// --- 2. OS NÓS (AÇÕES) ---

// NÓ: Recuperação (REAL)
async function retrieve(state: AgentState) {
  console.log(`🔍 [Retrieve] Buscando no Chroma por: "${state.question}"`);
  
  try {
    // Busca os 4 chunks mais similares
    const results = await vectorStore.similaritySearch(state.question, 4);
    
    // Extrai apenas o texto do conteúdo
    const docsContent = results.map(doc => doc.pageContent);
    
    console.log(`   📄 Encontrados ${docsContent.length} documentos.`);
    return { context: docsContent };
  } catch (error) {
    console.error("❌ Erro ao conectar no Chroma. O servidor está rodando?", error);
    return { context: [] };
  }
}

// NÓ: Avaliador (Grader)
async function gradeDocuments(state: AgentState) {
  console.log("⚖️ [Grader] Avaliando relevância dos documentos...");
  const { context, question } = state;

  // Se não veio nada do retrieve, nem gasta token avaliando
  if (context.length === 0) return { context: [] };

  const gradeSchema = z.object({
    score: z.enum(["yes", "no"]).describe("O documento é relevante para a pergunta?"),
  });

  const structuredLlm = llm.withStructuredOutput(gradeSchema);
  const relevantDocs: string[] = [];

  // Avalia em paralelo para ser mais rápido (Promise.all)
  const evaluations = await Promise.all(context.map(async (doc) => {
    try {
      const result = await structuredLlm.invoke([
        new SystemMessage("Você é um avaliador rigoroso. O documento ajuda a responder a pergunta? Responda 'yes' ou 'no'."),
        new HumanMessage(`PERGUNTA: ${question}\n\nDOCUMENTO A AVALIAR:\n${doc}`)
      ]);
      return { doc, score: result.score };
    } catch (e) {
      return { doc, score: "no" }; // Fallback seguro
    }
  }));

  for (const item of evaluations) {
    if (item.score === "yes") {
      relevantDocs.push(item.doc);
    } else {
      // console.log("   🗑️ Documento descartado pelo Grader");
    }
  }
  
  console.log(`   ✅ ${relevantDocs.length} documentos aprovados.`);
  return { context: relevantDocs };
}

// NÓ: Geração de Resposta
async function generate(state: AgentState) {
  console.log("💡 [Generate] Gerando resposta final...");
  const { question, context } = state;

  const prompt = `
    Você é um professor Universitário de Arquitetura de Computadores (UnB).
    Responda à pergunta do aluno com base EXCLUSIVAMENTE no contexto abaixo.
    Use linguagem técnica, cite os slides se mencionado no texto.
    
    CONTEXTO RECUPERADO DOS VÍDEOS:
    ${context.join("\n\n----------------\n\n")}
    
    PERGUNTA DO ALUNO: ${question}
  `;

  const response = await llm.invoke(prompt);
  return { finalAnswer: response.content as string };
}

// NÓ: Reescrita de Query
async function transformQuery(state: AgentState) {
  console.log("🔄 [Transform] Contexto insuficiente. Reescrevendo a pergunta...");
  const { question } = state;

  const prompt = `
    A busca no banco vetorial falhou para: "${question}".
    Atue como um Especialista em RAG. Reescreva essa pergunta para encontrar melhor termos sobre Arquitetura de Computadores (Pipeline, MIPS, Binário, etc).
    Mantenha o idioma Português.
    Retorne apenas a nova frase.
  `;

  const response = await llm.invoke(prompt);
  const newQuery = response.content as string;
  
  console.log(`   ➡️ Nova Query Otimizada: "${newQuery}"`);
  
  return { 
    question: newQuery, 
    loopCount: state.loopCount + 1,
    context: [] 
  }; 
}

// --- 3. LÓGICA DE DECISÃO ---

function decideToGenerate(state: AgentState) {
  const { context, loopCount } = state;

  if (context.length > 0) {
    return "generate";
  }

  if (loopCount >= 3) {
    console.log("🛑 Limite de tentativas atingido. Gerando resposta com o que temos.");
    return "generate";
  }

  return "transformQuery";
}

// --- 4. GRAFO ---

const workflow = new StateGraph<AgentState>({
  channels: {
    question: { value: (x, y) => y ?? x, default: () => "" },
    context: { value: (x, y) => y, default: () => [] },
    loopCount: { value: (x, y) => y, default: () => 0 },
    finalAnswer: { value: (x, y) => y, default: () => "" },
  }
});

workflow.addNode("retrieve", retrieve);
workflow.addNode("gradeDocuments", gradeDocuments);
workflow.addNode("generate", generate);
workflow.addNode("transformQuery", transformQuery);

workflow.setEntryPoint("retrieve");
workflow.addEdge("retrieve", "gradeDocuments");

workflow.addConditionalEdges(
  "gradeDocuments",
  decideToGenerate,
  {
    generate: "generate",
    transformQuery: "transformQuery",
  }
);

workflow.addEdge("transformQuery", "retrieve");
workflow.addEdge("generate", END);

export const agentExecutor = workflow.compile();

// --- TESTE ---
async function run() {
  // Teste com uma pergunta que provavelmente está no seu banco
  const pergunta = "Dado o trecho de códigos abaixo, identifique se existe ou não hazards e classifique-o. Considere que vc está usando o processador RISC-V com ISA de 9 instruções feito em aula. add t1, t2, t3; add t1, t4, t2";
  
  console.log(`\n🏁 Iniciando Agent para: "${pergunta}"\n`);
  
  const result = await agentExecutor.invoke({
    question: pergunta,
    loopCount: 0,
    context: []
  });
  
  console.log("\n============================================");
  console.log("RESPOSTA FINAL DO AGENTE:");
  console.log("============================================");
  console.log(result.finalAnswer);
}

// Verifica se está rodando diretamente (via tsx)
// @ts-ignore
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}