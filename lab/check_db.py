
import chromadb
client = chromadb.HttpClient(host='localhost', port=8000)
collections = client.list_collections()
for col in collections:
    print(f"Collection: {col.name}")
    print(f"Count: {col.count()}")
