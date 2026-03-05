"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, X } from "lucide-react";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import {
  saveChatMessages,
  loadChatMessages,
  clearLegacyAnonymousChatMessages,
  ChatMessage,
} from "@/lib/chat-storage";

interface HeroChatInputProps {
  initialCategory?: string;
}

function createSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function HeroChatInput({ initialCategory }: HeroChatInputProps) {
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [landingCategory, setLandingCategory] = useState<string | undefined>(initialCategory);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(createSessionId);
  const landingCategoryRef = useRef<string | undefined>(landingCategory);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    landingCategoryRef.current = landingCategory;
  }, [landingCategory]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUserId(data?.user?.id ?? null);
      })
      .catch(() => {
        setUserId(null);
      })
      .finally(() => {
        setAuthLoaded(true);
      });
  }, []);

  useEffect(() => {
    const category = searchParams?.get("category") || initialCategory;
    if (category) {
      setLandingCategory(category);
    }
  }, [searchParams, initialCategory]);

  useEffect(() => {
    if (!authLoaded) return;

    // 저장된 채팅 기록 불러오기
    const getInitialMessage = () => {
      const currentLandingCategory = landingCategoryRef.current;
      if (currentLandingCategory) {
        return `안녕하세요! 터치더월드 AI 어시스턴트입니다.\n\n${currentLandingCategory} 상담을 도와드리겠습니다. 예상 인원과 희망 지역을 알려주시면 맞춤형 일정을 제안해드리겠습니다!`;
      }
      return `안녕하세요! 터치더월드 AI 어시스턴트입니다.\n\n어떤 프로그램에 관심이 있으신가요? 아래 버튼을 클릭하시거나 직접 입력해주세요!`;
    };

    if (!userId) {
      clearLegacyAnonymousChatMessages();
      setMessages([{
        id: "1",
        role: "assistant",
        content: getInitialMessage(),
        timestamp: new Date(),
        showCategoryButtons: !landingCategoryRef.current,
      }]);
      setSessionId(createSessionId());
      setIsChatting(false);
      setIsExpanded(false);
      return;
    }

    const loaded = loadChatMessages({ userId, enabled: true });
    if (loaded.messages.length > 0) {
      setMessages(loaded.messages);
      setIsChatting(true);
      // 저장된 기록이 있어도 처음에는 확장하지 않음
      setIsExpanded(false);
      if (loaded.sessionId) {
        setSessionId(loaded.sessionId);
      }
    } else {
      setMessages([{
        id: "1",
        role: "assistant",
        content: getInitialMessage(),
        timestamp: new Date(),
        showCategoryButtons: !landingCategoryRef.current,
      }]);
      setSessionId(createSessionId());
      setIsChatting(false);
      setIsExpanded(false);
    }
  }, [authLoaded, userId]);

  useEffect(() => {
    // 채팅 중일 때만 채팅 영역 내부 스크롤 (페이지 전체 스크롤 방지)
    if (isChatting && messages.length > 1 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isChatting]);

  useEffect(() => {
    // 채팅 기록 저장
    if (messages.length > 0 && userId) {
      saveChatMessages(messages, sessionId, { userId, enabled: true });
    }
  }, [messages, sessionId, userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authLoaded || !inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsChatting(true);
    setIsExpanded(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userId
            ? [...messages, userMessage].map((msg) => ({
                role: msg.role,
                content: msg.content,
              }))
            : [{ role: "user", content: userMessage.content }],
          sessionId: sessionId,
          landingCategory: landingCategory,
        }),
      });

      if (!response.ok) {
        let errorMessage = "API 호출 실패";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
        showCategoryButtons: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("채팅 오류:", error);
      const message =
        error instanceof Error ? error.message : "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryName: string) => {
    if (!authLoaded || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: categoryName,
      timestamp: new Date(),
      showCategoryButtons: false,
    };

    // 카테고리 선택 시 이전 메시지의 버튼 제거
    setMessages((prev) => 
      [...prev.map(msg => ({ ...msg, showCategoryButtons: false })), userMessage]
    );
    setLandingCategory(categoryName);
    setIsChatting(true);
    setIsExpanded(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userId
            ? [...messages, userMessage].map((msg) => ({
                role: msg.role,
                content: msg.content,
              }))
            : [{ role: "user", content: userMessage.content }],
          sessionId: sessionId,
          landingCategory: categoryName,
        }),
      });

      if (!response.ok) {
        let errorMessage = "API 호출 실패";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
        showCategoryButtons: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("채팅 오류:", error);
      const message =
        error instanceof Error ? error.message : "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const inputPlaceholder = isExpanded
    ? isChatting
      ? "메시지를 입력하세요..."
      : "메시지를 입력하거나 카테고리를 선택하세요"
    : "AI에게 질문해보세요";

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!userId && authLoaded && (
        <p className="text-xs text-text-gray mb-2 px-2">
          비로그인 상태에서는 일일 5회 이용 가능하며, 대화 저장/이어보기는 로그인 후 사용할 수 있습니다.
        </p>
      )}
      {/* Input Container */}
      <form onSubmit={handleSubmit}>
        <div 
          className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col-reverse ${
            isExpanded 
              ? "border-transparent shadow-xl" 
              : "border-transparent shadow-md"
          }`}
        >
          {/* Input Bar (항상 하단) */}
          <div className="flex gap-2 p-2">
            {isExpanded && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  if (!isChatting) {
                    setIsChatting(false);
                  }
                }}
                className="p-2 hover:opacity-70 transition-opacity flex-shrink-0"
                aria-label="채팅 창 닫기"
              >
                <X className="w-4 h-4 text-text-gray" />
              </button>
            )}
          <input
              ref={inputRef}
            type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={inputPlaceholder}
              disabled={!authLoaded || isLoading}
            className="flex-1 text-sm border-none outline-none text-text-dark placeholder:text-gray-400 px-2"
              aria-label="AI 상담 메시지 입력"
          />
            <button
            type="submit"
              className="p-2 hover:opacity-70 transition-opacity"
              onClick={(e) => e.stopPropagation()}
              disabled={!authLoaded || isLoading || !inputValue.trim()}
              aria-label="메시지 전송"
            >
              <Send className="w-5 h-5 text-brand-green-primary" />
            </button>
          </div>

          {/* Expanded Content (위로 확장) */}
          {isExpanded && (
            <div className="p-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              {/* Chat Messages */}
              {isChatting && (
                <div
                  ref={messagesContainerRef}
                  className="max-h-[400px] overflow-y-auto space-y-3 pr-2"
                  role="log"
                  aria-live="polite"
                  aria-label="AI 상담 대화 내용"
                >
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
                          <p className="text-sm whitespace-pre-wrap text-left">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70 text-left">
                            {message.timestamp.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {/* Category Buttons - 카테고리 선택 후에는 표시하지 않음 */}
                      {message.showCategoryButtons && (
                        <div className="mt-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PROGRAM_CATEGORIES.map((category) => {
                              const Icon = category.icon;
                              return (
                                <button
                                  key={category.name}
                                  type="button"
                                  onClick={() => handleCategorySelect(category.name)}
                                  className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-100 rounded-lg hover:bg-brand-green/5 transition-all"
                                  aria-label={`${category.name} 카테고리 선택`}
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
                    <div className="flex justify-start" aria-live="polite" aria-label="AI 답변 생성 중">
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
              )}

              {/* Category Buttons (채팅 시작 전) */}
              {!isChatting && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PROGRAM_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => handleCategorySelect(category.name)}
                          className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-100 rounded-lg hover:bg-brand-green/5 transition-all"
                          aria-label={`${category.name} 카테고리 선택`}
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
          )}
        </div>
      </form>
    </div>
  );
}
