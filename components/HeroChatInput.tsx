"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { PROGRAM_CATEGORIES } from "@/lib/constants";

interface HeroChatInputProps {
  initialCategory?: string;
}

export function HeroChatInput({ initialCategory }: HeroChatInputProps) {
  const searchParams = useSearchParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [landingCategory, setLandingCategory] = useState<string | undefined>(initialCategory);

  useEffect(() => {
    // URL 쿼리 파라미터에서 카테고리 확인 (예: ?category=수학여행)
    const category = searchParams?.get("category") || initialCategory;
    if (category) {
      setLandingCategory(category);
    }
  }, [searchParams, initialCategory]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setInitialMessage(inputValue.trim());
      setIsChatOpen(true);
      setIsExpanded(false);
      setInputValue("");
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setInitialMessage(categoryName);
    setLandingCategory(categoryName);
    setIsChatOpen(true);
    setIsExpanded(false);
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        {/* Input Container */}
        <form onSubmit={handleSubmit}>
          <div 
            className={`bg-white rounded-2xl border transition-all duration-300 ${
              isExpanded 
                ? "border-transparent shadow-xl" 
                : "border-transparent shadow-md"
            }`}
          >
            <div className="flex gap-2 p-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                placeholder={isExpanded ? "카테고리를 먼저 선택해주세요" : "AI에게 질문해보세요"}
                className="flex-1 text-sm border-none outline-none text-text-dark placeholder:text-gray-400 px-2"
              />
              <button
                type="submit"
                className="p-2 hover:opacity-70 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Send className="w-5 h-5 text-brand-green-primary" />
              </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* Category Buttons */}
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PROGRAM_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => handleCategorySelect(category.name)}
                          className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-gray-100 hover:bg-brand-green/5 transition-all group"
                        >
                          <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-brand-green/20 transition-colors">
                            <Icon className="w-5 h-5 text-brand-green" />
                          </div>
                          <span className="text-xs font-medium text-text-dark text-center leading-tight">
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-text-gray hover:text-text-dark transition-colors flex items-center gap-1"
                  >
                    접기
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={initialMessage}
        landingCategory={landingCategory}
      />
    </>
  );
}

