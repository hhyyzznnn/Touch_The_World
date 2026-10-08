/**
 * 나라장터 알림 발송 로직
 */

import { prisma } from "./prisma";
import { fetchG2BNotices, parseG2BNotice } from "./g2b-api";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * 공고와 알림 설정 매칭 확인
 */
function matchesNotificationSetting(
  notice: {
    title: string;
    region: string | null;
    category: string | null;
    budget: bigint | null;
  },
  setting: {
    keywords: string[];
    regions: string[];
    categories: string[];
    minBudget: bigint | null;
    maxBudget: bigint | null;
  }
): { matched: boolean; matchedKeywords: string[] } {
  const matchedKeywords: string[] = [];

  // 키워드 매칭
  if (setting.keywords.length > 0) {
    const titleLower = notice.title.toLowerCase();
    for (const keyword of setting.keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }
    if (matchedKeywords.length === 0) {
      return { matched: false, matchedKeywords: [] };
    }
  }

  // 지역 매칭
  if (setting.regions.length > 0 && notice.region) {
    const region = notice.region; // null 체크 후 명시적 할당
    const regionMatched = setting.regions.some(
      (r) => region.includes(r) || r.includes(region)
    );
    if (!regionMatched) {
      return { matched: false, matchedKeywords: [] };
    }
  }

  // 분류 매칭
  if (setting.categories.length > 0 && notice.category) {
    const category = notice.category; // null 체크 후 명시적 할당
    const categoryMatched = setting.categories.some(
      (c) => category.includes(c) || c.includes(category)
    );
    if (!categoryMatched) {
      return { matched: false, matchedKeywords: [] };
    }
  }

  // 예산 매칭
  if (notice.budget) {
    if (setting.minBudget && notice.budget < setting.minBudget) {
      return { matched: false, matchedKeywords: [] };
    }
    if (setting.maxBudget && notice.budget > setting.maxBudget) {
      return { matched: false, matchedKeywords: [] };
    }
  }

  return { matched: true, matchedKeywords };
}

/**
 * 일일 알림 이메일 발송 (여러 공고를 하나의 메일로)
 */
