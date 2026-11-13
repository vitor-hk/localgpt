export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
  parameter_size?: string;
  quantization_level?: string;
}

export interface OllamaStatus {
  online: boolean;
  models: ModelInfo[];
  error?: string | null;
}
