-- Event.studentCount를 nullable로 변경 (학생 수 표시 안 함 선택지 지원)
-- 기존 0값은 null로 통일 (미입력 의미)
ALTER TABLE "Event" ALTER COLUMN "studentCount" DROP NOT NULL;
UPDATE "Event" SET "studentCount" = NULL WHERE "studentCount" = 0;
