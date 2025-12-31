"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnyChatOpen, setIsAnyChatOpen] = useState(false);

  useEffect(() => {
    const checkChatOpen = () => {
      setIsAnyChatOpen(document.body.classList.contains("chat-widget-open"));
    };

    // 초기 확인
    checkChatOpen();

    // MutationObserver로 body 클래스 변경 감지
    const observer = new MutationObserver(checkChatOpen);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-brand-green-primary hover:bg-brand-green-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${
          isOpen || isAnyChatOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="AI 채팅 열기"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
      />
    </>
  );
}

