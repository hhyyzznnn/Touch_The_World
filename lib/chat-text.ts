/** 채팅창은 일반 텍스트로 표시되므로, 모델이 섞어 쓴 마크다운 기호를 걷어낸다. */
export const stripMarkdown = (text: string): string =>
  text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1\n$2")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "");

/**
 * 모델이 게시물 제목을 언급하며 답하고도 링크를 빠뜨리는 경우가 있어, 언급된 게시물의
 * 상세 페이지 주소가 답변에 없으면 서버에서 붙여준다.
 */
export const appendMissingSourceLinks = (
  text: string,
  sources: { title: string; url: string }[]
): string => {
  const missing = sources
    .filter((source) => text.includes(source.title.split(" — ")[0]) && !text.includes(source.url))
    .slice(0, 2);
  if (missing.length === 0) return text;
  return `${text}\n\n자세히 보기\n${missing.map((source) => `${source.title}\n${source.url}`).join("\n")}`;
};
