import React, { useEffect, useRef } from 'react';
import { Terminal, Code2, BookOpen, Cpu, Compass, ArrowUpRight } from 'lucide-react';
import { Message, OllamaStatus } from '../types/chat';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  status: OllamaStatus;
  onSelectSuggestion: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    tag: 'ARQUITETURA & BACKEND',
    icon: Code2,
    title: 'API REST Assíncrona em FastAPI',
    prompt: 'Escreva uma API REST minimalista em Python usando FastAPI com validação Pydantic e tratamento de erros.',
  },
  {
    tag: 'FUNDAMENTOS DE IA',
    icon: BookOpen,
    title: 'Mecanismo de Self-Attention',
    prompt: 'Explique de forma clara e didática como funciona a arquitetura Transformer e o mecanismo de Self-Attention.',
  },
  {
    tag: 'SISTEMAS DISTRIBUÍDOS',
    icon: Cpu,
    title: 'Concorrência vs Paralelismo',
    prompt: 'Qual a diferença prática entre concorrência e paralelismo? Dê exemplos reais de engenharia de software.',
  },
  {
    tag: 'PROJETOS & RAG',
    icon: Compass,
    title: 'Arquitetura RAG Local',
    prompt: 'Como estruturar um pipeline de RAG (Retrieval-Augmented Generation) 100% local utilizando Ollama e banco vetorial?',
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  status,
  onSelectSuggestion,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!status.online || status.models.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-architectural-grid">
        <div className="max-w-xl w-full bg-[#141210] border border-[#2B2621] rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E06D53]/15 border border-[#E06D53]/30 flex items-center justify-center text-[#E06D53] shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#F5F1EB]">
                {!status.online
                  ? 'Motor Ollama Desconectado'
                  : 'Nenhum Modelo Detectado'}
              </h2>
              <p className="text-xs text-[#8A8178]">
                {status.error ||
                  'Baixe um modelo LLM no seu terminal para liberar o estúdio de conversa.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs bg-[#0D0C0B] p-4 rounded-xl border border-[#24201C] font-mono text-[#C7BFB5]">
            <p className="text-[#E06D53] uppercase tracking-wider text-[10px]">
              Diagnóstico Rápido no Terminal:
            </p>
            <div className="space-y-2">
              <div>
                <span className="text-[#6E665E]"># 1. Inicie o serviço local</span>
                <pre className="mt-1 p-2 rounded bg-[#141210] text-[#F5F1EB]">ollama serve</pre>
              </div>
              <div>
                <span className="text-[#6E665E]"># 2. Baixe um modelo (ex: Llama 3.2)</span>
                <pre className="mt-1 p-2 rounded bg-[#141210] text-[#F5F1EB]">ollama pull llama3.2</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-10 flex flex-col items-center justify-center bg-architectural-grid">
        <div className="max-w-3xl w-full space-y-8">
          {/* Hero Editorial */}
          <div className="space-y-3 text-center sm:text-left px-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161412] border border-[#2B2621] text-[11px] font-mono text-[#D6C7B2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E06D53]" />
              WORKSTATION DE IA ON-PREMISE
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-[#F5F1EB] tracking-tight leading-tight">
              O que vamos construir ou analisar hoje?
            </h2>
            <p className="text-sm text-[#8A8178] max-w-xl leading-relaxed">
              Ambiente de inferência privada executando diretamente no hardware do seu Mac. Selecione um ponto de partida ou envie um comando abaixo.
            </p>
          </div>

          {/* Grid de Cards Editorial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SUGGESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(item.prompt)}
                  className="p-4 rounded-2xl bg-[#141210]/90 hover:bg-[#1A1714] border border-[#26221E] hover:border-[#E06D53]/50 transition-all group flex flex-col justify-between text-left shadow-lg"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#E06D53]">
                        {item.tag}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#5C554E] group-hover:text-[#E06D53] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F1EB]">
                      <Icon className="w-4 h-4 text-[#D6C7B2] shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-[#8A8178] group-hover:text-[#B8AFA6] line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-architectural-grid">
      <div className="py-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
      </div>
      <div ref={bottomRef} className="h-6" />
    </div>
  );
};
