export interface CompareProgram {
  id: string;
  title: string;
  category: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  region?: string | null;
  hashtags?: string[];
  priceFrom?: number | null;
  priceTo?: number | null;
  rating?: number | null;
  reviewCount?: number;
  imageUrl?: string | null;
}

interface CompareMutationResult {
  success: boolean;
  message: string;
  list: CompareProgram[];
}

export const PROGRAM_COMPARE_STORAGE_KEY = "programCompare";
export const DEFAULT_MAX_COMPARE_ITEMS = 3;

function isCompareProgram(value: unknown): value is CompareProgram {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.category === "string"
  );
}

function parseCompareList(raw: string): CompareProgram[] {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isCompareProgram);
}

export function readCompareList(): CompareProgram[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(PROGRAM_COMPARE_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return parseCompareList(raw);
  } catch (error) {
    console.error("Failed to parse compare list:", error);
    localStorage.removeItem(PROGRAM_COMPARE_STORAGE_KEY);
    return [];
  }
}

export function writeCompareList(list: CompareProgram[]): void {
  if (typeof window === "undefined") {
    return;
  }

  if (list.length > 0) {
    localStorage.setItem(PROGRAM_COMPARE_STORAGE_KEY, JSON.stringify(list));
    return;
  }

  localStorage.removeItem(PROGRAM_COMPARE_STORAGE_KEY);
}

export function addProgramToCompare(
  program: CompareProgram,
  maxCompare = DEFAULT_MAX_COMPARE_ITEMS
): CompareMutationResult {
  const compareList = readCompareList();

  if (compareList.length >= maxCompare) {
    return {
      success: false,
      message: `최대 ${maxCompare}개까지 비교할 수 있습니다.`,
      list: compareList,
    };
  }

  if (compareList.some((item) => item.id === program.id)) {
    return {
      success: false,
      message: "이미 비교 목록에 추가된 프로그램입니다.",
      list: compareList,
    };
  }

  const updated = [...compareList, program];
  writeCompareList(updated);
  return {
    success: true,
    message: "비교 목록에 추가되었습니다.",
    list: updated,
  };
}
