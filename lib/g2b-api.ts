/**
 * 나라장터(G2B) API 연동
 * 조달청 나라장터 입찰공고정보서비스 OpenAPI
 * 
 * 서비스 ID: BidPublicInfoService
 * Base URL: http://apis.data.go.kr/1230000/ad/BidPublicInfoService
 */

interface G2BNoticeItem {
  bidNtceNo: string; // 입찰공고번호 (중복 제거 핵심 식별자)
  bidNtceOrd?: string; // 입찰공고 차수
  bidNtceNm: string; // 입찰공고명 (키워드 필터링 대상)
  bidNtceDt?: string; // 공고 등록일시
  dminsttNm?: string; // 수요기관명 (발주기관)
  ntceInsttNm?: string; // 공고기관명
  // 지역 정보 (문서 확인: cnstrtsiteRgnNm 또는 prtcptLmtRgnNm)
  cnstrtsiteRgnNm?: string; // 현장지역명
  prtcptLmtRgnNm?: string; // 참가제한지역명
  prtcptLmtRgnCd?: string; // 참가제한지역코드
  // 분류 정보 (문서 확인: pubPrcrmntClsfcNm 또는 srvceDivNm)
  pubPrcrmntClsfcNm?: string; // 공공조달분류명 (예: '건설폐기물처리서비스')
  srvceDivNm?: string; // 용역구분명 (예: '일반용역')
  // 기초금액 (문서 확인: presmptPrce 또는 기초금액 API의 bssamt)
  presmptPrce?: string; // 추정가격/기초금액
  bidClseDt?: string; // 입찰마감일시 (형식: "2025-12-09 10:00:00")
  bidBeginDt?: string; // 입찰시작일시
  opengDt?: string; // 개찰일시
  // 상세 URL (문서 확인: bidNtceDtlUrl 또는 bidNtceUrl)
  bidNtceDtlUrl?: string; // 상세URL
  bidNtceUrl?: string; // 상세URL (대체 필드명)
  // 기타 필드는 API 응답에 따라 추가 가능
}

