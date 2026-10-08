-- 카드뉴스 CDN 업로드 결과 (20261007) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 학교 선생님 업무 지원 가이드 — 교육여행 준비부터 진로·지자체 지원사업까지
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_teacher_work_support_2027',
  'PROGRAM_CARD_NEWS',
  ARRAY['기타 프로그램'],
  $pgtag$학교 선생님 업무 지원 가이드 — 교육여행 준비부터 진로·지자체 지원사업까지$pgtag$,
  $pgtag$교육여행 행정업무 지원부터 선생님·가족 여행 혜택, 학생 진로 확대, 지자체 지원사업 안내까지 — 학교 안팎의 선생님 업무를 함께하는 터치더월드의 네 가지 혜택을 소개합니다.$pgtag$,
  $pgtag$## 학교 선생님 업무 지원 가이드 — 교육여행 준비부터 진로·지자체 지원사업까지

> 선생님의 준비는 간편하게, 학생의 배움은 넓게, 가족의 여행은 든든하게

교육여행 현장의 경험으로 학교와 선생님께 필요한 업무를 함께 살피고 지원합니다. 행정 준비부터 학생의 미래까지, 터치더월드가 학교의 든든한 파트너가 되겠습니다.

### 교육여행 업무 지원
- 학교별 맞춤 일정·견적 제공
- 행정자료, 오리엔테이션, 사전답사 지원
- 교육여행 관련 자료 정리로 준비 시간 절감

### 선생님·가족 여행
- 하나투어 제휴로 여행 목적·예산에 맞는 프로그램 상담 (ttw.hanatour.com)
- 예약 지원과 할인 조건 안내

### 학생의 진로 확대
- 해외 자매학교 연결, 국제교류 컨설팅
- 일본·미국 교육기관 유학 정보, 진로 상담

### 지자체 지원사업
- 인천관광공사·포천시 등 국내외 지자체 지원사업 안내
- 신청 대상·기간·서류 확인 지원, 행사 후 정산까지 투명하게

학교 안팎의 업무, 어디서부터 시작해야 할지 막막하시다면 편하게 문의해 주세요.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUU98TTW60Pc7ZASpuNrlm6DkfMobB984w35eK',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU4KEdBNq7M1YQuaXdvgnmWLRxepATf9wIqbo4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUGg0cKn1lE4snd6Z9SMRJCIXcHVL0eGT1fYBQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUaN37hl0jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUfZ3CkNYXJWu1oVDTHqP8vrcxMZCkl2Kis0fz', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU9F8NRpeBsbTRfHnV7kZmQ5wg32oP1lcydNEp', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUy1tyzT4zCDEmeMoRlFx8gLPdr1upBU9fb5ji', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUNT8KueSxomPErOpCi4wDSJcTzeyZUnfRY31q', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURtGGJymuL4UEYHXyDAqQtaoOgSnmcFJlGTkj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUGvD4Hy1lE4snd6Z9SMRJCIXcHVL0eGT1fYBQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUUJ7i5x60Pc7ZASpuNrlm6DkfMobB984w35eK'],
  NULL,
  ARRAY['#교사', '#교직원', '#터치더월드'],
  false,
  '2026-10-07T11:11:31.864Z', '2026-10-07T11:11:31.864Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-07T11:11:31.864Z';

-- 2027 학교단체 수련활동 2차 사전예약 — 국립청소년시설 7곳 모집 안내
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_kywa_2nd_reservation_2027',
  'PROGRAM_CARD_NEWS',
  ARRAY['수련활동'],
  $pgtag$2027 학교단체 수련활동 2차 사전예약 — 국립청소년시설 7곳 모집 안내$pgtag$,
  $pgtag$한국청소년활동진흥원(KYWA)이 운영하는 전국 7개 국립청소년시설의 2027년 학교단체 수련활동 2차 사전예약이 10월 16일까지 진행됩니다. 시설별 특화 프로그램과 신청 방법을 안내합니다.$pgtag$,
  $pgtag$## 2027 학교단체 수련활동 2차 사전예약 — 국립청소년시설 7곳 모집 안내

> 전국 7개 국립청소년시설에서 다양한 수련활동을 만나보세요 — 한국청소년활동진흥원(KYWA) 2차 사전예약 소식

안전하고 검증된 국립청소년시설에서 학교 교육과정과 연계한 수련활동을 준비할 수 있는 좋은 기회입니다. 모집기간이 짧은 만큼 서둘러 확인해 보시길 권해드립니다.

### 모집 개요
- 집중 모집기간: 2026.10.1.(목) ~ 10.16.(금)
- 참여대상: 전국 초등학생(4학년 이상), 중학교, 고등학교, 특수학교
- 운영형태: 숙박형(1박2일·2박3일), 당일형, 찾아가는 활동형

### 전국 7개 국립청소년시설
- 국립중앙청소년수련원(충남 천안) — 종합 체험활동
- 국립평창청소년수련원(강원 평창) — 야외·모험
- 국립청소년바이오생명센터(전북 김제) — 바이오·생명
- 국립청소년미래환경센터(강북 봉화) — SDGs·미래환경
- 국립청소년우주센터(전남 고흥) — 천문·항공우주
- 국립청소년해양센터(경북 영덕) — 해양환경·선박
- 국립청소년생태센터(부산 사하) — 자연·생태환경

### 안심할 수 있는 이유
- 청소년수련시설 종합평가 최우수 등급 유지
- 국가전문자격 청소년지도사 상주, 청소년수련활동인증제 프로그램 운영
- 활동 전·중·후 안전교육, 시설·장비 점검과 응급대응 체계

### 신청 방법
국립청소년시설별로 전화 선착순 신청하시면 되고, 세부 일정과 예약 가능 여부는 KYWA 누리집 공지사항에서 확인하실 수 있습니다. 어느 시설이 우리 학교에 맞을지 고민되신다면 터치더월드가 함께 비교해 드립니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwbjtoErHwFWdfylzRPVeq7KvU0rQ15C36OSA',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwbjtoErHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUaO9F7H0jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUczuRwCiuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUKJiRMafwYWuiU8LSVTfcamk05EvZzbrtpqjd'],
  NULL,
  ARRAY['#학생', '#교사'],
  false,
  '2026-10-07T11:11:32.864Z', '2026-10-07T11:11:32.864Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-07T11:11:32.864Z';
