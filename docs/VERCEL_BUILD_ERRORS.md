# Vercel 빌드 오류 해결 가이드

이 문서는 Vercel 배포 시 발생한 빌드 오류들과 해결 방법을 정리한 것입니다. 같은 유형의 오류가 다시 발생하지 않도록 참고하세요.

## 📋 목차

1. [ESLint 오류](#eslint-오류)
2. [JSX 구조 오류](#jsx-구조-오류)
3. [TypeScript 타입 오류](#typescript-타입-오류)
4. [빌드 전 체크리스트](#빌드-전-체크리스트)

---

## ESLint 오류

### 1. 따옴표 HTML 엔티티 오류

**오류 메시지:**
```
Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
```

**발생 위치:**
- `app/about/page.tsx` - 인용문에서 일반 따옴표 사용

**원인:**
- JSX 내에서 일반 따옴표(`"`)와 작은따옴표(`'`)를 직접 사용하면 ESLint 오류 발생

**해결 방법:**
- 일반 따옴표(`"`) → `&ldquo;` (시작), `&rdquo;` (끝)
- 작은따옴표(`'`) → `&lsquo;` (시작), `&rsquo;` (끝)

**예시:**
```tsx
// ❌ 잘못된 코드
<p>"현장이 가장 큰 교실입니다."</p>

// ✅ 올바른 코드
<p>&ldquo;현장이 가장 큰 교실입니다.&rdquo;</p>
```

**주의사항:**
- JSX 내의 모든 텍스트에서 따옴표 사용 시 HTML 엔티티로 변환 필요
- 특히 인용문, 설명 텍스트 등에서 주의

---

## JSX 구조 오류

### 2. 조건부 렌더링 블록 내부의 여러 요소

**오류 메시지:**
```
Error: Expected '</', got 'currentPage'
```

**발생 위치:**
- `app/admin/products/page.tsx`
- `app/admin/inquiries/page.tsx`
- `app/admin/events/page.tsx`

**원인:**
- 조건부 렌더링(`?:`) 블록 내부에 여러 요소를 배치할 때 Fragment로 감싸지 않음
- `Pagination` 컴포넌트가 `</div>` 태그 밖에 위치

**해결 방법:**
- 여러 요소를 Fragment(`<>...</>`)로 감싸기

**예시:**
```tsx
// ❌ 잘못된 코드
{items.length === 0 ? (
  <div>No items</div>
) : (
  <div className="table">
    {/* table content */}
  </div>
  <Pagination {...props} />
)}

// ✅ 올바른 코드
{items.length === 0 ? (
  <div>No items</div>
) : (
  <>
    <div className="table">
      {/* table content */}
    </div>
    <Pagination {...props} />
  </>
)}
```

**주의사항:**
- 조건부 렌더링 블록 내부에 여러 요소가 있을 때는 항상 Fragment 사용
- 테이블과 페이지네이션을 함께 사용할 때 특히 주의

---

## TypeScript 타입 오류

### 3. 아이콘 타입 매핑 누락

**오류 메시지:**
```
Type error: Property 'Award' does not exist on type 'JSX.IntrinsicElements'.
```

**발생 위치:**
- `components/CategoryDetailModal.tsx`
- `components/CategoryCardNews.tsx`

**원인:**
- `IconName` (문자열)을 직접 React 컴포넌트로 사용하려고 함
- `iconMap`을 제거하면서 문자열을 컴포넌트로 변환하는 로직이 없어짐

**해결 방법:**
- `iconMap`을 유지하여 `IconName` 문자열을 `LucideIcon` 컴포넌트로 매핑
- 모든 아이콘 사용 시 `iconMap[iconName]` 형태로 변환

**예시:**
```tsx
// ❌ 잘못된 코드
const Icon = card.icon; // string 타입
<Icon className="..." /> // 오류 발생

// ✅ 올바른 코드
const iconMap: Record<IconName, LucideIcon> = {
  MapPin,
  BookOpen,
  // ... 모든 아이콘
};
const Icon = card.icon ? iconMap[card.icon] : null;
{Icon && <Icon className="..." />}
```

**주의사항:**
- 아이콘을 동적으로 사용할 때는 항상 iconMap을 통해 컴포넌트로 변환
- null 체크 필수

---

### 4. 배열 concat 타입 불일치

**오류 메시지:**
```
Type error: No overload matches this call.
Property 'showCategoryButtons' is incompatible.
Type 'boolean | undefined' is not assignable to type 'boolean'.
```

**발생 위치:**
- `components/HeroChatInput.tsx`

**원인:**
- `concat()` 사용 시 타입 불일치 발생
- optional 속성(`showCategoryButtons?: boolean`)이 있는 객체를 concat할 때 타입 추론 실패

**해결 방법:**
- `concat()` 대신 spread 연산자(`[...array, item]`) 사용
- optional 속성에 명시적으로 값 할당

**예시:**
```tsx
// ❌ 잘못된 코드
const userMessage: ChatMessage = {
  id: "...",
  role: "user",
  content: "...",
  timestamp: new Date(),
  // showCategoryButtons 없음
};
setMessages(prev => 
  prev.map(msg => ({ ...msg, showCategoryButtons: false })).concat(userMessage)
);

// ✅ 올바른 코드
const userMessage: ChatMessage = {
  id: "...",
  role: "user",
  content: "...",
  timestamp: new Date(),
  showCategoryButtons: false, // 명시적으로 할당
};
setMessages(prev => 
  [...prev.map(msg => ({ ...msg, showCategoryButtons: false })), userMessage]
);
```

**주의사항:**
- optional 속성이 있는 타입을 다룰 때는 항상 명시적으로 값 할당
- `concat()` 대신 spread 연산자 사용 권장

---

### 5. Optional Chaining 누락

**오류 메시지:**
```
Type error: Cannot read property 'map' of undefined
```

**발생 위치:**
- `components/EventForm.tsx`
- `components/ProgramForm.tsx`
- `components/AchievementForm.tsx`

**원인:**
- optional 속성(`event?.images`)에 바로 메서드 호출
- `event?.images`가 `undefined`일 수 있는데 `map()` 호출

**해결 방법:**
- Optional chaining(`?.`) 사용

**예시:**
```tsx
// ❌ 잘못된 코드
const [imageUrls, setImageUrls] = useState<string[]>(
  event?.images.map((img) => img.url) || []
);

// ✅ 올바른 코드
const [imageUrls, setImageUrls] = useState<string[]>(
  event?.images?.map((img) => img.url) || []
);
```

**주의사항:**
- optional 속성에 접근할 때는 항상 optional chaining 사용
- 배열 메서드 호출 전에 배열이 존재하는지 확인

---

### 6. 타입 정의 불일치

**오류 메시지:**
```
Type error: Type 'Inquiry' is missing the following properties: expectedDate, participantCount, purpose...
```

**발생 위치:**
- `components/InquiryActions.tsx`

**원인:**
- 컴포넌트 간에 사용하는 타입 정의가 불일치
- `InquiryActions`의 `Inquiry` 타입에 필드가 누락됨

**해결 방법:**
- 공통 타입 정의 파일 생성 또는 타입 일치시키기
- 모든 필드를 포함하도록 타입 정의 수정

**예시:**
```tsx
// ❌ 잘못된 코드
// InquiryActions.tsx
interface Inquiry {
  id: string;
  schoolName: string;
  // ... 일부 필드만
}

// InquiryDetailModal.tsx
interface Inquiry {
  id: string;
  schoolName: string;
  expectedDate: string | null; // 추가 필드
  // ... 더 많은 필드
}

// ✅ 올바른 코드
// types/inquiry.ts (공통 타입 파일)
export interface Inquiry {
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  message: string | null;
  expectedDate: string | null;
  participantCount: number | null;
  purpose: string | null;
  hasInstructor: boolean | null;
  preferredTransport: string | null;
  mealPreference: string | null;
  specialRequests: string | null;
  estimatedBudget: number | null;
  status: string;
  createdAt: Date;
}

// 두 컴포넌트 모두에서 import하여 사용
import { Inquiry } from "@/types/inquiry";
```

**주의사항:**
- 같은 도메인 객체를 여러 컴포넌트에서 사용할 때는 공통 타입 정의 사용
- 타입 정의 변경 시 모든 사용처 확인 필요

---

### 7. validateAndSanitize 반환 타입 처리

**오류 메시지:**
```
Type error: Property 'error' does not exist on type '{ valid: boolean; sanitized: null; }'.
```

**발생 위치:**
- `app/api/inquiry/route.ts`

**원인:**
- `validateAndSanitize`의 반환 타입이 유니온 타입
- `{ valid: true, sanitized: null }` 타입에는 `error` 속성이 없음

**해결 방법:**
- 타입 가드 사용하여 `error` 속성 존재 확인

**예시:**
```tsx
// ❌ 잘못된 코드
const validation = body.field
  ? validateAndSanitize(body.field, options)
  : { valid: true, sanitized: null };
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error }, // 오류: error 속성이 없을 수 있음
    { status: 400 }
  );
}

// ✅ 올바른 코드
const validation = body.field
  ? validateAndSanitize(body.field, options)
  : { valid: true, sanitized: null };
if (!validation.valid && 'error' in validation) {
  return NextResponse.json(
    { error: validation.error },
    { status: 400 }
  );
}
```

**주의사항:**
- 유니온 타입의 속성에 접근할 때는 타입 가드 사용
- `'property' in object` 형태로 확인

---

## 빌드 전 체크리스트

Vercel에 배포하기 전에 다음 사항들을 확인하세요:

### ✅ TypeScript 타입 체크
```bash
npm run build
# 또는
npx tsc --noEmit
```

### ✅ ESLint 체크
```bash
npm run lint
```

### ✅ 주요 확인 사항

1. **JSX 구조**
   - [ ] 조건부 렌더링 블록 내부에 여러 요소가 있으면 Fragment로 감싸기
   - [ ] 모든 태그가 올바르게 닫혀있는지 확인

2. **타입 안전성**
   - [ ] optional 속성 접근 시 optional chaining(`?.`) 사용
   - [ ] 배열 메서드 호출 전 배열 존재 확인
   - [ ] 유니온 타입 속성 접근 시 타입 가드 사용
   - [ ] 컴포넌트 간 타입 정의 일치 확인

3. **ESLint 규칙**
   - [ ] JSX 내 따옴표는 HTML 엔티티 사용
   - [ ] 사용하지 않는 변수 제거
   - [ ] import 순서 확인

4. **아이콘 사용**
   - [ ] 동적 아이콘 사용 시 iconMap을 통한 변환
   - [ ] null 체크 포함

5. **배열 조작**
   - [ ] `concat()` 대신 spread 연산자 사용 고려
   - [ ] optional 속성이 있는 객체는 명시적으로 값 할당

---

## 자주 발생하는 패턴

### 패턴 1: 조건부 렌더링 + 페이지네이션
```tsx
// 항상 Fragment로 감싸기
{items.length === 0 ? (
  <EmptyState />
) : (
  <>
    <Table items={items} />
    <Pagination {...props} />
  </>
)}
```

### 패턴 2: Optional 속성 접근
```tsx
// 항상 optional chaining 사용
const value = obj?.property?.method?.() || defaultValue;
```

### 패턴 3: 타입 안전한 배열 조작
```tsx
// spread 연산자 사용
setItems(prev => [...prev, newItem]);

// optional 속성 명시
const newItem: Type = {
  required: value,
  optional: value || undefined, // 명시적으로 할당
};
```

---

## 참고 자료

- [Next.js 공식 문서 - TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [React 공식 문서 - TypeScript](https://react.dev/learn/typescript)
- [ESLint 규칙 - react/no-unescaped-entities](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md)

---

**마지막 업데이트:** 2025-01-XX
**관리자:** 개발팀
