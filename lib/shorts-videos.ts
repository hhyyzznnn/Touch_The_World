/**
 * 메인 페이지 프로그램 쇼츠 영상 목록
 * public/videos/ 폴더에 파일을 넣고 아래 배열에 추가하세요.
 */
export interface ShortsVideo {
  src: string;       // /videos/filename.mp4
  title: string;     // 카드 하단에 표시할 제목
  href?: string;     // 클릭 시 이동할 링크 (선택)
}

export const SHORTS_VIDEOS: ShortsVideo[] = [
  {
    src: "/videos/인천교육여행.mp4",
    title: "인천 교육여행",
    href: "/programs",
  },
];
