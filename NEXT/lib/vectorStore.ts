import * as path from "path";

/**
 * Diretório onde o HNSWLib persiste o índice (hnswlib.index, docstore.json, args.json).
 * Usado pelo script populate-rag e pelos agentes que fazem similarity search.
 */
export function getVectorStorePath(): string {
  return (
    process.env.VECTOR_STORE_PATH ||
    path.join(process.cwd(), "data", "vectorstore")
  );
}
