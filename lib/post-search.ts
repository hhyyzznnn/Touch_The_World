interface RankablePost {
  title: string;
  summary: string | null;
  hashtags: string[];
  categories: string[];
}

/**
 * 게시물 검색 결과 정렬.
 * 본문 어딘가에 단어가 스친 글보다 제목·태그에 검색어가 있는 글이 먼저 나오게 하고(동점이면 입력 순서 유지),
 * 같은 글이 회사 소식과 카드뉴스 양쪽에 등록된 경우 한 번만 남긴다.
 */
export function rankPosts<T extends RankablePost>(posts: T[], tokens: string[]): T[] {
  const relevance = (post: T) =>
    tokens.reduce((score, token) => {
      const t = token.toLowerCase();
      if (post.title.toLowerCase().includes(t)) return score + 3;
      if ([...post.hashtags, ...post.categories].some((tag) => tag.toLowerCase().includes(t))) return score + 2;
      if (post.summary?.toLowerCase().includes(t)) return score + 1;
      return score;
    }, 0);

  return posts
    .map((post, index) => ({ post, index, score: relevance(post) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.post)
    .filter((post, index, all) => all.findIndex((other) => other.title === post.title) === index);
}
