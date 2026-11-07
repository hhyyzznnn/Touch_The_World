"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";

interface HomeNoticeBarProps {
  id: string;
  title: string;
  link?: string | null;
}

/**
 * 메인 맨 위 한 줄 알림 — 예전 첫 방문 팝업이 첫 화면을 가리던 것을 대신한다.
 * 닫으면 같은 소식은 다시 띄우지 않는다(소식이 바뀌면 다시 보인다).
 * 닫은 적이 있으면 그리기 전에 인라인 스크립트로 숨겨서, 보였다 사라지며 화면이 밀리는 일이 없게 한다.
 */
export function HomeNoticeBar({ id, title, link }: HomeNoticeBarProps) {
  const storageKey = `home_notice_closed_${id}`;
  const elementId = `home-notice-${id}`;
  // 인라인 스크립트 안에 넣을 문자열 — `</script>`로 끊기지 않게 `<`를 이스케이프
  const js = (s: string) => JSON.stringify(s).replace(/</g, "\\u003c");
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setClosed(true);
    } catch {
      // 저장소를 못 쓰는 브라우저에서는 그냥 보여 준다
    }
  }, [storageKey]);

  if (closed) return null;

  const close = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // 무시 — 이번 화면에서만 닫힌다
    }
    setClosed(true);
  };

  const href = link?.trim() || `/news/${id}`;
  const isExternal = href.startsWith("http");

  return (
    <div id={elementId} className="bg-[#1B4332] text-white" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem(${js(storageKey)}))document.getElementById(${js(elementId)}).hidden=true}catch(e){}`,
        }}
      />
      <div className="container mx-auto flex max-w-6xl items-center gap-2 px-4">
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-2 text-sm hover:underline underline-offset-4"
        >
          <span className="shrink-0 rounded bg-white/15 px-2 py-0.5 text-xs font-semibold">안내</span>
          <span className="truncate break-keep">{title}</span>
          <span className="hidden shrink-0 items-center font-semibold sm:inline-flex">
            자세히 보기 <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={close}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="알림 닫기"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
