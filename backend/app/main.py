from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .schemas import ChatRequest, OllamaStatusResponse
from .ollama_service import OllamaService

app = FastAPI(
    title="LocalGPT API",
    description="Backend intermediário para comunicação local com Ollama via streaming",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status", response_model=OllamaStatusResponse)
async def get_status():
    """Retorna o status do servidor Ollama e a lista de modelos instalados localmente."""
    return await OllamaService.check_status_and_models()


@app.post("/api/chat")
async def chat_stream(request: ChatRequest):
    """Inicia uma sessão de chat com streaming de resposta em tempo real (NDJSON)."""
    return StreamingResponse(
        OllamaService.stream_chat(request.model, request.messages),
        media_type="application/x-ndjson",
    )
