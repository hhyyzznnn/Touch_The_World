"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { PROGRAM_CATEGORIES } from "@/lib/constants";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showCategoryButtons?: boolean;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  initialMessage?: string;
  landingCategory?: string; // 랜딩 페이지에서 전달된 카테고리
}

export function ChatWidget({ isOpen, onClose, onMinimize, initialMessage, landingCategory }: ChatWidgetProps) {
  const getInitialMessage = () => {
    if (landingCategory) {
      return `안녕하세요! 터치더월드 AI 어시스턴트입니다.

${landingCategory} 상담을 도와드리겠습니다. 예상 인원과 희망 지역을 알려주시면 맞춤형 일정을 제안해드리겠습니다!`;
    }
    return `안녕하세요! 터치더월드 AI 어시스턴트입니다.

어떤 프로그램에 관심이 있으신가요? 아래 버튼을 클릭하시거나 직접 입력해주세요!`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getInitialMessage(),
      timestamp: new Date(),
      showCategoryButtons: !landingCategory,
    },
  ]);
  const [input, setInput] = useState(initialMessage || "");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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
      // 초기 메시지가 있으면 자동으로 전송할 수도 있음
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

  const handleCategoryClick = (categoryName: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: categoryName,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    handleSendMessage(categoryName);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || input.trim();
    if (!contentToSend || isLoading) return;

    if (!messageContent) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    }
    
    setIsLoading(true);

    try {
      // OpenAI API 호출
      const allMessages = messageContent 
        ? [...messages, { id: Date.now().toString(), role: "user" as const, content: messageContent, timestamp: new Date() }]
        : messages;
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: allMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          sessionId: sessionId,
          landingCategory: landingCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("API 호출 실패");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
        showCategoryButtons: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("채팅 오류:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    await handleSendMessage();
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-brand-green-primary text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {/* Category Buttons */}
            {message.showCategoryButtons && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {PROGRAM_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-100 rounded-lg hover:bg-brand-green/5 transition-all"
                      >
                        <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center justify-center mb-1">
                          <Icon className="w-4 h-4 text-brand-green" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 text-center leading-tight whitespace-pre-line">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 text-sm border-none outline-none text-text-dark placeholder:text-gray-400 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-green-primary/20"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 hover:opacity-70 transition-opacity disabled:opacity-30"
          >
            <Send className="w-5 h-5 text-brand-green-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