interface G2BApiResponse {
  response: {
    header: {
      resultCode: string; // "00" = 정상
      resultMsg: string;
    };
    body: {
      items?: {
        item: G2BNoticeItem | G2BNoticeItem[]; // 단일 또는 배열
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 입찰공고 목록 조회
 * 
 * @param operation - 오퍼레이션명: 'Servc'(용역), 'Cnstwk'(공사), 'Thng'(물품), 'Frgcpt'(외자)
 * @param useSearchApi - 검색 API 사용 여부 (getBidPblancListInfoServcPPSSrch 등)
 * @param params - 조회 파라미터
 * 
 * inqryDiv: 1=등록일시, 2=공고번호, 3=변경일시
 * bidNtceNm: 부분 일치 검색 지원 (검색 API 사용 시)
 */
export async function fetchG2BNotices(
  operation: "Servc" | "Cnstwk" | "Thng" | "Frgcpt" = "Servc",
  params: {
  pageNo?: number;
  numOfRows?: number;
  inqryBgnDt?: string; // 조회 시작일시 (yyyyMMddHHmm) - inqryDiv=1일 때 사용
  inqryEndDt?: string; // 조회 종료일시 (yyyyMMddHHmm) - inqryDiv=1일 때 사용
  bidNtceNo?: string; // 입찰공고번호 (특정 공고 조회) - inqryDiv=2일 때 사용
  bidNtceNm?: string; // 입찰공고명 (키워드 검색 - 부분 일치 지원)
  prtcptLmtRgnCd?: string; // 참가제한지역코드
  prtcptLmtRgnNm?: string; // 참가제한지역명
  useSearchApi?: boolean; // 검색 API 사용 여부 (getBidPblancListInfoServcPPSSrch)
  inqryDiv?: number; // 조회 구분 (1:등록일시, 2:공고번호, 3:변경일시)
}): Promise<G2BNoticeItem[]> {
  const serviceKey = process.env.NARA_BID_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("NARA_BID_SERVICE_KEY가 설정되지 않았습니다.");
  }

  // Base URL: http (https 아님)
  // 검색 API 사용 여부에 따라 엔드포인트 결정
  const endpoint = params.useSearchApi && operation === "Servc"
    ? `getBidPblancListInfo${operation}PPSSrch` // 검색 API (키워드 검색 지원)
    : `getBidPblancListInfo${operation}`; // 기본 목록 API
  const baseUrl = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/${endpoint}`;
  
  // inqryDiv 결정: 날짜가 있으면 1, 공고번호가 있으면 2, 없으면 1 (등록일시 기준)
  const inqryDiv = params.inqryDiv || (params.bidNtceNo ? 2 : 1);
  
  const searchParams = new URLSearchParams({
    ServiceKey: serviceKey, // 대문자 S (인코딩 주의)
    pageNo: String(params.pageNo || 1),
    numOfRows: String(params.numOfRows || 10),
    type: "json",
    inqryDiv: String(inqryDiv),
    ...(inqryDiv === 1 && params.inqryBgnDt && { inqryBgnDt: params.inqryBgnDt }),
    ...(inqryDiv === 1 && params.inqryEndDt && { inqryEndDt: params.inqryEndDt }),
    ...(inqryDiv === 2 && params.bidNtceNo && { bidNtceNo: params.bidNtceNo }),
    // 검색 API 사용 시 키워드 검색 파라미터 (부분 일치 지원)
    ...(params.bidNtceNm && { bidNtceNm: params.bidNtceNm }),
    // 지역 검색 파라미터
    ...(params.prtcptLmtRgnCd && { prtcptLmtRgnCd: params.prtcptLmtRgnCd }),
    ...(params.prtcptLmtRgnNm && { prtcptLmtRgnNm: params.prtcptLmtRgnNm }),
  });

  try {
    const url = `${baseUrl}?${searchParams.toString()}`;
    console.log("API 호출 URL:", url.replace(serviceKey, "***"));
    
    const response = await fetch(url);
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("API 응답 상태:", response.status);
      console.error("API 응답 본문:", responseText.substring(0, 500));
      throw new Error(`나라장터 API 오류: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    let data: G2BApiResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON 파싱 실패. 응답:", responseText.substring(0, 500));
      throw new Error(`JSON 파싱 실패: ${responseText.substring(0, 200)}`);
    }
    
    // 응답 구조 확인 (에러 응답 처리)
    let responseData = data.response;
    if (!responseData && (data as any)["nkoneps.com.response.ResponseError"]) {
      responseData = (data as any)["nkoneps.com.response.ResponseError"];
    }
    
    if (!responseData) {
      console.error("응답 구조 오류. 전체 응답:", JSON.stringify(data, null, 2));
      throw new Error("응답 구조가 예상과 다릅니다.");
    }

    // resultCode 확인 (00: 정상, 01: Application Error, 10: 잘못된 파라미터, 20: 접근 거부, 08: 필수값 입력 에러)
    const resultCode = responseData?.header?.resultCode;
    if (!resultCode) {
      console.error("응답 구조:", JSON.stringify(data, null, 2));
      throw new Error("resultCode를 찾을 수 없습니다. 응답 구조를 확인하세요.");
    }
    
    if (resultCode !== "00") {
      const errorMsg = responseData?.header?.resultMsg || "알 수 없는 오류";
      let errorDetail = "";
      if (resultCode === "00") errorDetail = "정상";
      else if (resultCode === "01" || resultCode === "04" || resultCode === "05") errorDetail = "제공기관 시스템 오류 (Application/HTTP/Timeout)";
      else if (resultCode === "07") errorDetail = "입력범위값 초과 (날짜 조회 범위 확인 필요, 최대 1개월)";
      else if (resultCode === "08") errorDetail = "필수값 입력 에러 (날짜 파라미터 확인 필요)";
      else if (resultCode === "10") errorDetail = "서비스키 미전달";
      else if (resultCode === "22") errorDetail = "서비스 요청 제한 횟수 초과 (일일 트래픽 초과)";
      else if (resultCode === "30") errorDetail = "서비스키 불일치 (인코딩 여부 확인)";
      else if (resultCode === "20") errorDetail = "서비스 접근 거부 (활용 신청 미승인 등)";
      throw new Error(`API 오류 [${resultCode}]: ${errorMsg}${errorDetail ? ` (${errorDetail})` : ""}`);
    }
    
    // responseData를 data.response에 할당
    data.response = responseData;

    // items가 없거나 비어있는 경우
    if (!data.response?.body?.items) {
      console.log("응답에 items가 없습니다. 전체 응답:", JSON.stringify(data, null, 2));
      return [];
    }

    // 응답 구조 확인: items가 배열인지, items.item인지
    let items: any[] = [];
    const itemsData = data.response.body.items;
    
    if (Array.isArray(itemsData)) {
      // items 자체가 배열인 경우
      items = itemsData;
    } else if (Array.isArray(itemsData.item)) {
      // items.item이 배열인 경우
      items = itemsData.item;
    } else if (itemsData.item) {
      // items.item이 단일 객체인 경우
      items = [itemsData.item];
    } else {
      // 다른 구조일 수 있음
      console.log("응답 구조 확인:", JSON.stringify(itemsData, null, 2));
    }

    console.log(`조회된 공고 수 (필터링 전): ${items.length}개`);
    
    // 키워드 필터링 (API에서 지원 안 할 수 있으므로 클라이언트 측 필터링)
    if (params.bidNtceNm && items.length > 0) {
      const keyword = params.bidNtceNm.toLowerCase();
      const beforeCount = items.length;
      
      // 필터링 전 공고명 샘플 출력 (디버깅)
      if (items.length > 0) {
        console.log(`조회된 공고명 샘플: ${items[0].bidNtceNm}`);
      }
      
      items = items.filter((item: any) => 
        item.bidNtceNm?.toLowerCase().includes(keyword)
      );
      console.log(`키워드 "${params.bidNtceNm}" 필터링: ${beforeCount}개 → ${items.length}개`);
      if (items.length > 0) {
        console.log(`필터링된 첫 번째 공고: ${items[0].bidNtceNm}`);
      }
    }

    if (items.length > 0) {
      console.log(`최종 공고 ${items.length}개 조회 성공`);
    }

    return items;
  } catch (error) {
    console.error("나라장터 API 호출 실패:", error);
    throw error;
  }
}

/**
 * 입찰공고 데이터 파싱
 * DB 저장 형식으로 변환
 */
export function parseG2BNotice(item: G2BNoticeItem) {
  // 기초금액 파싱 (쉼표 제거 후 BigInt 변환)
  let budget: bigint | null = null;
  if (item.presmptPrce) {
    const cleaned = item.presmptPrce.replace(/,/g, "").trim();
    if (cleaned && !isNaN(Number(cleaned))) {
      budget = BigInt(cleaned);
    }
  }

  // 날짜 파싱 (실제 형식: "2025-12-09 10:00:00")
  let deadline: Date | null = null;
  if (item.bidClseDt) {
    // "2025-12-09 10:00:00" 형식 처리
    deadline = new Date(item.bidClseDt.replace(" ", "T"));
    if (isNaN(deadline.getTime())) {
      deadline = null;
    }
  }

  // 상세 URL 생성 (문서 확인: bidNtceDtlUrl 또는 bidNtceUrl 필드 사용)
  const url = item.bidNtceDtlUrl || item.bidNtceUrl || 
    `https://www.g2b.go.kr/ep/co/coo/coo01/coo0101/coo010101/selectBidNtcDetail.do?bidNtcSeq=${item.bidNtceNo}`;

  // 지역 정보 추출 (문서 확인: cnstrtsiteRgnNm 또는 prtcptLmtRgnNm 우선)
  const region = item.cnstrtsiteRgnNm || item.prtcptLmtRgnNm || null;
  
  // 분류 정보 추출 (문서 확인: pubPrcrmntClsfcNm 또는 srvceDivNm)
  const category = item.pubPrcrmntClsfcNm || item.srvceDivNm || null;

  return {
    noticeId: item.bidNtceNo, // 중복 제거 핵심 식별자
    title: item.bidNtceNm, // 키워드 필터링 대상
    agency: item.dminsttNm || item.ntceInsttNm || "알 수 없음", // 수요기관명 또는 공고기관명
    region: region, // 지역명 (현장지역명 또는 참가제한지역명)
    category: category, // 분류명 (공공조달분류명 또는 용역구분명)
    budget: budget, // 기초금액 (presmptPrce 또는 기초금액 API의 bssamt)
    deadline: deadline, // 입찰마감일시
    url: url, // 상세URL (bidNtceDtlUrl 또는 bidNtceUrl)
  };
}

/**
 * 최근 N일간의 공고 조회
 * 날짜 형식: yyyyMMddHHmm (12자리)
 * 
 * 주의: 문서상 최대 1개월(30일) 제한 가능성
 */
export function getDateRange(days: number = 1): { start: string; end: string } {
  // 최대 30일로 제한 (문서 확인: 최대 1개월 제한 가능성)
  const maxDays = Math.min(days, 30);
  
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - maxDays);

  const format = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}${month}${day}${hour}${minute}`;
  };

  return {
    start: format(start),
    end: format(end),
  };
}

