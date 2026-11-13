import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, TriangleAlert, Sparkles, Terminal } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const timeFormatted = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const wordCount = message.content.trim()
    ? message.content.trim().split(/\s+/).length
    : 0;

  // Layout Assimétrico: Mensagem do Usuário à Direita
  if (isUser) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="max-w-3xl mx-auto flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-[11px] font-medium text-[#8A8178]">Você</span>
            <span className="text-[10px] font-mono text-[#5C554E]">{timeFormatted}</span>
          </div>
          <div className="max-w-[88%] md:max-w-[78%] rounded-2xl rounded-tr-xs bg-[#1E1B18] border border-[#332D27] px-5 py-3.5 text-[#F5F1EB] shadow-lg">
            <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Layout Editorial: Resposta da IA à Esquerda
  return (
    <div className="py-5 px-4 md:px-8 group">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-md ${
            message.isError
              ? 'bg-red-950/40 text-red-400 border-red-800/50'
              : 'bg-[#181512] text-[#E06D53] border-[#2E2822]'
          }`}
        >
          {message.isError ? (
            <TriangleAlert className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-semibold tracking-wide text-[#F5F1EB]">
              LocalGPT
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181512] text-[#8A8178] border border-[#26221E]">
              {timeFormatted}
            </span>
            {isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#E06D53]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E06D53] animate-ping" />
                gerando...
              </span>
            )}
          </div>

          {message.isError ? (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-red-300 text-sm">
              {message.content}
            </div>
          ) : (
            <div className="pl-3 border-l-2 border-[#26221E] group-hover:border-[#E06D53]/40 transition-colors">
              {message.content === '' && isStreaming ? (
                <div className="flex items-center gap-2 py-3 text-xs font-mono text-[#8A8178]">
                  <span className="w-2 h-2 rounded-full bg-[#E06D53] animate-pulse" />
                  Processando tensores localmente...
                </div>
              ) : (
                <div className="text-[#E6E0D6] text-sm md:text-[15px] leading-7 space-y-3 break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-[#E06D53]">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-[#E06D53] marker:font-mono">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      h1: ({ children }) => (
                        <h1 className="font-serif-editorial text-2xl text-[#F5F1EB] mt-5 mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-[#F5F1EB] mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-[#F5F1EB] mt-3 mb-1.5">
                          {children}
                        </h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#E06D53] bg-[#141210] px-4 py-2 rounded-r-xl italic text-[#B8AFA6] my-3">
                          {children}
                        </blockquote>
                      ),
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const isInline = !match && !codeString.includes('\n');

                        if (isInline) {
                          return (
                            <code
                              className="px-1.5 py-0.5 rounded-md bg-[#1C1916] border border-[#2E2924] text-[#F09A84] font-mono text-[13px]"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        const language = match ? match[1] : 'snippet';
                        const lineCount = codeString.split('\n').length;
                        const isCopied = copiedCode === codeString;

                        return (
                          <div className="my-4 rounded-xl overflow-hidden border border-[#2B2622] bg-[#090807] shadow-xl">
                            {/* Barra superior estilo macOS */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#141210] border-b border-[#24201C] text-xs">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#3A332C]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#3A332C]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#E06D53]/70" />
                                </div>
                                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#B8AFA6]">
                                  <Terminal className="w-3 h-3 text-[#E06D53]" />
                                  {language}
                                </span>
                                <span className="text-[10px] font-mono text-[#6E665E]">
                                  {lineCount} {lineCount === 1 ? 'linha' : 'linhas'}
                                </span>
                              </div>

                              <button
                                onClick={() => handleCopyCode(codeString)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F1C18] hover:bg-[#2B2621] border border-[#302A24] text-[#D6C7B2] transition-colors font-mono text-[11px]"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#E06D53]" />
                                    <span className="text-[#E06D53]">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs md:text-[13px] font-mono text-[#EAE5DF] leading-relaxed">
                              <code>{codeString}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Rodapé de Ações da Resposta */}
              {!isStreaming && message.content && (
                <div className="mt-3 pt-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopyFullMessage}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A8178] hover:text-[#F5F1EB] transition-colors"
                  >
                    {copiedFull ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#E06D53]" />
                        <span className="text-[#E06D53]">Resposta copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar resposta</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] font-mono text-[#5C554E]">
                    {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
