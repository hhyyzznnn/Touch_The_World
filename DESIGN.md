# DESIGN.md — 디자인 기준값

사용자·분위기는 [PRODUCT.md](PRODUCT.md). 새 화면·수정은 아래 값만 사용하고, 없는 값이 필요하면 먼저 이 문서에 추가합니다.

## 색 (Hex)
| 역할 | 값 | Tailwind | 용도 |
|---|---|---|---|
| 주색 | `#2E6D45` | `brand-green-primary` | 버튼, 링크, 강조 제목 |
| 주색 진하게 | `#1B4332` | `bg-[#1B4332]` | 어두운 배경 구역, hover |
| 밝은 초록 | `#00954B` | `brand-green` | **장식·아이콘 전용** (흰 배경 위 글자로 쓰면 대비 부족) |
| 본문 | `#1D1D1B` | `text-text-dark` | 제목·본문 |
| 보조 글자 | `#6B6B6B` | `text-text-gray` | 설명·날짜 (흰 배경 대비 4.5:1 이상) |
| 배경 | `#FFFFFF` / `#F9FAFB` | `bg-white` / `bg-gray-50` | 기본 / 구역 구분 |
| 선 | `#E5E7EB` | `border-gray-200` | 카드 테두리, 구분선 |
| 경고·마감 | `#B91C1C` | `text-red-700` | D-day 임박, 오류 |
| 수상 배지 | `#8A6D12` | — | ASO·수상 표시 |

- 카테고리 색은 `lib/news-constants.ts` `CATEGORY_COLORS`(초록 단계 8색) 하나만 씁니다. 화면마다 새 색을 만들지 않습니다.
- 한 화면의 강조색은 주색 하나. 빨강은 마감·오류에만.

## 글꼴
- 본문·UI: **Pretendard Variable** (`font-sans`, 동적 subset)
- 제목 장식이 꼭 필요할 때만: Noto Serif KR (`font-serif`). 영문 장식 서체 Bona Nova(`font-display`)는 로고 주변 외에는 쓰지 않습니다.
- 크기(모바일 → PC): 페이지 제목 `text-2xl → md:text-4xl font-bold`, 구역 제목 `text-xl → md:text-2xl font-bold`, 본문 `text-base`(16px, 줄간격 1.7), 보조 `text-sm`. 12px(`text-xs`) 미만 금지
- 한국어 제목·본문은 `break-keep`

## 간격·레이아웃
- 4px 단위만: 카드 안쪽 `p-5`/`p-6`, 카드 사이 `gap-4`(모바일)·`gap-6`(PC), 구역 사이 `py-12 → md:py-20`
- 본문 최대 폭 `max-w-6xl`(목록) / `max-w-3xl`(글), 좌우 여백 `px-4`
- 모서리: 카드 `rounded-xl`, 버튼·입력 `rounded-lg`, 배지 `rounded-full`. 이외 값 새로 쓰지 않기
- 그림자: 기본 없음, 카드 hover에만 `shadow-md`
- 한 줄 카드 수: 모바일 1~2 · 태블릿 2~3 · PC 3~4. 사진 카드는 비율 고정(`aspect-[4/5]` 카드뉴스, `aspect-video` 영상)

## 상호작용·접근성 (WCAG AA)
- 글자 대비 4.5:1 이상, 큰 제목 3:1 이상
- 누르는 영역 최소 44×44px(모바일), 인접 버튼 간격 8px 이상
- 키보드 포커스 보이게(`focus-visible:ring-2 ring-brand-green-primary`), 아이콘 버튼엔 `aria-label`
- 이미지: 의미 있는 사진은 “… 카드뉴스 표지”처럼 내용 alt, 장식은 `alt=""`
- 애니메이션은 200ms 안팎, `prefers-reduced-motion`이면 끔. 레이아웃 흔들림(CLS) 없게 자리 높이를 먼저 잡기
- 입력 폼 높이 통일(`h-11`), 오류는 칸 바로 아래 문장으로

## 작업 순서 (디자인 요청 시)
1. **구조/레이아웃** — 정보 순서, 구역 나누기, 모바일 배치를 먼저 확정 (시안 2~3개 비교)
2. **색/타이포** — 이 문서 값으로만 입히기
3. **상호작용/반응형** — hover·포커스·모바일 줄바꿈·로딩 상태
4. 점검 — Lighthouse 접근성 100 유지, PC·모바일 캡처 확인

“예쁘게”가 아니라 위 기준값·대상 사용자·참고 사례를 명시해 지시하고, 결과도 이 기준으로 검수합니다.
