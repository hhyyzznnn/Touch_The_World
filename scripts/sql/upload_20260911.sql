-- 카드뉴스 CDN 업로드 결과 (20260911) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 중3 학생을 위한 쇼펜하우어 자서전 — 내 삶과 생각을 내가 직접 들려준다면
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_schopenhauer_autobiography_2026',
  'COMPANY_NEWS',
  ARRAY['기타 프로그램'],
  $pgtag$중3 학생을 위한 쇼펜하우어 자서전 — 내 삶과 생각을 내가 직접 들려준다면$pgtag$,
  $pgtag$철학자 쇼펜하우어가 1인칭으로 자신의 생애와 사상(의지, 표상, 욕망과 고통, 예술, 연민)을 중학생에게 직접 들려주는 회사 자체 제작 인문학 카드뉴스입니다.$pgtag$,
  $pgtag$## 중3 학생을 위한 쇼펜하우어 자서전 — 내 삶과 생각을 내가 직접 들려준다면

> 나는 아르투어 쇼펜하우어, 1788년 독일에서 태어난 철학자입니다. 상인이 되라는 기대보다 인간과 삶에 대한 질문이 더 궁금했어요.

## 내가 붙든 질문

왜 우리는 원하는 것을 얻고도 다시 불안해질까? 나는 욕망이 끝없이 이어지는 모습을 보았습니다.

## 의지란 무엇일까?

배고픔, 인정받고 싶은 마음, 살아가려는 힘. 생각보다 먼저 우리를 움직이는 이 욕망과 충동을 나는 '의지'라고 불렀어요.

## 표상: 내가 경험하는 세계

우리는 시간·공간·원인과 결과의 틀로 세상을 이해해요. 세상이 가짜라는 뜻이 아니라, 세상이 우리에게 나타나는 방식이라는 뜻이에요.

## 욕망과 고통의 반복

원하는 것이 없으면 괴롭고, 얻으면 곧 새로운 욕망이나 지루함이 찾아올 수 있어요. 더 많이 갖는 것만으로는 오래 행복해지기 어렵다고 나는 생각했습니다.

## 예술과 음악은 마음의 쉼표

그림, 자연, 음악에 깊이 집중할 때 우리는 욕망의 계산에서 잠시 벗어날 수 있어요. 특히 나는 음악이 마음의 움직임을 가장 가까이 보여 준다고 생각했어요.

## 연민: 다른 존재의 고통을 알아보기

나는 연민을 도덕의 시작으로 보았어요. 나에게 이익이 되는가만 묻지 말고, 상대가 얼마나 힘든지도 살펴야 해요.

## 불교와 나의 생각

공통점: 욕망을 따라가면 고통이 커질 수 있어요. 차이점: 나는 세계의 근원을 '의지'로 보았고, 불교는 고통이 여러 조건에서 생긴다고 보았어요.

## 내가 남기는 마지막 질문

나는 무엇을 원하고 있으며, 그 바람은 나와 다른 사람의 삶을 어떤 방향으로 이끌고 있는가?

욕망을 알아차리고, 고통을 줄이며, 연민을 선택해 보세요.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmjC8yOWVlRfzJYOHE5SByLtIgToQP6FxsZhk',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmjC8yOWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU3MD0DjnblO97m2Vp6ZWGajcYqkgdnE1MNKoI', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUvlXqzLKXrLtFohmSiyf7Clv4s0qQAWa6VPd5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUJNwThkUmrTNe2UKLRDFO8iV67tYwJxQCbAaZ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUP2D8zELK5zYIDMjgva0ZRyACSolUQ39ePwxf', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUKzJ56XhfwYWuiU8LSVTfcamk05EvZzbrtpqj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmCGEZrWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUn1IrLshWL7SstF9rKzQTGYhkpvNnXwHUaDg6', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUcK2xKEiuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUF0QUJYwgfawsy2XEATGp9mPCWbIe37dhq0n5'],
  NULL,
  ARRAY['#중등', '#학생', '#터치더월드'],
  false,
  '2026-09-11T01:03:09.458Z', '2026-09-11T01:03:09.458Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-11T01:03:09.458Z';
