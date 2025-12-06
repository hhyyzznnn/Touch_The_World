import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  text?: string;
}

/**
 * 이미지가 없을 때 표시하는 플레이스홀더 컴포넌트
 */
export function ImagePlaceholder({ 
  className = "", 
  text = "이미지 준비 중" 
}: ImagePlaceholderProps) {
  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400",
      className
    )}>
      {text}
    </div>
  );
}

