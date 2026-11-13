from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    model: str = Field(..., min_length=1, description="Nome do modelo instalado no Ollama")
    messages: List[ChatMessage] = Field(..., min_length=1)


class ModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    modified_at: Optional[str] = None
    parameter_size: Optional[str] = None
    quantization_level: Optional[str] = None


class OllamaStatusResponse(BaseModel):
    online: bool
    models: List[ModelInfo] = []
    error: Optional[str] = None
