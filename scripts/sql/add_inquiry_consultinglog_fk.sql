-- Inquiry.consultingLogId FK 추가 (한 번만 실행)
ALTER TABLE "Inquiry"
ADD CONSTRAINT "Inquiry_consultingLogId_fkey"
FOREIGN KEY ("consultingLogId")
REFERENCES "ConsultingLog"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
