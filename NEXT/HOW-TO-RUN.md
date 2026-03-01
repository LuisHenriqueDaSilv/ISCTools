# Como rodar o projeto ISCTools (NEXT)

Este guia descreve todas as etapas para executar o projeto localmente, incluindo o banco PostgreSQL, o vector store local (HNSWLib), a população do RAG e a aplicação Next.js.

---

## 1. Pré-requisitos

- **Node.js** 20 ou superior (recomendado 22.x)
- **npm** (ou pnpm/yarn)
- **Docker** e **Docker Compose** (para PostgreSQL)
- **Chave de API do Google Gemini** ([obter aqui](https://aistudio.google.com/apikey)) — obrigatória para o chat e para popular o RAG

---

## 2. Instalar dependências

Na raiz do projeto Next.js:

```bash
cd ISCTools/NEXT
npm install --legacy-peer-deps
```

(O `--legacy-peer-deps` evita conflitos de peer dependencies com o Zod e outras libs.)

---

## 3. Variáveis de ambiente

Crie um ficheiro `.env` na pasta `ISCTools/NEXT` com as variáveis necessárias.

### Mínimo para Lamarzito-Tutor (chat com RAG + BYOK)

```env
# Base de dados (usado pelo docker-compose e pela app)
DATABASE_URL="postgresql://lamarzito:lamarzito_secret@localhost:5432/lamarzito"

# Só é obrigatória para o script de popular o RAG e para a página /lamarzito (chat antigo)
# No Lamarzito-Tutor a chave é inserida pelo utilizador no frontend (BYOK)
GEMINI_API_KEY="sua-chave-gemini"
```

### Opcionais

| Variável | Descrição |
|----------|-----------|
| `DATA_PATH` | Caminho absoluto para a pasta com os JSONs `*_enriched.json`. Se não definido, usa `../Data` em relação à pasta NEXT. |
| `VECTOR_STORE_PATH` | Pasta onde o HNSWLib guarda o índice (hnswlib.index, docstore.json, args.json). Se não definido, usa `./data/vectorstore`. |
| `NEXT_PUBLIC_API_URL` | URL base da API (se a app chamar APIs externas). |
| `JWT_SECRET_KEY` | Chave para JWT (se usar autenticação). |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth (se usar login com Google). |

---

## 4. Subir o PostgreSQL e aplicar migrações

O projeto inclui um `docker-compose.yml` que sobe o PostgreSQL e corre as migrações do Prisma.

```bash
cd ISCTools/NEXT
docker compose up -d
```

- O serviço **db** (PostgreSQL) fica à escuta na porta **5432**.
- O serviço **migrate** corre uma vez após o Postgres estar pronto e aplica as migrações (tabelas `Conversation` e `Message`).

Verificar se o contentor está saudável:

```bash
docker compose ps
```

A `DATABASE_URL` no `.env` deve ser exatamente a do comentário no `docker-compose.yml` (com `localhost` quando a app corre na máquina local):

```env
DATABASE_URL="postgresql://lamarzito:lamarzito_secret@localhost:5432/lamarzito"
```

---

## 5. Popular o vector store (RAG) — uma vez

O Lamarzito e o Lamarzito-Tutor usam um índice vetorial local (HNSWLib) para buscar conteúdo das disciplinas. **Não é necessário correr nenhum servidor** (Chroma, etc.): o índice fica guardado em ficheiros na pasta definida por `VECTOR_STORE_PATH` (por defeito `./data/vectorstore`).

Antes de usar o chat com conteúdo das disciplinas, é necessário popular o índice com os chunks dos JSONs em `Data`:

1. Garanta que:
   - A variável **GEMINI_API_KEY** está definida no `.env` (o script usa-a para os embeddings).
   - Os ficheiros `*_enriched.json` estão na pasta **Data** (ou no caminho definido em `DATA_PATH`).

2. Execute o script:

```bash
cd ISCTools/NEXT
npm run populate-rag
```

O script:

- Lê todos os `*enriched*.json` em `Data` (e subpastas como `RESULTADO-FINAL-AULAS-OAC`, `RESULTADO-FINAL-VIDEOSYOUTUBE-ISC`).
- Gera chunks (slide + transcrição), calcula embeddings e grava o índice HNSWLib na pasta do vector store.
- Apaga o índice antigo e recria (idempotente). Pode ser executado de novo para repopular.

Só é necessário correr este passo **uma vez** (ou quando houver novos JSONs).

---

## 6. Rodar a aplicação Next.js

Em modo desenvolvimento:

```bash
cd ISCTools/NEXT
npm run dev
```

A aplicação fica disponível em **http://localhost:3000**.

### Páginas principais

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/lamarzito` | Chat antigo: usa `GEMINI_API_KEY` do servidor e o índice vetorial local. Requer a chave no `.env` e ter corrido `npm run populate-rag`. |
| `/lamarzito-tutor` | Chat com RAG agentic e **BYOK**: o utilizador coloca a chave Gemini no frontend (guardada em `localStorage`). Mensagens e contexto são guardados no PostgreSQL. Requer Postgres + ter corrido `npm run populate-rag` pelo menos uma vez. |
| Outras | Bases numéricas, IEEE 754, Assembler, Disassembler, etc. |

### Lamarzito-Tutor (resumo)

1. Abrir **http://localhost:3000/lamarzito-tutor**.
2. Inserir e guardar a **chave da API Gemini** no campo indicado.
3. Enviar mensagens; o histórico fica associado a uma conversa (guardada no PostgreSQL). Pode usar **Nova conversa** para iniciar outra thread.

---

## 7. Build para produção (opcional)

```bash
cd ISCTools/NEXT
npm run build
npm run start
```

**Nota:** Com Prisma 7 e Next.js 16 (Turbopack), o build pode falhar ao empacotar módulos do Prisma. Em desenvolvimento (`npm run dev`) costuma funcionar. Para produção, garanta que `DATABASE_URL` está definido e, se necessário, consulte a documentação do Next.js e do Prisma para configuração de `serverExternalPackages` ou uso de webpack.

---

## 8. Resumo rápido (ordem sugerida)

```bash
# 1. Dependências
cd ISCTools/NEXT && npm install --legacy-peer-deps

# 2. .env com DATABASE_URL e GEMINI_API_KEY (ver secção 3)

# 3. PostgreSQL + migrações
docker compose up -d

# 4. Popular o RAG (uma vez) — grava o índice em ./data/vectorstore
npm run populate-rag

# 5. App
npm run dev
# Abrir http://localhost:3000/lamarzito-tutor e configurar a chave Gemini no frontend
```

---

## 9. Problemas comuns

- **"Module not found: query_compiler_bg.postgresql..."** — O cliente gerado pelo Prisma 7 referencia um runtime que não existe no pacote instalado. Use `npm run generate` em vez de `prisma generate`: o script aplica um patch que troca para `query_compiler_fast_bg`. Se já tiver corrido `prisma generate`, execute `node scripts/patch-prisma-wasm.js` e volte a tentar.
- **"DATABASE_URL is not set"** — Criar `.env` na pasta `ISCTools/NEXT` com `DATABASE_URL` (ver secção 3).
- **"O índice do conteúdo da disciplina não foi encontrado"** — Executar `npm run populate-rag` pelo menos uma vez para criar o vector store em `./data/vectorstore` (ou no caminho definido em `VECTOR_STORE_PATH`).
- **Nenhum ficheiro encontrado no populate-rag** — Verificar se a pasta `Data` (ou `DATA_PATH`) contém ficheiros `*_enriched.json`.
- **Falha nas migrações** — Garantir que o contentor `db` está saudável (`docker compose ps`) e que a `DATABASE_URL` no `migrate` usa o hostname `db` (já definido no `docker-compose.yml`).
