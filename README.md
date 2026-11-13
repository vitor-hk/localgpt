<div align="center">

# LocalGPT Studio

**Interface de Chat e Estúdio de Inferência Local para LLMs via Ollama**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Ollama](https://img.shields.io/badge/Engine-Ollama-000000?style=flat-square)

</div>

---

## Sobre o Projeto

O **LocalGPT Studio** é uma aplicação web Full Stack projetada para executar e interagir com Modelos de Linguagem de Grande Escala (LLMs) **100% localmente**, utilizando o **Ollama** como motor de inferência. 

Com identidade visual autoral (*Obsidian & Terracotta Studio*), a aplicação oferece baixa latência via streaming assíncrono, total privacidade de dados (zero chamadas externas ou chaves de API pagas) e experiência de usuário voltada para desenvolvedores.

### Preview da Interface

<p align="center">
  <img src="docs/captura1.png" alt="Interface LocalGPT Studio - Captura 1" width="100%" />
</p>
<p align="center">
  <img src="docs/captura2.png" alt="Interface LocalGPT Studio - Captura 2" width="100%" />
</p>

---

## Principais Funcionalidades

- **Streaming Assíncrono em Tempo Real:** Recebimento de respostas token a token via protocolo `application/x-ndjson` e `ReadableStream`.
- **Controle de Inferência (`AbortController`):** Interrupção instantânea de gerações em andamento diretamente pela interface.
- **Descoberta Automática de Modelos:** Listagem dinâmica dos modelos instalados no Ollama com exibição de tamanho em disco, número de parâmetros e nível de quantização.
- **Renderização Editorial em Markdown:** Suporte completo a GFM (tabelas, listas, citações) e blocos de código estilo macOS com contador de linhas e cópia rápida.
- **Gestão de Sessões Locais:** Histórico persistente com busca instantânea de conversas, estimativa de tokens em tempo real e armazenamento isolado via `localStorage`.
- **Diagnóstico de Conexão:** Detecção automática de indisponibilidade do backend ou do servidor Ollama com instruções interativas de recuperação.

---

## Arquitetura do Sistema

```text
localgpt/
├── backend/                  # API REST & Túnel de Streaming (Python + FastAPI)
│   ├── app/
│   │   ├── main.py           # Endpoints REST (/api/status, /api/chat) e CORS
│   │   ├── ollama_service.py # Cliente assíncrono HTTPX integrado ao Ollama (:11434)
│   │   └── schemas.py        # Contratos e validação de dados (Pydantic v2)
│   └── requirements.txt
│
└── frontend/                 # Interface Reativa (React + TypeScript + Tailwind CSS)
    ├── src/
    │   ├── components/       # Sidebar, Header, ChatArea, MessageBubble, ChatInput
    │   ├── services/         # Consumo de API e decodificador de stream NDJSON
    │   └── types/            # Contratos TypeScript
    └── package.json
```

---

## Como Executar Localmente

### Pré-requisitos
- [Ollama](https://ollama.com/) instalado e em execução (`ollama serve`).
- Pelo menos um modelo baixado (ex: `ollama pull llama3.2`).
- **Python 3.10+** e **Node.js 18+**.

### 1. Clonar o repositório
```bash
git clone [https://github.com/SEU-USUARIO/localgpt.git](https://github.com/SEU-USUARIO/localgpt.git)
cd localgpt
```

### 2. Iniciar o Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Iniciar o Frontend (React + Vite)
Em um novo terminal:
```bash
cd frontend
npm install
npm run dev
```

Acesse **`http://localhost:5173`** no navegador.

---

## Licença

Distribuído sob a licença MIT.
