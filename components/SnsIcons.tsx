// 헤더에서 쓰는 SNS 바로가기 아이콘 — 각 플랫폼의 실제 앱 아이콘 디자인(둥근 사각 타일 +
// 브랜드 고유 배경·글리프)을 그대로 재현한다. lucide-react의 line 아이콘은 브랜드 로고를
// 제공하지 않아(라이선스상 의도적으로 제외) 직접 SVG로 그렸다.

interface SnsTileProps {
  href: string;
  onClick?: () => void;
  className?: string;
}

const TILE_BASE = "flex items-center justify-center w-8 h-8 rounded-[9px] shadow-sm hover:brightness-105 active:scale-95 transition-all overflow-hidden";

export function InstagramTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="Instagram"
      className={`${TILE_BASE} bg-gradient-to-br from-[#FEDA75] via-[#D62976] to-[#4F5BD5] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-[62%] h-[62%]">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.3" stroke="white" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.15" fill="white" />
      </svg>
    </a>
  );
}

export function FacebookTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="Facebook"
      className={`${TILE_BASE} bg-[#1877F2] ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="white" className="w-[48%] h-[48%]">
        <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.91 8.44-9.93Z" />
      </svg>
    </a>
  );
}

export function YoutubeTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label="YouTube"
      className={`${TILE_BASE} bg-white border border-gray-200 ${className}`}
    >
      <svg viewBox="0 0 28 20" className="w-[78%] h-auto">
        <rect x="0" y="0" width="28" height="20" rx="6" fill="#FF0000" />
        <path d="M11 6 L20 10 L11 14 Z" fill="white" />
      </svg>
    </a>
  );
}
