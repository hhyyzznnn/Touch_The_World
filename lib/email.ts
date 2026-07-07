import { Resend } from "resend";

const DEFAULT_FROM_EMAIL = "no-reply@touchtheworld.co.kr";
const DEFAULT_ADMIN_EMAIL = "pjjttw@naver.com";

type VerificationEmailResult = {
  success: boolean;
  error?: string;
  skipped?: boolean;
  data?: unknown;
};

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<VerificationEmailResult> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const isDevelopment = process.env.NODE_ENV !== "production";

  try {
    // 개발 환경: 키가 없으면 콘솔 링크 출력으로 대체
    if (!process.env.RESEND_API_KEY) {
      if (isDevelopment) {
        console.log("=".repeat(60));
        console.log("📧 이메일 인증 링크 (개발 모드)");
        console.log("=".repeat(60));
        console.log(`받는 사람: ${email}`);
        console.log(`인증 링크: ${verificationUrl}`);
        console.log("=".repeat(60));
        return { success: true, skipped: true };
      }
      return {
        success: false,
        error: "RESEND_API_KEY가 설정되지 않아 인증 메일을 발송할 수 없습니다.",
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: email,
      subject: "터치더월드 이메일 인증",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E6D45;">이메일 인증</h2>
          <p>안녕하세요, ${name}님!</p>
          <p>터치더월드 회원가입을 완료하기 위해 아래 링크를 클릭하여 이메일을 인증해주세요.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2E6D45; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              이메일 인증하기
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br/>
            ${verificationUrl}
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            이 링크는 24시간 동안 유효합니다.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("이메일 발송 오류:", error);
      if (isDevelopment) {
        console.log("=".repeat(60));
        console.log("📧 이메일 인증 링크 (개발 모드)");
        console.log("=".repeat(60));
        console.log(`받는 사람: ${email}`);
        console.log(`인증 링크: ${verificationUrl}`);
        console.log("=".repeat(60));
        return { success: true, skipped: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("이메일 발송 오류:", message);
    if (isDevelopment) {
      console.log("=".repeat(60));
      console.log("📧 이메일 인증 링크 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${email}`);
      console.log(`인증 링크: ${verificationUrl}`);
      console.log("=".repeat(60));
      return { success: true, skipped: true };
    }
    return { success: false, error: message };
  }
}

export async function sendInquiryNotificationEmail(
  inquiryData: {
    // 카테고리 1
    schoolName: string;
    contact: string;
    position?: string | null;
    phone?: string | null;
    email?: string | null;
    schoolAddress?: string | null;
    // 카테고리 2
    departureDate?: string | null;
    returnDate?: string | null;
    participantCount?: number | null;
    instructorCount?: number | null;
    targetGrade?: string | null;
    // 카테고리 3
    destination?: string | null;
    purpose?: string | null;
    preferredTransport?: string | null;
    hasInstructor?: boolean | null;
    localTransport?: string | null;
    // 카테고리 4
    accommodation?: string | null;
    accommodationType?: string | null;
    roomAssignment?: string | null;
    mealPreference?: string | null;
    specialDiet?: string | null;
    // 카테고리 5
    requiredSites?: string | null;
    experiencePrograms?: string | null;
    ownEvents?: string | null;
    facilityRequirements?: string | null;
    agentService?: string | null;
    // 카테고리 6
    insurance?: string | null;
    safetyStaff?: boolean | null;
    specialRequests?: string | null;
    rainPlan?: string | null;
    message?: string | null;
    estimatedBudget?: number | null;
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  // 추가 수신자: ADMIN_CC_EMAILS 환경변수에 쉼표로 구분하여 설정
  const ccEmails = process.env.ADMIN_CC_EMAILS
    ? process.env.ADMIN_CC_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : [];
  const recipients = [adminEmail, ...ccEmails];
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    // Resend API 키가 없으면 개발 환경에서 콘솔에 출력
    if (!process.env.RESEND_API_KEY) {
      console.log("=".repeat(60));
      console.log("📧 문의 알림 이메일 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${recipients.join(", ")}`);
      console.log(`학교명: ${inquiryData.schoolName}`);
      console.log(`담당자: ${inquiryData.contact}`);
      console.log(`전화번호: ${inquiryData.phone || "(미입력)"}`);
      console.log(`이메일: ${inquiryData.email || "(미입력)"}`);
      console.log(`문의 내용: ${inquiryData.message || "(없음)"}`);
      console.log("=".repeat(60));
      return { success: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: recipients,
      subject: `[터치더월드] 새로운 문의가 접수되었습니다 - ${inquiryData.schoolName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #2E6D45;">새로운 문의가 접수되었습니다</h2>
          ${[
            { title: "1. 기본 정보", rows: [
              ["학교명", inquiryData.schoolName],
              ["담당자명", inquiryData.contact],
              ["직책", inquiryData.position],
              ["전화번호", inquiryData.phone || "미입력"],
              ["이메일", inquiryData.email || "미입력"],
              ["학교 주소", inquiryData.schoolAddress],
            ]},
            { title: "2. 일정 및 인원", rows: [
              ["출발일", inquiryData.departureDate],
              ["도착일", inquiryData.returnDate],
              ["학생 수", inquiryData.participantCount ? `${inquiryData.participantCount}명` : null],
              ["인솔 교사 수", inquiryData.instructorCount ? `${inquiryData.instructorCount}명` : null],
              ["대상 학년", inquiryData.targetGrade],
            ]},
            { title: "3. 여행 형태 및 선호도", rows: [
              ["여행 지역", inquiryData.destination],
              ["여행 목적", inquiryData.purpose],
              ["주 이동수단", inquiryData.preferredTransport],
              ["인솔자 필요", inquiryData.hasInstructor !== null && inquiryData.hasInstructor !== undefined ? (inquiryData.hasInstructor ? "필요" : "불필요") : null],
              ["현지 교통", inquiryData.localTransport],
            ]},
            { title: "4. 숙박 및 식사", rows: [
              ["숙박 여부", inquiryData.accommodation],
              ["숙박 형태", inquiryData.accommodationType],
              ["객실 배정", inquiryData.roomAssignment],
              ["식사 취향", inquiryData.mealPreference],
              ["특이 식단", inquiryData.specialDiet],
            ]},
            { title: "5. 교육 및 프로그램", rows: [
              ["필수 방문지", inquiryData.requiredSites],
              ["희망 체험 프로그램", inquiryData.experiencePrograms],
              ["자체 행사", inquiryData.ownEvents],
              ["시설 요구사항", inquiryData.facilityRequirements],
              ["섭외 대행 항목", inquiryData.agentService],
            ]},
            { title: "6. 안전·행정 및 기타", rows: [
              ["보험", inquiryData.insurance],
              ["안전 요원", inquiryData.safetyStaff !== null && inquiryData.safetyStaff !== undefined ? (inquiryData.safetyStaff ? "필요" : "불필요") : null],
              ["특별 지원 학생", inquiryData.specialRequests],
              ["우천 대비", inquiryData.rainPlan],
              ["예상 예산", inquiryData.estimatedBudget ? `${inquiryData.estimatedBudget.toLocaleString()}원` : null],
              ["기타 문의", inquiryData.message],
            ]},
          ].map(section => {
            const visibleRows = section.rows.filter(([, v]) => v);
            if (!visibleRows.length) return "";
            return `
              <div style="background-color: #f5f5f5; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
                <h3 style="color: #2E6D45; margin: 0 0 12px; font-size: 14px;">${section.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${visibleRows.map(([label, value]) => `
                    <tr>
                      <td style="padding: 5px 0; font-weight: bold; color: #333; width: 140px; vertical-align: top;">${label}:</td>
                      <td style="padding: 5px 0; color: #666; white-space: pre-wrap;">${value}</td>
                    </tr>
                  `).join("")}
                </table>
              </div>`;
          }).join("")}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/admin/inquiries"
               style="background-color: #2E6D45; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              관리자 페이지에서 확인하기
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            이 이메일은 터치더월드 웹사이트에서 자동으로 발송되었습니다.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("이메일 발송 오류:", error);
      console.log("=".repeat(60));
      console.log("📧 문의 알림 이메일 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${recipients.join(", ")}`);
      console.log(`학교명: ${inquiryData.schoolName}`);
      console.log(`담당자: ${inquiryData.contact}`);
      console.log(`전화번호: ${inquiryData.phone || "(미입력)"}`);
      console.log(`이메일: ${inquiryData.email || "(미입력)"}`);
      console.log(`문의 내용: ${inquiryData.message || "(없음)"}`);
      console.log("=".repeat(60));
      return { success: true };
    }

    return { success: true, data };
  } catch (error) {
    console.error("이메일 발송 오류:", error);
    console.log("=".repeat(60));
    console.log("📧 문의 알림 이메일 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 사람: ${adminEmail}`);
    console.log(`학교명: ${inquiryData.schoolName}`);
    console.log(`담당자: ${inquiryData.contact}`);
    console.log(`전화번호: ${inquiryData.phone || "(미입력)"}`);
    console.log(`이메일: ${inquiryData.email || "(미입력)"}`);
    console.log(`문의 내용: ${inquiryData.message || "(없음)"}`);
    console.log("=".repeat(60));
    return { success: true };
  }
}

export async function sendInquiryReminderEmail(inquiries: Array<{
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  createdAt: Date;
  aiSummary: string | null;
}>) {
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const ccEmails = process.env.ADMIN_CC_EMAILS
    ? process.env.ADMIN_CC_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : [];
  const recipients = [adminEmail, ...ccEmails];
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const count = inquiries.length;

  if (!process.env.RESEND_API_KEY) {
    console.log("=".repeat(60));
    console.log("📧 문의 리마인더 이메일 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`미확인 문의 ${count}건`);
    inquiries.forEach((inq) => console.log(`  - ${inq.schoolName} / ${inq.contact}`));
    console.log("=".repeat(60));
    return { success: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const rowsHtml = inquiries.map((inq) => {
    const hoursAgo = Math.floor((Date.now() - inq.createdAt.getTime()) / (1000 * 60 * 60));
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 8px; color: #333;">${inq.schoolName}</td>
        <td style="padding: 10px 8px; color: #666;">${inq.contact}</td>
        <td style="padding: 10px 8px; color: #666;">${inq.phone || inq.email || "—"}</td>
        <td style="padding: 10px 8px; color: #666; font-size: 12px;">${inq.aiSummary || "—"}</td>
        <td style="padding: 10px 8px; color: #e57c00; font-weight: bold; white-space: nowrap;">${hoursAgo}시간 전</td>
      </tr>
    `;
  }).join("");

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
    to: recipients,
    subject: `[터치더월드] 미확인 문의 ${count}건 — 24시간 경과`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 10px;">
          ⚠️ 미확인 문의 알림
        </h2>
        <p style="color: #555; margin: 15px 0;">
          접수 후 <strong>24시간이 지났지만 아직 확인되지 않은 문의 ${count}건</strong>이 있습니다.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px 8px; text-align: left; color: #333; font-weight: 600;">학교명</th>
              <th style="padding: 10px 8px; text-align: left; color: #333; font-weight: 600;">담당자</th>
              <th style="padding: 10px 8px; text-align: left; color: #333; font-weight: 600;">연락처</th>
              <th style="padding: 10px 8px; text-align: left; color: #333; font-weight: 600;">요약</th>
              <th style="padding: 10px 8px; text-align: left; color: #333; font-weight: 600;">경과</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/admin/inquiries?status=pending"
             style="background-color: #c0392b; color: white; padding: 12px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            미확인 문의 바로 확인하기
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          이 이메일은 터치더월드 자동화 시스템에서 발송되었습니다.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`리마인더 이메일 발송 실패: ${error.message}`);
  }

  return { success: true, data };
}
