"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

const AUTOPLAY_FALLBACK_TIMEOUT = 4000;

export function LazyYouTubeEmbed({ videoId, title, className }: LazyYouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // URL 파라미터만으로는 브라우저(특히 사파리)에 따라 자동재생이 씹히는 경우가 있어,
  // 플레이어가 초기화된 뒤 postMessage로 mute/play를 재차 명령한다.
  // 그래도 일정 시간 안에 실제 재생 신호(onStateChange=playing)가 없으면
  // iframe을 걷어내고 항상 깔려있는 정적 썸네일로 되돌린다 — 자동재생이 막혀도
  // 화면이 까만 박스로 남지 않도록 하기 위함.
  useEffect(() => {
    if (!shouldLoad) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendCommand = (func: string) => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    };

    const retryTimers = [300, 800, 1500, 2500].map((delay) =>
      setTimeout(() => {
        sendCommand("mute");
        sendCommand("playVideo");
      }, delay)
    );

    let isPlaying = false;
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let data: { event?: string; info?: number };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.event === "onStateChange" && data.info === 1) {
        isPlaying = true;
      }
    };
    window.addEventListener("message", handleMessage);

    const fallbackTimer = setTimeout(() => {
      if (!isPlaying) setAutoplayFailed(true);
    }, AUTOPLAY_FALLBACK_TIMEOUT);

    return () => {
      retryTimers.forEach(clearTimeout);
      clearTimeout(fallbackTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={className}>
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        className="object-cover"
      />
      {shouldLoad && !autoplayFailed && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&enablejsapi=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute inset-0 w-full h-full pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
