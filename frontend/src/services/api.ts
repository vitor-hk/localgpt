import { Message, OllamaStatus } from '../types/chat';

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchOllamaStatus(): Promise<OllamaStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      online: false,
      models: [],
      error:
        'Backend FastAPI indisponível em localhost:8000. Certifique-se de que o servidor Python está rodando.',
    };
  }
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (errorMsg: string) => void;
}

export async function streamChatCompletion(
  model: string,
  messages: Message[],
  signal: AbortSignal,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const payload = {
      model,
      messages: messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok || !response.body) {
      callbacks.onError(`Falha na comunicação com o servidor (Status ${response.status}).`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.error) {
            callbacks.onError(parsed.error);
            return;
          }
          if (parsed.content) {
            callbacks.onToken(parsed.content);
          }
          if (parsed.done) {
            callbacks.onComplete();
            return;
          }
        } catch {
          // Ignora linhas parciais malformadas
        }
      }
    }

    callbacks.onComplete();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onComplete();
      return;
    }
    callbacks.onError(
      err instanceof Error ? err.message : 'Erro desconhecido ao processar resposta do modelo.'
    );
  }
}
