const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;

/** 챗봇 답변의 줄바꿈을 유지하면서, 본문에 포함된 주소(근거 게시물 링크 등)를 클릭 가능하게 표시한다. */
export function ChatMessageText({ content, className }: { content: string; className?: string }) {
  const parts = content.split(URL_PATTERN);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        // 문장 끝에 붙은 마침표·쉼표는 주소에서 떼어낸다.
        const url = part.replace(/[.,!?]+$/, "");
        return (
          <span key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline break-all">
              {url}
            </a>
            {part.slice(url.length)}
          </span>
        );
      })}
    </p>
  );
}
