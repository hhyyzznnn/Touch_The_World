-- 카드뉴스 CDN 업로드 결과 (20260818) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 경계인: AI 시대, 새로운 인재의 조건 — 백영재 저
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'boundary-person-book',
  'BOOK_CARD_NEWS',
  '',
  $pgtag$경계인: AI 시대, 새로운 인재의 조건 — 백영재 저$pgtag$,
  $pgtag$AI가 정답을 더 빨리 찾는 시대, 진짜 필요한 건 '어떤 질문을 할 것인가'입니다. 한 가지 정답에 갇히지 않고 서로 다른 세계를 연결하는 '경계인'의 다섯 가지 힘(MARGIN)으로, 진로를 고민하는 청소년에게 나만의 관점을 찾는 법을 알려주는 책입니다.$pgtag$,
  $pgtag$## 경계인: AI 시대, 새로운 인재의 조건 — 백영재 저

> 시험의 정답은 AI가 더 빨리 찾습니다. 그렇다면 인간에게 남는 질문은 무엇일까요?
> "어떤 질문을 할 것인가?" "무엇을 새롭게 연결할 것인가?"

진로를 '하나만' 골라야 한다는 압박, 스펙 경쟁에 지치는 마음. 『경계인』은 지금의 불확실함이 약점이 아니라 나만의 관점을 만드는 재료라고 말합니다.

---

### 경계인이란?
한 가지 정답에 갇히지 않고, 서로 다른 세계를 연결하는 사람입니다.

- 과학 × 예술
- 기술 × 사람
- 나의 관심사 × 새로운 가능성

인류학자에서 경영자로, 컨설팅·엔터테인먼트·테크·콘텐츠까지 — 저자 백영재는 25년간 서로 다른 산업을 넘나들며 '경계'에서 길을 만들어 왔습니다.

### AI 시대의 성장 공식, MARGIN
- **M** 메타인지 — 내가 무엇을 알고 모르는지 아는 힘
- **A** 적응력 — 변화에 유연하게 반응하는 힘
- **R** 리스크 테이킹 — 불확실함 속에서도 도전하는 힘
- **GI** 생성적 혁신 — 서로 다른 것을 새롭게 연결하는 힘
- **N** 호기심 — 질문을 멈추지 않는 힘

> 정답을 외우는 힘보다, 미래를 만들어 가는 힘입니다.

---

『경계인』은 정답을 알려주는 책이 아닙니다. 대신 나만의 질문과 나만의 경계를 찾게 하는 책입니다. 미래가 막막할 때, 이 책으로 첫 질문을 시작해 보세요.$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU5zkXDDPvi4nVXkGCHlLZ9AhDuQTS7W3Isj60',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU5zkXDDPvi4nVXkGCHlLZ9AhDuQTS7W3Isj60', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUyA9yMX4zCDEmeMoRlFx8gLPdr1upBU9fb5ji', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUjm8y6OcBK8DaS6t3R29uH7U0qEZhrgAdocLY', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU4TrntYq7M1YQuaXdvgnmWLRxepATf9wIqbo4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhObiz0aLkNMi0neZEwOQsfG7rDvx5BKbaFlg', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFeAuCqwgfawsy2XEATGp9mPCWbIe37dhq0n5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU8dqduQdkvWPxgtROoySe7wrziGIMcaqHk6sL', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgyClgxVXJUlt9KLoPkdygb370m1TYGDOHecs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUQWWmfGsbAgdxsk6pRLel1vjPhUQ3NrwfaSXy', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUoX8nSzJaQEnRI6cKGiuSJO0MCP9lHe3s7LF2'],
  NULL,
  ARRAY['#학생', '#교사', '#터치더월드'],
  false,
  '2026-08-18T05:10:37.471Z', '2026-08-18T05:10:37.471Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-18T05:10:37.471Z';

-- 뇌가 멈추기 전에 — 뇌졸중 예방, 오늘의 선택
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'brain-stroke-prevention-guide',
  'COMPANY_NEWS',
  '',
  $pgtag$뇌가 멈추기 전에 — 뇌졸중 예방, 오늘의 선택$pgtag$,
  $pgtag$뇌졸중은 갑자기 오지만 위험은 서서히 누적됩니다. 증상 없이 진행되는 혈관 변화부터 위험요인 관리, 응급 대응(BE FAST), 재발 방지까지 — 오늘 확인해야 할 뇌 건강 정보를 정리했습니다.$pgtag$,
  $pgtag$## 뇌가 멈추기 전에 — 뇌졸중 예방, 오늘의 선택

> 뇌졸중은 갑자기 오지만, 위험은 누적됩니다. 혈관의 변화는 증상 없이 진행될 수 있습니다.

---

### 뇌졸중의 두 얼굴
- **뇌경색** — 피가 흘러야 할 곳에 흐르지 않을 때 (막힘)
- **뇌출혈** — 피가 흐르지 말아야 할 곳에 흐를 때 (터짐)

증상은 비슷할 수 있어, 즉시 진단이 중요합니다.

### 뇌졸중 위험을 키우는 5가지
고혈압 · 당뇨 · 고지혈증 · 흡연 · 과음 — 위험요인은 관리할 수 있습니다.

### 예방은 단계별로
0단계 위험을 발견한다 → 1단계 치료를 지속한다 → 2단계 원인과 목표를 찾는다 → 3단계 재발을 막는다. 늦지 않게 시작하고, 끊기지 않게 반복하세요.

혈압·혈당·지질·심장 리듬을 정기적으로 확인하세요. 진단은 관리의 시작이며, 치료는 임의로 중단하지 않습니다.

### 뇌가 보내는 신호, BE FAST
- **B**alance 균형 이상
- **E**yes 시야 이상
- **F**ace 얼굴 처짐
- **A**rm 팔·다리 힘 빠짐
- **S**peech 말 어눌함
- **T**ime 시간 · 즉시 119

증상이 하나만 있어도 기다리지 마세요.

### 응급 대응, 첫 5분
마지막 정상 시각을 확인하고, 뇌졸중 의심을 알리고, 직접 운전하지 않습니다. 음식·물·임의 약을 먹이지 마세요. 기다림 대신 즉시 119.

---

예방은 작은 반복입니다. 알기·잇기·바꾸기·대응하기 — 수치를 알고, 치료를 잇고, 이상 신호에는 즉시 119. 우리 아이들과 함께하는 교직원, 학부모님의 건강한 하루를 응원합니다.$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhfd5fJaLkNMi0neZEwOQsfG7rDvx5BKbaFlg',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhfd5fJaLkNMi0neZEwOQsfG7rDvx5BKbaFlg', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUr0QLkVuWI714bpzTKBotNYhHmEl6igsGCqUv', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUID312GpITeqvUJojNsQ6BpgD8M53bRPCAK2Y', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUpVSJfoC3galydhriFfLwUM1evm2bDNCX6oQc', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUKlRCqjfwYWuiU8LSVTfcamk05EvZzbrtpqjd', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUIhIMT4pITeqvUJojNsQ6BpgD8M53bRPCAK2Y', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUliJnCBNNY1WKyG52xDuAjm0kpqJZ3tB9Mngr', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUrMaSInuWI714bpzTKBotNYhHmEl6igsGCqUv', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUNiW4OjSxomPErOpCi4wDSJcTzeyZUnfRY31q', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU43P4zxq7M1YQuaXdvgnmWLRxepATf9wIqbo4'],
  NULL,
  ARRAY['#교직원', '#학부모', '#터치더월드'],
  false,
  '2026-08-18T05:10:38.471Z', '2026-08-18T05:10:38.471Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-18T05:10:38.471Z';