export async function sendDailyNotificationEmail(
  email: string,
  notices: Array<{
    title: string;
    agency: string;
    region: string | null;
    category: string | null;
    budget: bigint | null;
    deadline: Date | null;
    url: string;
    matchedKeywords: string[];
  }>,
  dateRange: { start: string; end: string }
) {
  if (notices.length === 0) {
    return { success: true, skipped: true };
  }

  if (!resend) {
    console.log("📧 일일 알림 이메일 (개발 모드):", { email, count: notices.length });
    return { success: true };
  }

  // 날짜 범위 포맷팅
  const formatDateDisplay = (dateStr: string): string => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  const dateDisplay = formatDateDisplay(dateRange.start);
  if (dateRange.start !== dateRange.end) {
    const endDisplay = formatDateDisplay(dateRange.end);
    // 같은 날이면 하나만 표시
  }

  // 공고 목록 HTML 생성
  const noticesHtml = notices.map((notice, index) => {
    const budgetText = notice.budget
      ? `${(Number(notice.budget) / 100000000).toFixed(1)}억원`
      : "미정";
    
    const deadlineText = notice.deadline
      ? notice.deadline.toLocaleDateString("ko-KR")
      : "미정";

    return `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2E6D45;">
        <h3 style="margin-top: 0; margin-bottom: 10px; color: #2E6D45;">${index + 1}. ${notice.title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #333; width: 100px;">발주기관:</td>
            <td style="padding: 4px 0; color: #666;">${notice.agency}</td>
          </tr>
          ${notice.region ? `
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #333;">지역:</td>
            <td style="padding: 4px 0; color: #666;">${notice.region}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #333;">예산:</td>
            <td style="padding: 4px 0; color: #666;">${budgetText}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #333;">마감일:</td>
            <td style="padding: 4px 0; color: #666;">${deadlineText}</td>
          </tr>
          ${notice.matchedKeywords.length > 0 ? `
          <tr>
            <td style="padding: 4px 0; font-weight: bold; color: #333;">키워드:</td>
            <td style="padding: 4px 0; color: #666;">${notice.matchedKeywords.join(', ')}</td>
          </tr>
          ` : ''}
        </table>
        <div style="margin-top: 10px;">
          <a href="${notice.url}" 
             style="color: #2E6D45; text-decoration: none; font-size: 13px;">
            공고 상세 보기 →
          </a>
        </div>
      </div>
    `;
  }).join("");

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
    to: email,
    subject: `[나라장터 알림] ${dateDisplay} 교육여행 입찰 공고 ${notices.length}건`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #2E6D45; border-bottom: 2px solid #2E6D45; padding-bottom: 10px;">
          나라장터 교육여행 입찰 공고 알림
        </h2>
        <p style="color: #666; font-size: 14px; margin: 15px 0;">
          <strong>${dateDisplay}</strong> 기준으로 등록된 교육여행 관련 입찰 공고 <strong>${notices.length}건</strong>을 안내드립니다.
        </p>
        <div style="margin: 20px 0;">
          ${noticesHtml}
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #666;">
          <p style="margin: 0;">
            이 이메일은 나라장터 알림 자동화 시스템에서 매일 오전 9시에 자동으로 발송됩니다.<br/>
            새로운 공고가 등록되면 다음 날 오전 9시에 알림을 받으실 수 있습니다.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }

  return { success: true, data };
}

/**
 * 나라장터 공고 조회 및 알림 발송
 */
export async function processG2BNotifications() {
  try {
    // 1. 어제 오전 9시 이후 ~ 오늘 오전 9시 이전 공고 조회
    // (매일 오전 9시 실행 기준: 전날 9시 이후 ~ 당일 9시 이전)
    const now = new Date();
    const today9am = new Date(now);
    today9am.setHours(9, 0, 0, 0);
    const yesterday9am = new Date(today9am.getTime() - 24 * 60 * 60 * 1000);

    // 항상 "어제 9시 ~ 오늘 9시" 구간으로 조회 (크론이 9시에 돌면 전날 등록된 공고 수집)
    const startDate = yesterday9am;
    const endDate = today9am;
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}${month}${day}${hour}${minute}`;
    };
    
    const dateRange = {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
    
    // 교육여행 관련 키워드로 검색
    const keywords = ["교육여행", "수학여행", "체험학습", "현장체험"];
    let allNotices: any[] = [];
    
    for (const keyword of keywords) {
      const notices = await fetchG2BNotices("Servc", {
        pageNo: 1,
        numOfRows: 50,
        inqryDiv: 1,
        inqryBgnDt: dateRange.start,
        inqryEndDt: dateRange.end,
        bidNtceNm: keyword,
        useSearchApi: true, // 검색 API 사용 (키워드 검색 지원)
      });
      allNotices = [...allNotices, ...notices];
    }
    
    // 중복 제거 (noticeId 기준)
    const uniqueNotices = Array.from(
      new Map(allNotices.map((n) => [n.bidNtceNo, n])).values()
    );

    // 2. 활성화된 알림 설정 조회
    const settings = await prisma.notificationSetting.findMany({
      where: { enabled: true },
    });

    // 기본 수신자 설정 (알림 설정이 없어도 발송)
    const defaultRecipient = process.env.BID_NOTICE_RECIPIENT_EMAIL;
    const hasSettings = settings.length > 0;

    if (uniqueNotices.length === 0) {
      console.log("새로운 공고가 없습니다.");
      return { processed: 0, sent: 0 };
    }

    if (!hasSettings && !defaultRecipient) {
      console.log("알림 설정과 기본 수신자가 없습니다.");
      return { processed: 0, sent: 0 };
    }

    let processed = 0;
    let sent = 0;

    // 3. 수신자별 공고 수집 (일괄 발송을 위해)
    const recipientNoticesMap = new Map<string, Array<{
      title: string;
      agency: string;
      region: string | null;
      category: string | null;
      budget: bigint | null;
      deadline: Date | null;
      url: string;
      matchedKeywords: string[];
      noticeId: string;
      userId?: string;
    }>>();

    // 3. 각 공고에 대해 알림 설정과 매칭
    for (const noticeItem of uniqueNotices) {
      const parsed = parseG2BNotice(noticeItem);

      // 이미 저장된 공고인지 확인
      const existing = await prisma.g2BNotice.findUnique({
        where: { noticeId: parsed.noticeId },
      });

      if (existing) {
        continue; // 이미 처리된 공고
      }

      // 공고 저장
      const savedNotice = await prisma.g2BNotice.create({
        data: {
          noticeId: parsed.noticeId,
          title: parsed.title,
          agency: parsed.agency,
          region: parsed.region,
          category: parsed.category,
          budget: parsed.budget,
          deadline: parsed.deadline,
          url: parsed.url,
          status: "new",
        },
      });

      processed++;

      // 알림 발송 대상 목록
      const recipients: Array<{ 
        email: string; 
        userId?: string; 
        matchedKeywords: string[];
        notices?: Array<any>;
      }> = [];

      // 알림 설정과 매칭 확인
      if (hasSettings) {
        for (const setting of settings) {
          const match = matchesNotificationSetting(
            {
              title: parsed.title,
              region: parsed.region,
              category: parsed.category,
              budget: parsed.budget,
            },
            {
              keywords: setting.keywords,
              regions: setting.regions,
              categories: setting.categories,
              minBudget: setting.minBudget,
              maxBudget: setting.maxBudget,
            }
          );

          if (match.matched) {
            recipients.push({
              email: setting.email,
              userId: setting.userId,
              matchedKeywords: match.matchedKeywords,
            });
          }
        }
      }

      // 알림 설정이 없거나 매칭된 설정이 없으면 기본 수신자에게 발송
      if (recipients.length === 0 && defaultRecipient) {
        // 공고명에서 키워드 추출
        const titleLower = parsed.title.toLowerCase();
        const matchedKeywords: string[] = [];
        if (titleLower.includes("교육여행")) matchedKeywords.push("교육여행");
        if (titleLower.includes("수학여행")) matchedKeywords.push("수학여행");
        if (titleLower.includes("체험학습")) matchedKeywords.push("체험학습");
        if (titleLower.includes("현장체험")) matchedKeywords.push("현장체험");

        recipients.push({
          email: defaultRecipient,
          matchedKeywords: matchedKeywords,
        });
      }

      // 수신자별 공고 수집
      for (const recipient of recipients) {
        const key = recipient.email;
        if (!recipientNoticesMap.has(key)) {
          recipientNoticesMap.set(key, []);
        }
        recipientNoticesMap.get(key)!.push({
          ...parsed,
          matchedKeywords: recipient.matchedKeywords,
          noticeId: savedNotice.id,
          userId: recipient.userId,
        });
      }
    }

    // 4. 수신자별로 일괄 이메일 발송 (하루 분량을 하나의 메일로)
    for (const [email, notices] of Array.from(recipientNoticesMap.entries())) {
      if (notices.length === 0) continue;

      try {
        // 일일 알림 이메일 발송
        await sendDailyNotificationEmail(email, notices, dateRange);

        // 각 공고에 대해 로그 생성 및 상태 업데이트
        for (const notice of notices) {
          // 알림 로그 생성 (userId가 있는 경우만)
          if (notice.userId) {
            const log = await prisma.notificationLog.create({
              data: {
                userId: notice.userId,
                noticeId: notice.noticeId,
                email: email,
                status: "sent",
                sentAt: new Date(),
              },
            });
          }

          // 공고 상태 업데이트
          await prisma.g2BNotice.update({
            where: { id: notice.noticeId },
            data: {
              matchedKeywords: notice.matchedKeywords,
              status: "notified",
            },
          });
        }

        sent += notices.length;
        console.log(`✅ ${email}: ${notices.length}개 공고 일괄 발송 완료`);
      } catch (error: any) {
        console.error(`❌ ${email} 발송 실패:`, error.message);
        // 실패한 공고 로그 기록
        for (const notice of notices) {
          if (notice.userId) {
            try {
              await prisma.notificationLog.create({
                data: {
                  userId: notice.userId,
                  noticeId: notice.noticeId,
                  email: email,
                  status: "failed",
                  errorMessage: error.message,
                },
              });
            } catch (e) {
              // 로그 생성 실패 무시
            }
          }
        }
      }
    }

    return { processed, sent };
  } catch (error) {
    console.error("나라장터 알림 처리 오류:", error);
    throw error;
  }
}

