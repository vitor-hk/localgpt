import React from 'react';
import { Cpu, Menu, RefreshCw, Layers, Activity, AlertCircle } from 'lucide-react';
import { ModelInfo, OllamaStatus } from '../types/chat';

interface HeaderProps {
  status: OllamaStatus;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onRefreshStatus: () => void;
  isRefreshing: boolean;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  selectedModel,
  onSelectModel,
  onRefreshStatus,
  isRefreshing,
  onOpenMobileSidebar,
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  const activeModelObj = status.models.find((m) => m.name === selectedModel);

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 bg-[#0D0C0B]/80 backdrop-blur-xl border-b border-[#1F1C18]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[#9E958B] hover:text-[#F5F1EB] bg-[#161412] border border-[#26221E]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Seletor de Modelo Estilo Pill */}
        <div className="flex items-center gap-2 bg-[#141210] border border-[#292420] hover:border-[#3D352E] rounded-xl px-3 py-1.5 transition-colors shadow-sm">
          <Cpu className="w-4 h-4 text-[#E06D53] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#6E665E] leading-none">
              Modelo Ativo
            </span>
            {status.online && status.models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-semibold text-[#F5F1EB] focus:outline-none cursor-pointer pr-2 mt-0.5"
                aria-label="Selecionar modelo LLM"
              >
                {status.models.map((m: ModelInfo) => (
                  <option key={m.name} value={m.name} className="bg-[#141210] text-[#F5F1EB]">
                    {m.name} {m.size ? `(${formatSize(m.size)})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-[#8A8178] mt-0.5">
                {status.online ? 'Sem modelos' : 'Motor Offline'}
              </span>
            )}
          </div>

          {activeModelObj?.parameter_size && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#1F1C18] text-[#D6C7B2] border border-[#302A24]">
              {activeModelObj.parameter_size}
            </span>
          )}

          {activeModelObj?.quantization_level && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#E06D53]/10 text-[#E06D53] border border-[#E06D53]/20">
              <Layers className="w-2.5 h-2.5" />
              {activeModelObj.quantization_level}
            </span>
          )}
        </div>

        <button
          onClick={onRefreshStatus}
          disabled={isRefreshing}
          title="Sincronizar modelos com o Ollama"
          className="p-2.5 rounded-xl bg-[#141210] hover:bg-[#1F1C18] text-[#9E958B] hover:text-[#F5F1EB] border border-[#292420] transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#E06D53]' : ''}`}
          />
        </button>
      </div>

      {/* Status de Conexão */}
      <div className="flex items-center gap-3">
        {status.online ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141210] border border-[#292420]">
            <span className="w-2 h-2 rounded-full bg-[#E06D53] shadow-[0_0_8px_#E06D53]" />
            <span className="text-[11px] font-mono text-[#C7BFB5] hidden sm:inline">
              OLLAMA ENGINE READY
            </span>
            <Activity className="w-3.5 h-3.5 text-[#E06D53]" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-800/40 text-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] font-mono">ENGINE OFFLINE</span>
          </div>
        )}
      </div>
    </header>
  );
};
