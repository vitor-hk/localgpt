import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  disabled,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const estimatedTokens = text.trim() ? Math.ceil(text.trim().length / 4) : 0;

  return (
    <div className="p-3 md:px-8 md:pb-5 bg-gradient-to-t from-[#0D0C0B] via-[#0D0C0B] to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl bg-[#141210] border border-[#2B2621] focus-within:border-[#E06D53]/60 shadow-2xl transition-all p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? 'Aguardando conexão com o Ollama...'
                : 'Digite um comando, pergunta ou cole um trecho de código...'
            }
            className="w-full max-h-44 bg-transparent text-sm md:text-[15px] text-[#F5F1EB] placeholder-[#6E665E] focus:outline-none resize-none px-1 py-0.5 leading-relaxed disabled:opacity-50"
          />

          {/* Barra Inferior da Caixa de Comando */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#221E1B]">
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#6E665E]">
              <span className="hidden sm:inline-flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-[#E06D53]" />
                Enter envia
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Shift + Enter quebra linha</span>
              {estimatedTokens > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#1F1C18] text-[#D6C7B2]">
                  ~{estimatedTokens} tokens
                </span>
              )}
            </div>

            {isStreaming ? (
              <button
                onClick={onStopGeneration}
                title="Interromper inferência"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-mono transition-all"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Parar</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || disabled}
                title="Enviar comando"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E06D53] hover:bg-[#EB7960] disabled:bg-[#221E1B] disabled:text-[#5C554E] text-[#0D0C0B] font-semibold text-xs transition-all shadow-sm"
              >
                <span>Enviar</span>
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
