"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { useChatSession } from "@/components/chat/useChatSession";

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  initialMessage?: string;
  landingCategory?: string; // 랜딩 페이지에서 전달된 카테고리
}

export function ChatWidget({ isOpen, onClose, onMinimize, initialMessage, landingCategory }: ChatWidgetProps) {
  const { messages, isLoading, authLoaded, userId, send } = useChatSession({ landingCategory });
  const [input, setInput] = useState(initialMessage || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      setInput(initialMessage);
    }
  }, [initialMessage, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("chat-widget-open");
    } else {
      document.body.classList.remove("chat-widget-open");
    }
    return () => {
      document.body.classList.remove("chat-widget-open");
    };
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    void send(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[600px] bg-white rounded-2xl shadow-xl border-transparent flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-100 text-brand-green-primary rounded-t-2xl overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
          <MessageCircle className="w-5 h-5 text-brand-green-primary flex-shrink-0" />
          <h3 className="font-medium text-brand-green-primary truncate">AI 어시스턴트</h3>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 hover:bg-brand-green/10 rounded transition-colors"
              aria-label="최소화"
            >
              <Minimize2 className="w-4 h-4 text-brand-green-primary" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-brand-green/10 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-brand-green-primary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
        <ChatMessages messages={messages} isLoading={isLoading} onCategorySelect={(name) => void send(name)} />
        <div ref={messagesEndRef} />
      </div>

      {/* 교사 혜택 프로모션 배너 */}
      <a
        href="/programs/cardnews_hanatour_zeus_teacher_benefits_2026"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-2 bg-brand-green/10 border-t border-brand-green/20 text-sm font-medium text-brand-green hover:bg-brand-green/15 transition-colors"
      >
        <span>🎓 교사·교사가족 특별혜택 보기</span>
        <span aria-hidden="true">→</span>
      </a>

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        {!userId && authLoaded && (
          <div className="mb-2 space-y-1">
            <p className="text-xs text-text-gray">
              비로그인 상태에서도 현재 창에서는 대화 맥락이 유지됩니다. 브라우저 종료 시 기록은 사라집니다.
            </p>
            <p className="text-xs text-text-gray">로그인하면 대화 저장/이어보기로 상담을 끊김 없이 진행할 수 있습니다.</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 text-sm border-none outline-none text-text-dark placeholder:text-gray-400 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-green-primary/20"
            disabled={!authLoaded || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!authLoaded || !input.trim() || isLoading}
            className="p-2 hover:opacity-70 transition-opacity disabled:opacity-30"
          >
            <Send className="w-5 h-5 text-brand-green-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
