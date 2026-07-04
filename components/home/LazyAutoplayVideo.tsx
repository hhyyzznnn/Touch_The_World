"use client";

import { useEffect, useRef } from "react";

interface LazyAutoplayVideoProps {
  src: string;
  className?: string;
}

export function LazyAutoplayVideo({ src, className }: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        video.src = src;
        video.load();
        video.play().catch(() => {});
      },
      { rootMargin: "300px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      className={className}
    />
  );
}
