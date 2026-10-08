"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Send, X } from "lucide-react";
import { CategoryButtons, ChatMessages } from "@/components/chat/ChatMessages";
import { useChatSession } from "@/components/chat/useChatSession";

interface HeroChatInputProps {
  initialCategory?: string;
}

// 지금 확인하면 좋은 혜택성 프로그램 — 필요해지면 이 목록만 갱신하면 됩니다.
const BENEFIT_HIGHLIGHTS = [
  { label: "포천 버스비 전액 지원", href: "/news/cardnews_pocheon_bus_subsidy_2026" },
  { label: "하나투어 교직원 혜택", href: "/news/cardnews_hanatour_teacher_benefits_2026" },
  { label: "인천 교육여행 지원사업", href: "/news/cardnews_incheon_edu_trip_support_2026" },
] as const;

// 제휴사 링크 — 혜택 pill 바로 아래 줄에 로고와 함께 표시 (전부 외부 링크, 새 탭)
const PARTNER_LINKS = [
  { label: "하나투어 제휴", href: "https://ttw.hanatour.com", logo: "hanatour" as const },
  { label: "아소전문학교그룹 제휴", href: "https://www.asojuku.co.kr", logo: "aso" as const },
] as const;

export function HeroChatInput({ initialCategory }: HeroChatInputProps) {
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [landingCategory, setLandingCategory] = useState<string | undefined>(initialCategory);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, authLoaded, userId, send } = useChatSession({
    landingCategory,
    // 저장된 대화가 있으면 이어서 보여주되, 처음에는 펼치지 않는다.
    onSessionReady: (restoredHistory) => {
      setIsChatting(restoredHistory);
      setIsExpanded(false);
    },
  });

  useEffect(() => {
    const category = searchParams?.get("category") || initialCategory;
    if (category) {
      setLandingCategory(category);
    }
  }, [searchParams, initialCategory]);

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

  const startChat = (text: string, options?: Parameters<typeof send>[1]) => {
    if (!authLoaded || isLoading) return;
    setIsChatting(true);
    setIsExpanded(true);
    void send(text, options);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    startChat(inputValue);
    setInputValue("");
  };

  // 카테고리를 고르면 이전 메시지의 선택 버튼은 숨기고 그 카테고리 맥락으로 상담을 시작한다.
  const handleCategorySelect = (categoryName: string) => {
    setLandingCategory(categoryName);
    startChat(categoryName, { landingCategory: categoryName, hideCategoryButtons: true });
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
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    onCategorySelect={handleCategorySelect}
                    categoryGridClassName="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  />
                </div>
              )}

              {/* Category Buttons (채팅 시작 전) */}
              {!isChatting && (
                <CategoryButtons
                  onSelect={handleCategorySelect}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                />
              )}
            </div>
          )}
        </div>
      </form>
      {!isExpanded && (
        <div className="mt-3">
          <p className="mb-2 text-center text-xs font-semibold text-brand-green-primary">
            터치더월드가 단독 제공하는 혜택
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {BENEFIT_HIGHLIGHTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-brand-green-primary/30 bg-brand-green-primary/5 px-4 py-1.5 text-sm font-medium text-brand-green-primary hover:bg-brand-green-primary/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 제휴사 링크 — 혜택 pill과 구분되도록 톤을 바꿔 아랫줄에 배치 */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {PARTNER_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 pl-2 pr-4 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors"
              >
                {item.logo === "hanatour" ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-1">
                    <Image
                      src="/logos/hanatour-icon.png"
                      alt=""
                      width={256}
                      height={256}
                      className="h-full w-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A227] text-[8px] font-extrabold tracking-wide text-white">
                    ASO
                  </span>
                )}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
      {!userId && authLoaded && (
        <p className="mt-2 text-center text-xs text-white/50">
          로그인하면 대화 기록이 저장돼요
        </p>
      )}
    </div>
  );
}
