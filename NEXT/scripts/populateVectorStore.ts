/**
 * Script para popular o vector store HNSWLib (ficheiros locais) com chunks dos JSONs em Data.
 * Executar uma única vez: npm run populate-rag
 * Requer: GEMINI_API_KEY no .env. Não é necessário servidor (Chroma, etc.).
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStorePath } from "../lib/vectorStore";

const DATA_BASE = process.env.DATA_PATH || path.join(process.cwd(), "..", "Data");
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const TRANSCRIPTION_MAX_LENGTH = 1200;
/** Dimensão dos embeddings: gemini-embedding-001 devolve 3072 por defeito. */
const EMBEDDING_DIMENSIONS = 3072;
/** Mínimo de caracteres no conteúdo para gerar embedding (evita arrays vazios da API). */
const MIN_CONTENT_LENGTH = 10;
/** Tamanho do lote para adicionar ao vector store. */
const EMBED_BATCH_SIZE = 50;
/** Número de embeddings em paralelo (embedQuery; o batch da API falha com text-embedding-004). */
const EMBED_CONCURRENCY = 5;

interface EnrichedSegment {
  id: number;
  timestamp_start: number;
  timestamp_end: number;
  slide_description: string;
  transcription: string;
  video_source: string;
}

function getAllEnrichedJsonPaths(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllEnrichedJsonPaths(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.includes("enriched") && entry.name.endsWith(".json"))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

async function createDocumentsFromSegment(segment: EnrichedSegment): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const visualContext = segment.slide_description ?? "";
  const fullTranscription = segment.transcription ?? "";
  if (!visualContext.trim() && !fullTranscription.trim()) return [];
  const docs: Document[] = [];

  if (fullTranscription.length < TRANSCRIPTION_MAX_LENGTH) {
    const content = `VISÃO DO SLIDE: ${visualContext}\n\nEXPLICAÇÃO: ${fullTranscription}`;
    docs.push(
      new Document({
        pageContent: content,
        metadata: {
          source: segment.video_source,
          slide_id: segment.id,
          type: "full_slide",
          timestamp_start: segment.timestamp_start,
        },
      })
    );
  } else {
    const subChunks = await textSplitter.splitText(fullTranscription);
    for (let i = 0; i < subChunks.length; i++) {
      const content = `VISÃO DO SLIDE (Contexto Global): ${visualContext}\n\nTRECHO DA EXPLICAÇÃO (${i + 1}/${subChunks.length}): ${subChunks[i]}`;
      docs.push(
        new Document({
          pageContent: content,
          metadata: {
            source: segment.video_source,
            slide_id: segment.id,
            type: "sub_chunk",
            chunk_index: i,
            timestamp_start: segment.timestamp_start,
          },
        })
      );
    }
  }
  return docs;
}

async function createDocumentsFromFile(filePath: string): Promise<Document[]> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as EnrichedSegment[];
  const docs: Document[] = [];
  for (const segment of data) {
    docs.push(...(await createDocumentsFromSegment(segment)));
  }
  return docs;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY não definida. Defina no .env ou ambiente.");
    process.exit(1);
  }

  const storePath = getVectorStorePath();
  console.log("Diretório Data:", DATA_BASE);
  console.log("Vector store (HNSWLib) será guardado em:", storePath);
  const jsonPaths = getAllEnrichedJsonPaths(DATA_BASE);
  console.log(`Encontrados ${jsonPaths.length} ficheiros *_enriched*.json`);

  if (jsonPaths.length === 0) {
    console.warn("Nenhum ficheiro encontrado. Verifique DATA_PATH ou a pasta Data.");
    process.exit(0);
  }

  // Apagar índice existente para idempotência
  if (fs.existsSync(storePath)) {
    fs.rmSync(storePath, { recursive: true });
    console.log("Índice antigo apagado.");
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    apiKey,
  });

  const vectorStore = new HNSWLib(embeddings, {
    space: "cosine",
    numDimensions: EMBEDDING_DIMENSIONS,
  });

  let totalDocs = 0;
  for (const filePath of jsonPaths) {
    const relPath = path.relative(DATA_BASE, filePath);
    console.log(`A processar: ${relPath}`);
    const docs = await createDocumentsFromFile(filePath);
    const validDocs = docs.filter(
      (d) => d.pageContent && d.pageContent.trim().length >= MIN_CONTENT_LENGTH
    );
    const skipped = docs.length - validDocs.length;
    if (skipped > 0) console.log(`  Ignorados ${skipped} documento(s) com conteúdo vazio ou muito curto.`);
    if (validDocs.length === 0) continue;

    let addedThisFile = 0;
    for (let i = 0; i < validDocs.length; i += EMBED_BATCH_SIZE) {
      const batch = validDocs.slice(i, i + EMBED_BATCH_SIZE);
      const vectors: number[][] = [];
      for (let k = 0; k < batch.length; k += EMBED_CONCURRENCY) {
        const chunk = batch.slice(k, k + EMBED_CONCURRENCY);
        const results = await Promise.all(
          chunk.map((doc) => embeddings.embedQuery(doc.pageContent))
        );
        vectors.push(...results);
      }
      const validPairs: { doc: Document; vector: number[] }[] = [];
      for (let j = 0; j < batch.length; j++) {
        if (vectors[j]?.length) validPairs.push({ doc: batch[j], vector: vectors[j] });
        else console.warn(`  Embedding vazio ignorado (doc ${i + j + 1}).`);
      }
      if (validPairs.length > 0) {
        await vectorStore.addVectors(
          validPairs.map((p) => p.vector),
          validPairs.map((p) => p.doc)
        );
        totalDocs += validPairs.length;
        addedThisFile += validPairs.length;
      }
    }
    console.log(`  Adicionados ${addedThisFile} documento(s) deste ficheiro.`);
  }

  fs.mkdirSync(storePath, { recursive: true });
  await vectorStore.save(storePath);
  console.log(`Concluído. Total de documentos embebidos: ${totalDocs}. Índice guardado em ${storePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
