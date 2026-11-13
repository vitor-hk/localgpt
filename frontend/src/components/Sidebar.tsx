import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  X,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 md:p-3 flex flex-col transition-transform duration-300 ease-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col bg-[#141210] md:rounded-2xl border-r md:border border-[#26221E] shadow-2xl overflow-hidden">
          {/* Cabeçalho da Marca */}
          <div className="p-4 border-b border-[#221E1B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E06D53] to-[#B84A32] p-[1px] shadow-lg shadow-[#E06D53]/15">
                <div className="w-full h-full bg-[#141210] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#E06D53]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-editorial text-xl tracking-wide text-[#F5F1EB] leading-none">
                    LocalGPT
                  </h1>
                  <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#E06D53]/15 text-[#E06D53] border border-[#E06D53]/30">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8178] mt-0.5">
                  Motor de Inferência Privado
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#8A8178] hover:text-[#F5F1EB] hover:bg-[#221E1B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ação Principal e Busca */}
          <div className="p-3 space-y-2.5">
            <button
              onClick={() => {
                onNewConversation();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E06D53] to-[#CC5940] hover:from-[#EB7960] hover:to-[#D9644A] text-[#0D0C0B] font-semibold text-xs tracking-wide transition-all shadow-md shadow-[#E06D53]/10 group"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5] transition-transform group-hover:rotate-90" />
                NOVA SESSÃO DE CHAT
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-[#0D0C0B]/80">
                ⌘N
              </kbd>
            </button>

            {conversations.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6E665E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar histórico..."
                  className="w-full bg-[#0D0C0B] border border-[#26221E] focus:border-[#E06D53]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#EAE5DF] placeholder-[#6E665E] focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* Lista de Sessões */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E665E]">
                Sessões Gravadas ({filteredConversations.length})
              </span>
            </div>

            {filteredConversations.length === 0 ? (
              <div className="px-4 py-10 text-center border border-dashed border-[#24201C] rounded-xl my-2">
                <p className="text-xs text-[#6E665E]">
                  {searchQuery
                    ? 'Nenhuma sessão encontrada.'
                    : 'Nenhuma conversa iniciada.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onCloseMobile();
                    }}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-[#1F1C18] text-[#F5F1EB] border-[#38312B] shadow-sm'
                        : 'bg-transparent text-[#9E958B] border-transparent hover:bg-[#191613] hover:text-[#DDD6CE]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#E06D53] rounded-r-full" />
                    )}

                    <div className="flex items-start gap-2.5 min-w-0 flex-1 pl-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isActive ? 'text-[#E06D53]' : 'text-[#5C554E]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium leading-snug">{conv.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#6E665E]">
                          <span className="truncate max-w-[110px]">{conv.model}</span>
                          <span>•</span>
                          <span>{formatDate(conv.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => onDeleteConversation(conv.id, e)}
                      title="Apagar sessão"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#6E665E] hover:text-[#EF4444] hover:bg-[#2A2320] transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Card de Telemetria de Privacidade */}
          <div className="p-3 m-3 mt-1 rounded-xl bg-[#0D0C0B] border border-[#24201C] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#C7BFB5] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E06D53]" />
                Isolamento Local
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-[#8A8178]">
                <Radio className="w-3 h-3 text-[#E06D53] animate-pulse" />
                127.0.0.1
              </span>
            </div>
            <p className="text-[10px] text-[#6E665E] leading-relaxed">
              Execução 100% on-premise via Ollama. Zero telemetria externa.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
