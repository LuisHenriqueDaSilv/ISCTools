
import chromadb
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    task_type="retrieval_query"
)

vector_store = Chroma(
    persist_directory="./rag_db",
    collection_name="arquitetura_computadores",
    embedding_function=embeddings
)

query = "O que são bases numericas?"
results = vector_store.similarity_search(query, k=4)

print(f"Found {len(results)} results")
for i, res in enumerate(results):
    print(f"Result {i+1}:")
    print(res.page_content[:200] + "...")
    print(res.metadata)
