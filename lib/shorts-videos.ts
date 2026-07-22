/**
 * 메인 페이지 카드뉴스 첫 칸에 노출되는 유튜브 쇼츠 영상
 * 새 영상으로 교체할 때는 youtubeUrl과 title만 바꾸면 됩니다.
 */
export interface ShortsVideo {
  youtubeUrl: string; // 유튜브 쇼츠 URL 전체 (예: https://youtube.com/shorts/xxxxxxxxxxx)
  title: string;      // 카드 하단에 표시할 제목
}

export const SHORTS_VIDEOS: ShortsVideo[] = [
  {
    youtubeUrl: "https://youtube.com/shorts/n5TdhrDEnPc?si=XPr0I6gmq0V7KWjd",
    title: "2026 인천 교직원연수",
  },
];

export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getYouTubeShortsUrl(url: string): string {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/shorts/${id}` : url;
}
