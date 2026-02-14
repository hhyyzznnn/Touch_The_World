"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export function ShareButton({ url, title, description, imageUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);

  useEffect(() => {
    setFullUrl(typeof window !== "undefined" ? `${window.location.origin}${url}` : url);
  }, [url]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
    }
  };

  const handleKakaoShare = () => {
    const Kakao = (window as unknown as { Kakao?: { Share: { sendDefault: (opts: unknown) => Promise<void> } } }).Kakao;
    if (!Kakao?.Share) {
      handleCopyLink();
      return;
    }
    const shareImageUrl = imageUrl?.startsWith("http")
      ? imageUrl
      : typeof window !== "undefined" && imageUrl
        ? `${window.location.origin}${imageUrl}`
        : typeof window !== "undefined"
          ? `${window.location.origin}/ttw_logo.png`
          : "https://touchtheworld.co.kr/ttw_logo.png";
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: description || title,
        imageUrl: shareImageUrl,
        link: {
          mobileWebUrl: fullUrl,
          webUrl: fullUrl,
        },
      },
    }).catch(() => {
      handleCopyLink();
    });
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=600");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우
        if ((error as Error).name !== "AbortError") {
          console.error("공유 실패:", error);
        }
      }
    } else {
      // 네이티브 공유가 지원되지 않으면 드롭다운 표시
      setIsOpen(!isOpen);
    }
  };

  const [canUseNativeShare, setCanUseNativeShare] = useState(false);
  useEffect(() => {
    setCanUseNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (canUseNativeShare) {
            handleNativeShare();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        공유
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    링크 복사
                  </>
                )}
              </button>
              <button
                onClick={handleKakaoShare}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <MessageCircle className="w-4 h-4 text-yellow-400" />
                카카오톡
              </button>
              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                페이스북
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
