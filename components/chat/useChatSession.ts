"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadChatMessages,
  saveChatMessages,
  clearLegacyAnonymousChatMessages,
  type ChatMessage,
} from "@/lib/chat-storage";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

const GENERIC_ERROR = "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

function createSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createGreeting(landingCategory?: string): ChatMessage {
  return {
    id: "1",
    role: "assistant",
    content: landingCategory
      ? `안녕하세요! 터치더월드 AI 어시스턴트입니다.\n\n${landingCategory} 상담을 도와드리겠습니다. 예상 인원과 희망 지역을 알려주시면 맞춤형 일정을 제안해드리겠습니다!`
      : `안녕하세요! 터치더월드 AI 어시스턴트입니다.\n\n어떤 프로그램에 관심이 있으신가요? 아래 버튼을 클릭하시거나 직접 입력해주세요!`,
    timestamp: new Date(),
    showCategoryButtons: !landingCategory,
  };
}

interface UseChatSessionOptions {
  /** 랜딩 페이지 등에서 넘어온 상담 카테고리 */
  landingCategory?: string;
  /** 대화를 불러오거나 새로 시작한 직후 호출 (저장된 이전 대화가 있었는지 전달) */
  onSessionReady?: (restoredHistory: boolean) => void;
}

/**
 * 메인 화면 입력창과 플로팅 위젯이 함께 쓰는 AI 상담 대화 상태.
 * 로그인 여부 확인, 로그인 사용자의 대화 저장·복원, /api/chat 호출을 한곳에서 처리한다.
 */
export function useChatSession({ landingCategory, onSessionReady }: UseChatSessionOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createGreeting(landingCategory)]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(createSessionId);

  // 대화 도중 카테고리가 바뀌어도 진행 중인 대화를 초기화하지 않도록 최신 값만 참조한다.
  const landingCategoryRef = useRef(landingCategory);
  landingCategoryRef.current = landingCategory;
  const onSessionReadyRef = useRef(onSessionReady);
  onSessionReadyRef.current = onSessionReady;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUserId(data?.user?.id ?? null))
      .catch(() => setUserId(null))
      .finally(() => setAuthLoaded(true));
  }, []);

  useEffect(() => {
    if (!authLoaded) return;

    if (userId) {
      const loaded = loadChatMessages({ userId, enabled: true });
      if (loaded.messages.length > 0) {
        setMessages(loaded.messages);
        if (loaded.sessionId) setSessionId(loaded.sessionId);
        onSessionReadyRef.current?.(true);
        return;
      }
    } else {
      clearLegacyAnonymousChatMessages();
    }

    setMessages([createGreeting(landingCategoryRef.current)]);
    setSessionId(createSessionId());
    onSessionReadyRef.current?.(false);
  }, [authLoaded, userId]);

  useEffect(() => {
    if (userId && messages.length > 0) {
      saveChatMessages(messages, sessionId, { userId, enabled: true });
    }
  }, [messages, sessionId, userId]);

  const send = useCallback(
    async (text: string, options: { landingCategory?: string; hideCategoryButtons?: boolean } = {}) => {
      const content = text.trim();
      if (!authLoaded || isLoading || !content) return;

      const category = options.landingCategory ?? landingCategoryRef.current;
      if (!messages.some((msg) => msg.role === "user")) {
        trackEvent(GA_EVENTS.CHAT_START, { category });
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      const history = options.hideCategoryButtons
        ? messages.map((msg) => ({ ...msg, showCategoryButtons: false }))
        : messages;
      setMessages([...history, userMessage]);
      setIsLoading(true);

      let reply: Pick<ChatMessage, "content" | "showCategoryButtons">;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...history, userMessage]
              .slice(userId ? -40 : -20)
              .map((msg) => ({ role: msg.role, content: msg.content })),
            sessionId,
            landingCategory: category,
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "API 호출 실패");
        reply = {
          content: data.message.content,
          showCategoryButtons: Boolean(data?.message?.showCategoryButtons),
        };
      } catch (error) {
        console.error("채팅 오류:", error);
        reply = { content: error instanceof Error ? error.message : GENERIC_ERROR };
      } finally {
        setIsLoading(false);
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", timestamp: new Date(), ...reply },
      ]);
    },
    [authLoaded, isLoading, messages, sessionId, userId]
  );

  return { messages, isLoading, authLoaded, userId, send };
}
