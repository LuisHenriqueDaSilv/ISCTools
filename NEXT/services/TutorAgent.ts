import { z } from "zod";
import { tool } from "@langchain/core/tools";
import type { VectorStore } from "@langchain/core/vectorstores";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { getVectorStorePath } from "@/lib/vectorStore";

const SYSTEM_PROMPT = `Você é o Lamarzito-Tutor, um professor universitário de Introdução aos Sistemas Computacionais e Arquitetura de Computadores na Universidade de Brasília (UnB), com alto nível de conhecimento e muito paciente.

Regras:
1. Responde APENAS a questões sobre a disciplina (ISC, OAC, RISC-V, Assembly, pipeline, memória, bases numéricas, etc.).
2. Sempre que precisares de fundamentar a resposta em slides, vídeos ou material da disciplina, USA a ferramenta buscar_conteudo_disciplina com uma query adequada em português.
3. Se a pergunta for fora do âmbito da disciplina (saudações, agradecimentos, outros temas), responde de forma educada que só podes ajudar em temas da disciplina.
4. Sê didático, claro e paciente. Usa o contexto recuperado para dar respostas precisas e citar o material quando relevante.`;

function buildSearchCourseContentTool(vectorStore: VectorStore) {
  return tool(
    async ({ query }: { query: string }) => {
      try {
        const results = await vectorStore.similaritySearch(query, 4);
        const texts = results.map((doc) => doc.pageContent);
        if (texts.length === 0) return "Nenhum conteúdo encontrado para esta busca.";
        return texts.join("\n\n---\n\n");
      } catch (err) {
        console.error("Erro ao buscar no RAG:", err);
        return "Erro ao consultar o conteúdo da disciplina. Tenta reformular a pergunta.";
      }
    },
    {
      name: "buscar_conteudo_disciplina",
      description:
        "Busca no material da disciplina (slides, vídeos, transcrições) por conteúdo relevante. Usa quando precisares de fundamentar a resposta em conteúdo de ISC/OAC, RISC-V, Assembly, pipeline, memória, etc. O argumento deve ser uma query em português.",
      schema: z.object({
        query: z.string().describe("Pesquisa em português sobre o tópico da disciplina (ex: 'hazards no pipeline RISC-V')"),
      }),
    }
  );
}

export async function tutorChat(
  message: string,
  history: Array<{ sender: "user" | "ai"; text: string }>,
  apiKey: string
): Promise<string> {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.5,
    maxRetries: 2,
    apiKey,
  });

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_QUERY,
    apiKey,
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

  const searchTool = buildSearchCourseContentTool(vectorStore);
  const agent = createReactAgent({
    llm,
    tools: [searchTool],
    prompt: SYSTEM_PROMPT,
  });

  const formattedHistory: BaseMessage[] = history.map((msg) =>
    msg.sender === "user" ? new HumanMessage(msg.text) : new AIMessage(msg.text)
  );
  const messages = [...formattedHistory, new HumanMessage(message)];

  const result = await agent.invoke({ messages });
  const outMessages = result?.messages as BaseMessage[] | undefined;
  if (!outMessages?.length) return "Desculpa, não consegui gerar uma resposta.";

  const lastAi = [...outMessages].reverse().find((m) => m._getType() === "ai");
  const content = lastAi?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const textPart = content.find((c: { type?: string }) => c.type === "text");
    const text = textPart && typeof (textPart as { text?: string }).text === "string"
      ? (textPart as { text: string }).text
      : String(content);
    return text;
  }
  return "Desculpa, não consegui gerar uma resposta.";
}
