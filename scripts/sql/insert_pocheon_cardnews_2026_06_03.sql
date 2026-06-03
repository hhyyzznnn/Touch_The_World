-- 포천 교육여행 & 교직원연수 카드뉴스 등록 (2026-06-03)
-- Supabase SQL Editor에서 실행하세요.

-- ① 포천시를 활용한 교육여행 프로그램
INSERT INTO "CompanyNews" (
  "id", "type", "category", "title", "summary", "content",
  "imageUrl", "imageUrls", "link", "hashtags", "isPinned", "createdAt", "updatedAt"
) VALUES (
  'cardnews_pocheon_education_trip_2026',
  'PROGRAM_CARD_NEWS',
  '국내외 교육여행',
  '포천시를 활용한 교육여행 프로그램',
  '서울·경기권 학교가 접근하기 쉬운 포천에서 자연·지질·역사·문화·과학·농촌을 한 번에 연결하는 현장체험학습·교직원 연수 프로그램입니다.',
  '## 왜 포천 교육여행인가?

포천은 서울·경기권 학교가 접근하기 쉽고, **자연·지질·역사·문화·과학·농촌**을 한 번에 연결할 수 있는 교육여행지입니다.

| 특징 | 내용 |
|------|------|
| 수도권 접근성 | 1일 현장학습부터 숙박형 체험학습까지 유연하게 설계 가능 |
| 생태·지질 자원 | 한탄강, 국립수목원, 비둘기낭폭포 등 현장 탐구 자원 풍부 |
| 융합형 체험 | 포천아트밸리, 어메이징파크, 미디어아트 콘텐츠 연계 |
| 지역상생 교육 | 농촌체험, 로컬푸드, 추천식당, 숙박시설과 함께 운영 |

> **포천 전체를 하나의 교육 캠퍼스로 활용합니다.**

## 프로그램 유형

- **학생용** — 1일·숙박형 체험학습
- **교직원용** — 연수·답사·워크숍
- **지역 인프라** — 숙박·식당·체험처
- **지원 체계** — 버스 지원·협의체

문의: 터치더월드 1800-8078',
  '/company-news/pocheon-education-trip-2026/01.png',
  ARRAY[
    '/company-news/pocheon-education-trip-2026/01.png',
    '/company-news/pocheon-education-trip-2026/02.png',
    '/company-news/pocheon-education-trip-2026/03.png',
    '/company-news/pocheon-education-trip-2026/04.png',
    '/company-news/pocheon-education-trip-2026/05.png',
    '/company-news/pocheon-education-trip-2026/06.png',
    '/company-news/pocheon-education-trip-2026/07.png',
    '/company-news/pocheon-education-trip-2026/08.png',
    '/company-news/pocheon-education-trip-2026/09.png',
    '/company-news/pocheon-education-trip-2026/10.png'
  ],
  NULL,
  ARRAY['#국내', '#포천', '#체험학습', '#교육여행'],
  false,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = NOW();


-- ② 포천지역 교사 1일 연수
INSERT INTO "CompanyNews" (
  "id", "type", "category", "title", "summary", "content",
  "imageUrl", "imageUrls", "link", "hashtags", "isPinned", "createdAt", "updatedAt"
) VALUES (
  'cardnews_pocheon_teacher_training_2026',
  'PROGRAM_CARD_NEWS',
  '교사 연수',
  '포천지역 교사 1일 연수 — 예술정원과 이동갈비',
  '포천예술정원 1999와 포천 이동갈비로 구성한 비숙박형 1일 교직원 연수. 포천시 관광과 버스지원 프로그램 활용, 교직원 30명 기준으로 운영합니다.',
  '## 연수 한눈에 보기

포천시 관광과 버스지원 프로그램을 활용하여 부담 낮은 교직원 환경을 마련했습니다.

| 항목 | 내용 |
|------|------|
| 형태 | 비숙박형 1일 교직원 연수 |
| 인원 | 교직원 30명 |
| 장소 | 포천예술정원 1999 + 포천 이동갈비 |
| 지원 | 포천시 관광과 버스지원 프로그램 |

## 주요 코스

- **포천예술정원 1999** — 예술·자연이 어우러진 힐링 정원 탐방
  (instagram.com/artgarden1999)
- **포천 이동갈비** — 포천 대표 향토 음식으로 구성한 식사

## 지원 혜택

포천시 관광과 버스지원 프로그램을 활용하면 학교 예산 부담 없이 연수를 진행할 수 있습니다.

문의: 터치더월드 1800-8078 · www.touchtheworld.co.kr',
  '/company-news/pocheon-teacher-training-2026/01.png',
  ARRAY[
    '/company-news/pocheon-teacher-training-2026/01.png',
    '/company-news/pocheon-teacher-training-2026/02.png',
    '/company-news/pocheon-teacher-training-2026/03.png',
    '/company-news/pocheon-teacher-training-2026/04.png',
    '/company-news/pocheon-teacher-training-2026/05.png',
    '/company-news/pocheon-teacher-training-2026/06.png',
    '/company-news/pocheon-teacher-training-2026/07.png'
  ],
  NULL,
  ARRAY['#국내', '#포천', '#교사연수'],
  false,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = NOW();
