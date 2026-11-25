/**
 * 카드뉴스 본문 표에서 "고를 수 있는 선택지" 줄 찾기 (2026-11-25).
 * Clarity에서 일정표 줄(예: "01. 팬스타 왕복 2박 3일 …")을 하나씩 눌러 보는 클릭이 반응 없이 끝나는 일이 반복돼,
 * 번호로 시작하는 줄은 그 선택지로 바로 문의하는 링크로 만든다. "항목 | 내용" 같은 설명 표는 건드리지 않는다.
 */

/** react-markdown이 넘기는 hast 노드 중 여기서 쓰는 부분만 */
export type HastLike = { type: string; tagName?: string; value?: string; children?: HastLike[] };

export function hastText(node: HastLike | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/** 표 한 줄의 칸 글자들 (머리줄 th는 빼고 td만) */
export function rowCells(tr: HastLike | undefined): string[] {
  return (tr?.children ?? [])
    .filter((c) => c.type === "element" && c.tagName === "td")
    .map((c) => hastText(c).replace(/\s+/g, " ").trim());
}

const NUMBERED = /^\d{1,2}(?:[.)]|\s|$)/;

/** 첫 칸이 "01", "1.", "03)"처럼 번호로 시작하는 줄 = 고를 수 있는 선택지 */
export function isOptionRow(cells: string[]): boolean {
  return cells.length >= 2 && NUMBERED.test(cells[0]);
}

/** 문의서에 넣을 선택지 이름. 첫 칸이 번호뿐이면 둘째 칸까지 붙인다 ("01 현장체험학습") */
export function optionLabel(cells: string[]): string {
  const first = cells[0];
  const label = /^\d{1,2}[.)]?$/.test(first) ? `${first} ${cells[1]}` : first;
  return label.length > 60 ? `${label.slice(0, 59)}…` : label;
}

/** 표 안에 선택지 줄이 하나라도 있는지 (안내 문구를 붙일지 정할 때) */
export function tableHasOptions(table: HastLike | undefined): boolean {
  const rows: HastLike[] = [];
  const walk = (n: HastLike) => {
    if (n.type === "element" && n.tagName === "tr") rows.push(n);
    else (n.children ?? []).forEach(walk);
  };
  if (table) walk(table);
  return rows.filter((r) => isOptionRow(rowCells(r))).length >= 2;
}
