from dotenv import load_dotenv
import os
import chromadb
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_documents_smart_slide(data_json):
    docs_to_add = []
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    for item in data_json:
        visual_context = item["slide_description"]
        full_transcription = item["transcription"]
        print("===========Adicionando Chunk===========")
        
        
        if len(full_transcription) < 1200:
            final_content = f"VISÃO DO SLIDE: {visual_context}\n\nEXPLICAÇÃO: {full_transcription}"
            
            docs_to_add.append(Document(
                page_content=final_content,
                metadata={
                    "source": item["video_source"],
                    "slide_id": item["id"],
                    "type": "full_slide",
                    "timestamp_start": item["timestamp_start"]
                }
            ))
            print(final_content)
            print("Metadados: ")
            print({
                    "source": item["video_source"],
                    "slide_id": item["id"],
                    "type": "full_slide",
                    "timestamp_start": item["timestamp_start"]
                })
        else:
            # Se a transcrição for longa, aplica Sliding Window APENAS na fala
            # mas mantém o contexto visual fixo em todos os pedaços.
            sub_chunks = text_splitter.split_text(full_transcription)
            
            for i, sub_text in enumerate(sub_chunks):
                # O "Pulo do Gato": O contexto visual é repetido para "ancorar" a fala
                final_content = f"VISÃO DO SLIDE (Contexto Global): {visual_context}\n\nTRECHO DA EXPLICAÇÃO ({i+1}/{len(sub_chunks)}): {sub_text}"
                
                docs_to_add.append(Document(
                    page_content=final_content,
                    metadata={
                        "source": item["video_source"],
                        "slide_id": item["id"],
                        "type": "sub_chunk", # Útil para saber se é fragmento
                        "chunk_index": i,
                        "timestamp_start": item["timestamp_start"] # Nota: o timestamp real seria difícil de calcular exato aqui sem word-level timestamps, então usamos o do slide
                    }
                ))

            print(final_content)
            print("Metadados: ")
            print({
                        "source": item["video_source"],
                        "slide_id": item["id"],
                        "type": "sub_chunk", # Útil para saber se é fragmento
                        "chunk_index": i,
                        "timestamp_start": item["timestamp_start"] # Nota: o timestamp real seria difícil de calcular exato aqui sem word-level timestamps, então usamos o do slide
                    })

        print("=======================================")
    
    return docs_to_add



load_dotenv()

def create_rag():

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        task_type="retrieval_document"
    )
    
    # Usa o HttpClient para falar com o servidor que já está rodando
    # Isso evita conflitos de escrita direta no banco (SQLite lock)
    remote_client = chromadb.HttpClient(host='localhost', port=8000)
    
    # Reset da coleção para garantir que o índice seja reconstruído corretamente pelo servidor
    try:
        remote_client.delete_collection("arquitetura_computadores")
        print("Coleção antiga deletada para reset.")
    except:
        pass

    vector_store = Chroma(
        client=remote_client,
        collection_name="arquitetura_computadores",
        embedding_function=embeddings
    )

    for json_file in os.listdir("./data"):
        print(f"Embedding a {json_file}")
        if json_file.endswith(".json"):
            with open(os.path.join("./data", json_file), "r") as f:
                files_docs = create_documents_smart_slide(json.load(f))
                if files_docs:
                    vector_store.add_documents(files_docs)
                    print(f"Added {len(files_docs)} documents from {json_file}")

    print("All docs are embbeded")


if __name__ == "__main__":
    create_rag()