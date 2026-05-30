"use client";

import Link from "next/link";
import { useRef } from "react";
import type { ShortsVideo } from "@/lib/shorts-videos";

interface ShortsCarouselProps {
  videos: ShortsVideo[];
}

function ShortsCard({ video }: { video: ShortsVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };
  const handleMouseLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const inner = (
    <div
      className="group relative flex-shrink-0 w-[148px] sm:w-[176px] cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 9:16 비율 영상 영역 */}
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-900 shadow-sm group-hover:shadow-md transition-shadow">
        <video
          ref={videoRef}
          src={video.src}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <p className="absolute inset-x-0 bottom-3 px-3 text-white text-xs font-medium line-clamp-2 leading-snug">
          {video.title}
        </p>
      </div>
    </div>
  );

  if (video.href) {
    return (
      <Link href={video.href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ShortsCarousel({ videos }: ShortsCarouselProps) {
  if (videos.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark mb-5 sm:mb-8">
          프로그램 쇼츠
        </h2>
        <div className="relative">
          {/* 좌우 페이드 */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent z-10" />
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 [touch-action:pan-x] overscroll-x-contain">
            <div className="flex gap-3 sm:gap-4 pb-2">
              {videos.map((video) => (
                <ShortsCard key={video.src} video={video} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
