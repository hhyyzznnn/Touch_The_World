-- 카드뉴스 CDN 업로드 결과 (20261013) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026-27 특성화고 학교 맞춤형 프로그램 — 7대 분야 48개 프로그램·모듈
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_specialized_highschool_custom_programs_2027',
  'PROGRAM_CARD_NEWS',
  ARRAY['특성화고 프로그램'],
  $pgtag$2026-27 특성화고 학교 맞춤형 프로그램 — 7대 분야 48개 프로그램·모듈$pgtag$,
  $pgtag$공통 역량강화부터 국내 미래산업 탐방, 해외 공업계열 탐방, 상업·서비스·생활계열, 웹툰·애니메이션, 글로벌 교류·진학·취업, 독서·창작·교원 연수까지 — 학과·학년·예산·일정에 맞춰 조합하는 특성화고 맞춤형 프로그램입니다.$pgtag$,
  $pgtag$## 2026-27 특성화고 학교 맞춤형 프로그램 — 7대 분야 48개 프로그램·모듈

> 특성화고의 배움, 세상으로 이어지다 — 교육여행·직무체험·미래역량·글로벌 진로를 한 체계로

전공 탐색에서 현장 체험, 결과물 완성, 진로 설계까지 이어지도록 7대 분야 48개 프로그램·모듈로 구성했습니다. 학과·학년·예산·일정에 맞춰 필요한 것만 골라 조합할 수 있습니다.

### 7대 분야
- 공통 역량강화 — 신입생 적응, 리더십, 취업캠프, 생성형 AI·업무자동화, 창업 (전 학과·1~3학년)
- 국내 미래산업 탐방 — AI·로봇, 반도체, 수소에너지, 자동차, 스마트시티, 군특성화 (인천·수도권·충남·대전·부산·전라도)
- 해외 공업계열 탐방 — 후쿠오카·기타큐슈·오사카, 상하이 전기차, 칭다오 물류
- 상업·서비스·생활계열 — 조리·제과·호텔·관광·뷰티·유통·무역·카페·브랜드 창업
- 웹툰·애니메이션 — 후쿠오카·도쿄 전공연수, 배경 스케치·IP 탐구·창작
- 글로벌 교류·진학·취업 — 현장학습, 한일교류, 전공 일본어, ASO 전공탐색
- 독서·창작·교원 연수 — 3개년 전공 독서, 1인 1책 프로젝트, 교원 AI 수업설계, 일본 직업교육 탐방

### 학년별 성장 로드맵
- 1학년 — 적응·자기이해·전공동기
- 2학년 — 실무탐구·글로벌경험·협업
- 3학년 — 진학·취업·결과물 완성

### 운영 방식
- 학과·학년·예산·일정에 맞춘 조합, 원문 코스·활동 모듈 재구성
- 교류학교 담당교사 소통 채널 확보, 항공 예약 마감 관리
- 기관 섭외·운영 조건은 사전에 별도 확인

우리 학교 학과와 학년에 맞는 조합이 궁금하시다면 편하게 문의해 주세요.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUYACgI4zNMLoU3AIlab5GuSR7Qy4V8n9giExh',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoULQ9AJvjtWT9kdC5A7mlgBvzQ6GDahr3Lyn2U', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgbBsU5fVXJUlt9KLoPkdygb370m1TYGDOHec', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUVv00TlZiH1cKdoxjhLn7rW92DE6FTRG8CMVs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUVcOQcTZiH1cKdoxjhLn7rW92DE6FTRG8CMVs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUYI449pzNMLoU3AIlab5GuSR7Qy4V8n9giExh', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoULGvZrCjtWT9kdC5A7mlgBvzQ6GDahr3Lyn2U', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUWCQyp3FSlgJbqTfzrA6YP9vu8Gp1y74EtnIQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU0q5tJ4Eyf6Wg1mIOscD4u2Tnw03qrpXB7FER', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUZpYxcIHb1lfBSWUbzQmR7gGvJVsNTPeHuy40', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUCWVhtvA4iNT9WZywgO2XQDevaCVxqslIt3S1'],
  NULL,
  ARRAY['#일본', '#특성화고', '#학생'],
  false,
  '2026-10-13T03:52:11.811Z', '2026-10-13T03:52:11.811Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-13T03:52:11.811Z';

