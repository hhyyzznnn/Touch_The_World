# Card News Import

카드뉴스 원본 이미지를 카테고리별로 넣어주세요.

권장 구조:

```text
cardnews-import/
  experience-learning/
    001-post-title/
      01.png
      02.png
      03.png
  teacher-training/
    001-post-title/
      01.jpg
      02.jpg
```

폴더 하나를 카드뉴스 게시물 하나로 처리합니다.

카테고리 폴더:

- `domestic-study-tour` - 국내수학여행
- `overseas-education-trip` - 국내외교육여행
- `experience-learning` - 체험학습
- `retreat-activity` - 수련활동
- `teacher-training` - 교사연수
- `overseas-career-study` - 해외취업및유학
- `rise-project` - 지자체및대학RISE사업
- `specialized-highschool` - 특성화고교프로그램
- `other-programs` - 기타프로그램

이미지 파일명은 카드뉴스 순서대로 정렬되게 `01.png`, `02.png`처럼 맞춰두면 좋습니다.
제목을 아직 정하지 않았다면 게시물 폴더명은 `001`, `002`처럼 숫자만 써도 됩니다.
