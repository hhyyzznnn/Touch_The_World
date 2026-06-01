-- 하나투어 교직원 전용 여행 혜택 카드뉴스 등록 (2026-05-26)
-- 이미지 경로: /company-news/hanatour-teacher-benefits-2026/01.png ~ 06.png

INSERT INTO "CompanyNews" (
  "id",
  "type",
  "category",
  "title",
  "summary",
  "content",
  "imageUrl",
  "imageUrls",
  "link",
  "hashtags",
  "isPinned",
  "createdAt",
  "updatedAt"
) VALUES (
  'cardnews_hanatour_teacher_benefits_2026',
  'COMPANY_NEWS',
  '기타 프로그램',
  '교직원과 가족을 위한 하나투어 전용 여행 혜택',
  '교직원회원 전용 사이트 ttw.hanatour.com에서 패키지 3% 할인, 호텔 3% 할인, 지역별 특전, 단체여행 팁북 10달러 상당 혜택을 누리세요.',
  '터치더월드와 하나투어가 함께하는 교직원 전용 여행 혜택 안내입니다.

교사, 행정실 직원, 교육공무직, 교직원 가족까지 — 학교에서 함께 일하는 모든 분들이 이용할 수 있습니다.

## 핵심 혜택

- 패키지 여행상품 **3% 할인**
- 호텔 예약 **3% 할인**
- 패키지 상품 한정 **지역별 특전**
- 15인 이상 단체여행 **팁북 10달러 상당**

방학, 연휴, 가족여행, 단체여행 모두 활용 가능합니다.

👉 **ttw.hanatour.com** 접속 후 상품 검색 및 예약',
  '/company-news/hanatour-teacher-benefits-2026/01.png',
  ARRAY[
    '/company-news/hanatour-teacher-benefits-2026/01.png',
    '/company-news/hanatour-teacher-benefits-2026/02.png',
    '/company-news/hanatour-teacher-benefits-2026/03.png',
    '/company-news/hanatour-teacher-benefits-2026/04.png',
    '/company-news/hanatour-teacher-benefits-2026/05.png',
    '/company-news/hanatour-teacher-benefits-2026/06.png'
  ],
  'https://ttw.hanatour.com',
  ARRAY['#하나투어', '#교직원혜택', '#교사여행'],
  false,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "type"      = EXCLUDED."type",
  "category"  = EXCLUDED."category",
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "link"      = EXCLUDED."link",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = NOW();
