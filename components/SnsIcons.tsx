// 헤더 SNS 바로가기 아이콘 — public/logos/에 있는 실제 아이콘 이미지를 그대로 사용한다.
import Image from "next/image";

interface SnsTileProps {
  href: string;
  onClick?: () => void;
  className?: string;
}

const TILE_BASE = "flex items-center justify-center w-8 h-8 shrink-0 hover:scale-105 active:scale-95 transition-transform";

export function InstagramTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label="Instagram" className={`${TILE_BASE} ${className}`}>
      <Image src="/logos/sns-instagram.png" alt="Instagram" width={32} height={32} className="w-full h-full object-contain" />
    </a>
  );
}

export function FacebookTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label="Facebook" className={`${TILE_BASE} ${className}`}>
      <Image src="/logos/sns-facebook.png" alt="Facebook" width={32} height={32} className="w-full h-full object-contain" />
    </a>
  );
}

export function YoutubeTile({ href, onClick, className = "" }: SnsTileProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label="YouTube" className={`${TILE_BASE} ${className}`}>
      <Image src="/logos/sns-youtube.png" alt="YouTube" width={32} height={32} className="w-full h-full object-contain" />
    </a>
  );
}
