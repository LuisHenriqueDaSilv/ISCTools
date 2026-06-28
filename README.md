<div align="center">
<h1>🖥️ ISCTools 🖥️</h1>
<p><strong>Seu aliado durante a jornada com Introdução Aos Sistemas Computacionais na UnB</strong></p>
<img src="https://github.com/LuisHenriqueDaSilv/ISCTools/blob/main/github/home.png?raw=true" width="80%"/>
</div>

</br>
</br>

## Sobre o projeto
O <a href="https://isc-tools.vercel.app/">ISCTools</a> foi desenvolvido com o intuito de auxiliar e facilitar o processo de aprendizagem das disciplinas <strong>Introdução aos Sistemas Computacionais</strong> e <strong>Organização e Arquitetura de Computadores</strong> da Universidade de Brasília, UnB. Nele, você encontra diversas ferramentas que podem ser utilizadas ao longo do semestre, como calculadoras e conversores, além do <strong>Lamarzito</strong> — um tutor de IA especializado na matéria, capaz de explicar conteúdos, resolver exercícios e usar as próprias ferramentas do ISCTools durante a conversa.

Este repositório contém o <strong>frontend</strong> (aplicação web em React + TypeScript). As funcionalidades de chat com IA dependem do <strong>backend</strong>, mantido em repositório separado — veja a seção <a href="#backend">Backend</a>.

## Ferramentas:

- <strong>✅ Lamarzito — tutor de IA de OAC (chat com streaming, busca nos materiais da disciplina e ferramentas integradas)</strong>
- <strong>✅ Conversor de bases numéricas</strong>
- <strong>✅ Calculadora de imediato para JAL (linguagem de máquina Assembly RISC-V)</strong>
- <strong>✅ Disassembler (conversor de linguagem de máquina para instruções RISC-V)</strong>
- <strong>✅ Assembler (conversor de instruções RISC-V para código de máquina)</strong>
- <strong>✅ Calculadora de ponto flutuante IEEE-754</strong>
- <strong>▶️ Conversor de imagens para data Assembly</strong>
- <strong>🔨 Conversor de músicas para data Assembly</strong>

## Backend

O <strong>Lamarzito</strong> é servido por uma API REST separada, responsável pela autenticação (login com Google + JWT), pelo agente de IA (Gemini + ferramentas RISC-V), pela busca semântica nos materiais da disciplina (RAG) e pelo streaming das respostas.

👉 <strong>Repositório do backend:</strong> <a href="https://github.com/LuisHenriqueDaSilv/ISCTools-backend">LuisHenriqueDaSilv/ISCTools-backend</a>

Pontos de integração relevantes:

- Após o login com Google, o backend devolve um <strong>JWT</strong>, armazenado em cookie e enviado em todas as requisições no header `Authorization: Bearer <token>`.
- A chave da API do Gemini é do próprio usuário (BYOK) e enviada por requisição no header `X-Google-Api-Key` — ela não é armazenada pelo servidor.
- As respostas do chat chegam via <strong>Server-Sent Events (SSE)</strong>, renderizadas em Markdown (GFM) com suporte a LaTeX (KaTeX).

Consulte o README do backend para detalhes de arquitetura, variáveis de ambiente e como subir a API. A documentação interativa da API (Swagger) fica disponível em `/docs`.

## Tecnologias

- <strong>React 18 + TypeScript</strong>
- <strong>Vite</strong> (build e dev server)
- <strong>React Router</strong> (navegação)
- <strong>Axios</strong> (cliente HTTP)
- <strong>@react-oauth/google</strong> (login com Google)
- <strong>react-markdown + remark-gfm + remark-math + rehype-katex</strong> (renderização das respostas)
- <strong>Sass</strong> (estilos)

## Como rodar localmente

Pré-requisito: <strong>Node.js</strong> (18+) e <strong>npm</strong>. Para usar o chat, é preciso ter o <a href="https://github.com/LuisHenriqueDaSilv/ISCTools-backend">backend</a> em execução.

```bash
cd web
npm install

# crie um arquivo .env com:
#   VITE_API_URL=http://localhost:8001      # URL da API do backend
#   VITE_GOOGLE_CLIENT_ID=<seu client id>   # client ID do Google OAuth

npm run dev        # ambiente de desenvolvimento
npm run build      # build de produção
npm run preview    # pré-visualiza o build
```

## Próximas etapas:

- <strong>Refatorar o código para manter os padrões e boas práticas do TypeScript.</strong>
- <strong>Refazer a UI e UX para melhor experiência do usuário.</strong>
- <strong>Concluir os conversores de imagens e músicas para data Assembly.</strong>

## Como contribuir

O <strong>ISCTools</strong> é um projeto de <strong>código aberto</strong>, desenvolvido e mantido por alunos, para alunos. Se você deseja contribuir, fique à vontade para sugerir melhorias, enviar feedbacks ou colaborar com código. <strong>Sua participação é sempre bem-vinda!</strong> 🚀

## Entre em contato
Caso queira entrar em contato com o organizador do projeto, utilize uma das seguintes redes:
- Linkedin: <a href="www.linkedin.com/in/luishenriquedasilv">luishenriquedasilv</a>
- Instagram: <a href="https://www.instagram.com/luishenri.silva">@luishenri.silva</a> 
