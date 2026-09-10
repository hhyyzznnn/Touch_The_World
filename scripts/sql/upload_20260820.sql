-- 카드뉴스 CDN 업로드 결과 (20260820) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026/27 선생님들을 위한 교직원 연수 1박 2일 — 추천 숙소 및 서비스 안내
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_teacher_retreat_venue_guide_2026',
  'PROGRAM_CARD_NEWS',
  '교사 연수',
  $pgtag$2026/27 선생님들을 위한 교직원 연수 1박 2일 — 추천 숙소 및 서비스 안내$pgtag$,
  $pgtag$이동 효율·연수 몰입·휴식 품질 세 가지 기준으로, 인천 대형 총회형부터 인천·시흥 오션뷰, 포천·가평 자연 힐링형까지 목적에 맞는 1박 2일 교직원 연수 테마와 숙소를 제안합니다.$pgtag$,
  $pgtag$## 2026/27 선생님들을 위한 교직원 연수 1박 2일 — 추천 숙소 및 서비스 안내

> 쉼·연결·회복을 설계합니다. 1박 2일의 짧은 여정도, 장소와 운영에 따라 조직의 기억이 됩니다.

이동 효율 · 연수 몰입 · 휴식 품질 — 세 가지 기준으로 목적에 맞는 테마와 숙소를 고릅니다. (힐링 · AI/AX · 체험 · 특강 · 레크리에이션 / 대형 총회 · 도심 문화 · 자연 재충전 · 감성 체험)

---

### 인천 01. 스케일과 도심 문화의 조합
- **인스파이어 리조트** — 최대 3,000명 규모 볼룸 · 프리미엄 워크숍
- **하버파크호텔** — 다층 연회장 · 개항장 산책형 연수

### 인천·시흥 02. 모던한 실속과 오션뷰 리프레시
- **글로스터호텔** — 다양한 객실 · 소래포구 연계
- **웨이브엠호텔** — 시화호 컨퍼런스 · 오션뷰 · 네트워킹

### 포천·가평 03. 자연 속 팀워크와 감성 체험
- **한화리조트 산정호수** — 11실 세미나실 · 자연 · 온천
- **쁘띠프랑스** — 문화마을 · 최대 200명 · 체험형 교류

---

우리 학교 교직원 연수, 목적에 맞는 테마와 숙소로 설계해 드립니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUdXzwPA3ASMsE152yTOf7qthwRuCYraJilVxz',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUdXzwPA3ASMsE152yTOf7qthwRuCYraJilVxz', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU898uC1kvWPxgtROoySe7wrziGIMcaqHk6sLB', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU6MAHPI8Ki6lvEAzSPyNtsMBx8dZ1fnhcp2g4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUiezWMBRmWtbG8ZzcQKndEYoT5sxaAJqjBk4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFX2sNgwgfawsy2XEATGp9mPCWbIe37dhq0n5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU6tPBad8Ki6lvEAzSPyNtsMBx8dZ1fnhcp2g4'],
  NULL,
  ARRAY['#인천', '#포천', '#교직원'],
  false,
  '2026-08-20T04:31:24.689Z', '2026-08-20T04:31:24.689Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-20T04:31:24.689Z';

-- 일본 유학의 첫 단추, 아소전문학교그룹 일본어과에서 시작하세요
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_aso_japanese_language_course_2026',
  'PROGRAM_CARD_NEWS',
  '일본 유학',
  $pgtag$일본 유학의 첫 단추, 아소전문학교그룹 일본어과에서 시작하세요$pgtag$,
  $pgtag$일본어만 배우는 유학은 아쉽습니다. 4월 입학, JLPT 수준별 트랙으로 2년간 기초부터 탄탄히 준비하고 IT·비즈니스·관광·디자인·자동차·뷰티 등 아소그룹 13개 전문학교의 전공으로 진학을 이어가는 일본어과 과정입니다.$pgtag$,
  $pgtag$## 일본 유학의 첫 단추, 아소전문학교그룹 일본어과에서 시작하세요

> 일본어를 넘어 전공·진학·취업의 다음 단계를 준비합니다. (ASOJUKUKOREA 공식 한국사무소)

일본어만 배우는 유학, 아쉽지 않나요? 유학의 첫 1년은 단순한 어학 시간이 아니라, 전공을 찾고 진학을 준비하고 일본 생활에 적응하는 출발점입니다.

---

### 아소 일본어과는 '진학의 출발점'입니다
일본 전문학교·대학·대학원 진학을 목표로, 일본과 해외에서 활약할 인재를 준비하는 과정입니다.

### 점수만으로 완성되지 않는 일본어
듣기·말하기·읽기·쓰기를 수준별로 학습하고, JLPT 대비까지. 수업과 생활을 연결해 실용 일본어를 쌓습니다.

### 일본인 학생과 같은 캠퍼스에서
교실 밖에서 사용하는 한마디가 실력을 바꿉니다. 실용 일본어와 일본 문화를 경험하세요.

### 일본어과 다음에는, 나만의 전공
IT·비즈니스 / 관광·브라이덜 / 디자인·게임 / 자동차·기계 / 뷰티 — 아소그룹 13개 전문학교가 다음 진로를 넓힙니다.

### 일본어 수준에 맞는 현실적인 트랙
- **JLPT N4 미만** — 일본어과에서 기초부터
- **JLPT N4 이상** — 희망 전공별 본과 상담

### 4월 입학, 초급부터 2년간 탄탄하게
2년간 JLPT N1 또는 N2 합격을 목표로 진학 준비의 기반을 쌓습니다. (입학 시 N5 정도의 일본어 능력 필요)

---

asosenkorea.com

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUceXmP2iuKEt4biXQ9cYSVykWNO3sarhUqx76',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUceXmP2iuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU545G0zPvi4nVXkGCHlLZ9AhDuQTS7W3Isj60', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUSrCiOTGATzu3WryKjgbwQO6XBcmYGvP74oCd', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUybISIw4zCDEmeMoRlFx8gLPdr1upBU9fb5ji', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwaMBLTrHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUVIHudm9ZiH1cKdoxjhLn7rW92DE6FTRG8CMV', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUawoE810jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUR56zZTmuL4UEYHXyDAqQtaoOgSnmcFJlGTkj'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-08-20T04:31:25.689Z', '2026-08-20T04:31:25.689Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-20T04:31:25.689Z';
