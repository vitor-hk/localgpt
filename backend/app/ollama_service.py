import json
import httpx
from typing import AsyncGenerator, List
from .schemas import ChatMessage, ModelInfo, OllamaStatusResponse

OLLAMA_BASE_URL = "http://localhost:11434"


class OllamaService:
    @staticmethod
    async def check_status_and_models() -> OllamaStatusResponse:
        """Verifica se o Ollama está em execução e retorna a lista de modelos instalados."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                response.raise_for_status()
                data = response.json()

                models: List[ModelInfo] = []
                for item in data.get("models", []):
                    details = item.get("details", {})
                    models.append(
                        ModelInfo(
                            name=item.get("name", ""),
                            size=item.get("size"),
                            modified_at=item.get("modified_at"),
                            parameter_size=details.get("parameter_size"),
                            quantization_level=details.get("quantization_level"),
                        )
                    )
                return OllamaStatusResponse(online=True, models=models)
        except httpx.ConnectError:
            return OllamaStatusResponse(
                online=False,
                models=[],
                error="Não foi possível conectar ao Ollama em localhost:11434. Verifique se o serviço está ativo.",
            )
        except Exception as exc:
            return OllamaStatusResponse(
                online=False,
                models=[],
                error=f"Erro ao consultar o Ollama: {str(exc)}",
            )

    @staticmethod
    async def stream_chat(
        model: str, messages: List[ChatMessage]
    ) -> AsyncGenerator[str, None]:
        """Envia o histórico da conversa para o Ollama e faz streaming de chunks NDJSON."""
        payload = {
            "model": model,
            "messages": [msg.model_dump() for msg in messages],
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        yield json.dumps(
                            {
                                "error": f"Erro do Ollama ({response.status_code}): {error_body.decode('utf-8', errors='ignore')}"
                            }
                        ) + "\n"
                        return

                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk = json.loads(line)
                            content = chunk.get("message", {}).get("content", "")
                            done = chunk.get("done", False)
                            yield json.dumps({"content": content, "done": done}) + "\n"
                        except json.JSONDecodeError:
                            continue
        except httpx.ConnectError:
            yield json.dumps(
                {"error": "Conexão recusada pelo Ollama. O servidor local foi encerrado."}
            ) + "\n"
        except Exception as exc:
            yield json.dumps({"error": f"Falha durante a geração: {str(exc)}"}) + "\n"
