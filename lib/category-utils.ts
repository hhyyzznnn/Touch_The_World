export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    // 현행 8개 카테고리
    "국내교육여행":      "국내 교육여행",
    "국외교육여행":      "국외 교육여행",
    "체험학습":          "체험학습(숙박형, 비숙박형)",
    "수련활동":          "수련활동",
    "교사연수":          "교사 연수",
    "일본유학":          "일본 유학",
    "특성화고교프로그램": "특성화고교 프로그램",
    "기타프로그램":      "기타 프로그램",
    // 레거시 (기존 프로그램 DB 호환)
    "국내외교육여행":       "국내외 교육여행",
    "해외취업및유학":       "해외 취업 및 유학",
    "지자체및대학RISE사업": "지자체 및 대학 RISE 사업",
    // 구형 카테고리 호환
    "수학여행":      "수학여행",
    "현장 체험학습": "현장 체험학습",
    "현장체험학습":  "체험학습(숙박형, 비숙박형)",
    "교육연수":      "교육연수",
    "해외탐방":      "해외탐방",
    "진로특강":      "진로특강",
  };

  return categoryMap[category] || category;
}

export function getCategoryKey(categoryName: string): string | null {
  const keyMap: Record<string, string> = {
    "국내 교육여행":          "국내교육여행",
    "국외 교육여행":          "국외교육여행",
    "체험학습\n(숙박형, 비숙박형)": "체험학습",
    "체험학습(숙박형, 비숙박형)":   "체험학습",
    "수련활동":               "수련활동",
    "교사 연수":              "교사연수",
    "일본 유학":              "일본유학",
    "특성화고교 프로그램":    "특성화고교프로그램",
    "기타 프로그램":          "기타프로그램",
    // 레거시
    "국내외 교육여행":           "국내외교육여행",
    "해외 취업 및 유학":         "해외취업및유학",
    "지자체 및 대학 RISE 사업":  "지자체및대학RISE사업",
  };

  return keyMap[categoryName] || null;
}

export function getCategoryDetailKey(category: string): string | null {
  const keyMap: Record<string, string> = {
    "국내교육여행":          "국내교육여행",
    "국외교육여행":          "국외교육여행",
    "체험학습":              "체험학습",
    "수련활동":              "수련활동",
    "교사연수":              "교사연수",
    "일본유학":              "일본유학",
    "특성화고교프로그램":    "특성화고교프로그램",
    "기타프로그램":          "기타프로그램",
    // 레거시
    "국내외교육여행":          "국내외교육여행",
    "해외취업및유학":          "해외취업및유학",
    "지자체및대학RISE사업":    "지자체및대학RISE사업",
  };

  return keyMap[category] || null;
}
