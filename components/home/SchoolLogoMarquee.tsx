"use client";

import Image from "next/image";

const SCHOOLS = [
  { src: "/logos/schools/hanyang-foreign-high.png", name: "한영외고" },
  { src: "/logos/schools/anyang-foreign-high.jpeg", name: "안양외고" },
  { src: "/logos/schools/geunmyung.png", name: "근명중학교" },
  { src: "/logos/schools/changmun-girls-high.jpeg", name: "창문여고" },
  { src: "/logos/schools/keumcheon-high.png", name: "금천고등학교" },
  { src: "/logos/schools/hangang-media-high.jpg", name: "한강미디어고" },
  { src: "/logos/schools/gachon-university.webp", name: "가천대학교" },
  { src: "/logos/schools/pyeongtaek-meister-high.webp", name: "평택마이스터고" },
];

export function SchoolLogoMarquee() {
  const track = [...SCHOOLS, ...SCHOOLS];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />
      <div
        className="flex items-center w-max"
        style={{
          animation: "marquee 30s linear infinite",
          willChange: "transform",
        }}
      >
        {track.map((school, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 flex-shrink-0 px-8 sm:px-12"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={school.src}
                alt={school.name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <span className="text-[10px] sm:text-xs text-text-gray whitespace-nowrap">
              {school.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
