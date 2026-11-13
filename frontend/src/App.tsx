import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, OllamaStatus } from './types/chat';
import { fetchOllamaStatus, streamChatCompletion } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';

const STORAGE_KEY = 'localgpt_conversations_v1';
const MODEL_STORAGE_KEY = 'localgpt_selected_model_v1';

export const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    return conversations.length > 0 ? conversations[0].id : null;
  });

  const [status, setStatus] = useState<OllamaStatus>({
    online: false,
    models: [],
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE_KEY) || '';
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Erro ao salvar histórico no localStorage:', e);
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    }
  }, [selectedModel]);

  const checkStatus = useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchOllamaStatus();
    setStatus(result);

    if (result.online && result.models.length > 0) {
      setSelectedModel((prev) => {
        const exists = result.models.some((m) => m.name === prev);
        return exists ? prev : result.models[0].name;
      });
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const handleNewConversation = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    setActiveId(null);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStreaming && activeId === id) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!status.online || !selectedModel) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMsgId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    let targetConvId = activeId;
    let historyForApi: Message[] = [];

    if (!targetConvId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: content.slice(0, 42) + (content.length > 42 ? '...' : ''),
        model: selectedModel,
        messages: [userMsg, assistantPlaceholder],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      targetConvId = newConv.id;
      historyForApi = [userMsg];
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
    } else {
      const current = conversations.find((c) => c.id === targetConvId);
      historyForApi = current ? [...current.messages, userMsg] : [userMsg];

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                model: selectedModel,
                messages: [...c.messages, userMsg, assistantPlaceholder],
                updatedAt: Date.now(),
              }
            : c
        )
      );
    }

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamChatCompletion(selectedModel, historyForApi, controller.signal, {
      onToken: (token) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== targetConvId) return conv;
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: m.content + token } : m
              ),
              updatedAt: Date.now(),
            };
          })
        );
      },
      onComplete: () => {
        setIsStreaming(false);
      },
      onError: (errorMsg) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== targetConvId) return conv;
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: errorMsg, isError: true }
                  : m
              ),
            };
          })
        );
        setIsStreaming(false);
      },
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0D0C0B] text-[#EAE5DF]">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => {
          if (isStreaming) handleStopGeneration();
          setActiveId(id);
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          status={status}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onRefreshStatus={checkStatus}
          isRefreshing={isRefreshing}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <ChatArea
          messages={activeConversation ? activeConversation.messages : []}
          isStreaming={isStreaming}
          status={status}
          onSelectSuggestion={handleSendMessage}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          disabled={!status.online || status.models.length === 0}
        />
      </div>
    </div>
  );
};

export default App;
