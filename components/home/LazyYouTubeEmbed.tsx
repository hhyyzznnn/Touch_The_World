"use client";

import { useEffect, useRef, useState } from "react";

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

export function LazyYouTubeEmbed({ videoId, title, className }: LazyYouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

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

  // URL 파라미터만으로는 브라우저에 따라 자동재생이 씹히는 경우가 있어,
  // 플레이어가 초기화된 뒤 postMessage로 mute/play를 다시 명령해 확실히 재생시킨다.
  useEffect(() => {
    if (!shouldLoad) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendCommand = (func: string) => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    };

    const timers = [300, 800, 1500, 2500, 4000].map((delay) =>
      setTimeout(() => {
        sendCommand("mute");
        sendCommand("playVideo");
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad && (
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