-- 2027 겨울방학 뉴질랜드 2주 Fun English Camp — 오클랜드 영어교육·로토루아·타우포 체험
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_newzealand_fun_english_camp_2027',
  'PROGRAM_CARD_NEWS',
  ARRAY['국외 교육여행'],
  $pgtag$2027 겨울방학 뉴질랜드 2주 Fun English Camp — 오클랜드 영어교육·로토루아·타우포 체험$pgtag$,
  $pgtag$2027년 1월 8일~22일 2주간 오클랜드에서 영어교육을 받고 로토루아·타우포를 체험하는 만 12~17세 대상 캠프입니다. 20명 선착순 추가 모집 중이며 모집 마감은 2026년 11월 20일입니다.$pgtag$,
  $pgtag$## 2027 겨울방학 뉴질랜드 2주 Fun English Camp — 오클랜드 영어교육·로토루아·타우포 체험

> 4주가 부담스럽다면, 짧지만 알찬 2주 — 영어를 배우고, 사용하고, 뉴질랜드를 직접 경험합니다

오클랜드 교육문화원(AECC)과 함께하는 겨울방학 프로그램입니다. 평일에는 영어교육센터에서 수업을 듣고, 오클랜드 문화체험과 로토루아·타우포 체험여행을 더했습니다.

### 프로그램 일정
- 기간: 2027년 1월 8일(금) ~ 1월 22일(금), 2주 15일
- 대상: 만 12세 ~ 17세
- 인원: 20명 선착순 추가 모집 중
- 참가비: NZ$4,300 (국제선 왕복항공료 별도)
- 모집 마감: 2026년 11월 20일 (잔여 인원 선착순 마감)

### 구성 — English + Auckland + Rotorua & Taupō
- 영어교육 — 평일 영어교육센터 중심 수업, 참가 학생의 연령과 영어 수준을 고려해 운영
- 오클랜드 — 문화체험·액티비티
- 로토루아·타우포 — 자연환경, 마오리 문화, 지열지대 체험

### 이런 학생에게 추천
- 처음 해외 영어캠프에 참가하는 학생
- 4주는 기간·비용이 부담스러운 가정
- 영어 공부와 해외 문화체험을 함께 원하는 학생
- 향후 뉴질랜드 스쿨링·단기유학을 고려하는 학생

### AECC 현지 관리
- 교육 + 생활관리 + 문화체험 + 현지 CARE
- 1998년부터 이어온 뉴질랜드 교육·학생교류 경험
- 4주 스쿨링(현지 정규학교 생활)과 달리 영어교육·문화체험·여행 중심 구성

학교 및 지자체 단위 상담도 환영합니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUCByNrkA4iNT9WZywgO2XQDevaCVxqslIt3S1',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgbXUdRtVXJUlt9KLoPkdygb370m1TYGDOHec', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUi6B0PaRmWtbG8ZzcQKndEYoT5sxaAJqjBk4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUcmu5GnRiuKEt4biXQ9cYSVykWNO3sarhUqx7', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUiWgrZivRmWtbG8ZzcQKndEYoT5sxaAJqjBk4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUjXsnA8cBK8DaS6t3R29uH7U0qEZhrgAdocLY', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUdCn4MR3ASMsE152yTOf7qthwRuCYraJilVxz', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUaCsh460jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUdSSJUU3ASMsE152yTOf7qthwRuCYraJilVxz', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUw6FSdarHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgosYB9VXJUlt9KLoPkdygb370m1TYGDOHecs'],
  NULL,
  ARRAY['#해외', '#중등', '#고등'],
  false,
  '2026-10-13T03:52:12.811Z', '2026-10-13T03:52:12.811Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-13T03:52:12.811Z';
