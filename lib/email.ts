import { Resend } from "resend";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  try {
    // Resend API 키가 없으면 개발 환경에서 콘솔에 출력
    if (!process.env.RESEND_API_KEY) {
      console.log("=".repeat(60));
      console.log("📧 이메일 인증 링크 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${email}`);
      console.log(`인증 링크: ${verificationUrl}`);
      console.log("=".repeat(60));
      return { success: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
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
      // 개발 환경에서는 콘솔에 출력
      console.log("=".repeat(60));
      console.log("📧 이메일 인증 링크 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${email}`);
      console.log(`인증 링크: ${verificationUrl}`);
      console.log("=".repeat(60));
      return { success: true };
    }

    return { success: true, data };
  } catch (error) {
    console.error("이메일 발송 오류:", error);
    // 오류 발생 시에도 개발 환경에서는 콘솔에 출력
    console.log("=".repeat(60));
    console.log("📧 이메일 인증 링크 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 사람: ${email}`);
    console.log(`인증 링크: ${verificationUrl}`);
    console.log("=".repeat(60));
    return { success: true };
  }
}

