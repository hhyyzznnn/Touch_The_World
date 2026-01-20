/**
 * 카카오 알림톡 발송 유틸리티
 * 
 * 참고: 실제 카카오 비즈니스 채널 연동 시 사용
 * - 카카오 비즈니스 채널 개설 필요
 * - 알림톡 템플릿 등록 필요
 * - API 키 발급 필요
 */

interface KakaoAlimtalkOptions {
  phoneNumber: string; // 수신자 전화번호 (하이픈 제외, 숫자만)
  templateCode: string; // 알림톡 템플릿 코드
  message: string; // 메시지 내용
  buttonUrl?: string; // 버튼 링크 (선택)
  buttonText?: string; // 버튼 텍스트 (선택)
}

/**
 * 카카오 알림톡 발송 (구현 예정)
 * 
 * 현재는 로그만 출력하며, 실제 연동 시 아래 SDK 사용:
 * - @kakao/kakao-sdk 또는 카카오 비즈니스 API
 */
export async function sendKakaoAlimtalk(options: KakaoAlimtalkOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: 카카오 비즈니스 채널 연동 후 실제 API 호출
    // const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.KAKAO_ADMIN_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     receiver_uuids: [options.phoneNumber],
    //     template_object: {
    //       object_type: 'text',
    //       text: options.message,
    //       link: options.buttonUrl ? {
    //         web_url: options.buttonUrl,
    //         mobile_web_url: options.buttonUrl,
    //       } : undefined,
    //     },
    //   }),
    // });

    console.log("📱 카카오 알림톡 발송 (개발 모드):", {
      phoneNumber: options.phoneNumber,
      templateCode: options.templateCode,
      message: options.message,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ 카카오 알림톡 발송 실패:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 상담 완료 알림톡 발송
 */
export async function sendConsultingCompleteAlimtalk(
  phoneNumber: string,
  category: string,
  summary: string
): Promise<{ success: boolean; error?: string }> {
  return sendKakaoAlimtalk({
    phoneNumber,
    templateCode: "CONSULTING_COMPLETE",
    message: `[터치더월드] 상담이 완료되었습니다.\n\n카테고리: ${category}\n\n요약:\n${summary}\n\n상세 견적은 이메일로 발송해드리겠습니다.`,
    buttonUrl: "https://touchtheworld.co.kr",
    buttonText: "홈페이지 방문",
  });
}

/**
 * 견적서 도착 알림톡 발송
 */
export async function sendQuoteReadyAlimtalk(
  phoneNumber: string,
  quoteUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendKakaoAlimtalk({
    phoneNumber,
    templateCode: "QUOTE_READY",
    message: `[터치더월드] 견적서가 준비되었습니다.\n\n아래 링크에서 확인해주세요.`,
    buttonUrl: quoteUrl,
    buttonText: "견적서 확인",
  });
}





