import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { ChatMessageText } from "@/components/ChatMessageText";
import type { ChatMessage } from "@/lib/chat-storage";

/** 프로그램 카테고리 선택 버튼 묶음 */
export function CategoryButtons({
  onSelect,
  className = "grid grid-cols-2 gap-2",
}: {
  onSelect: (categoryName: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {PROGRAM_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.name}
            type="button"
            onClick={() => onSelect(category.name)}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-100 rounded-lg hover:bg-brand-green/5 transition-all"
            aria-label={`${category.name} 카테고리 선택`}
          >
            <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center justify-center mb-1">
              <Icon className="w-4 h-4 text-brand-green" />
            </div>
            <span className="text-sm font-medium text-gray-500 text-center leading-tight whitespace-pre-line">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 대화 말풍선 목록 + 답변 생성 중 표시 */
export function ChatMessages({
  messages,
  isLoading,
  onCategorySelect,
  categoryGridClassName,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onCategorySelect: (categoryName: string) => void;
  categoryGridClassName?: string;
}) {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-left ${
                message.role === "user" ? "bg-brand-green-primary text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <ChatMessageText content={message.content} className="text-sm whitespace-pre-wrap" />
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          {message.showCategoryButtons && (
            <div className="mt-3">
              <CategoryButtons onSelect={onCategorySelect} className={categoryGridClassName} />
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start" aria-live="polite" aria-label="AI 답변 생성 중">
          <div className="bg-gray-100 rounded-2xl px-4 py-2">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
