# 주식 계좌 포트폴리오 관리 웹 애플리케이션 구현 계획

## Context (맥락)

사용자는 **공개 웹사이트 형태**의 주식 포트폴리오 관리 도구를 개발하고자 합니다. 이 도구는:
- 구글 검색에 노출되어 누구나 사용할 수 있는 공개 서비스
- 하지만 사용자의 주식 데이터는 **각자의 브라우저 로컬**에만 저장 (서버 전송 없음)
- 개인정보 보호를 위해 완전히 클라이언트 사이드에서만 작동
- 여러 주식 계좌의 정보를 한눈에 보고 관리
- 실시간 주가 연동 없이 사용자가 직접 입력한 데이터 기반

이 프로젝트는 현재 빈 디렉토리 상태이며, 처음부터 모든 것을 구축해야 합니다.

---

## 기술 스택 선택

### 프레임워크: **Next.js 15 (App Router) + Static Export**
- **SEO 최적화**: 정적 HTML 생성으로 검색 엔진 크롤링 완벽 지원
- **배포**: Vercel/Netlify에 무료로 정적 사이트 배포
- **성능**: 서버 없이도 빠른 로딩 속도
- **설정**: `next.config.js`에 `output: 'export'` 추가

### 스타일링: **Tailwind CSS + shadcn/ui**
- 2026년 가장 대중적인 스타일링 솔루션 (80%+ 점유율)
- shadcn/ui: Radix UI 기반의 복사 가능한 컴포넌트 라이브러리
- 일관된 디자인 시스템과 빠른 개발 속도

### 상태 관리: **Zustand**
- 가장 대중적인 경량 상태 관리 (Redux 대체)
- 함수형 프로그래밍에 최적화
- 최소한의 보일러플레이트

### 데이터베이스: **IndexedDB + Dexie.js**
- **브라우저 로컬 저장소** (서버 전송 없음 - 개인정보 보호)
- **Dexie.js**: IndexedDB를 쉽게 사용할 수 있는 래퍼 라이브러리
  - Promise 기반 API
  - TypeScript 지원
  - 쿼리 및 인덱싱
  - 트랜잭션 지원
- **용량**: 브라우저당 수 GB 저장 가능

### 데이터 페칭: **TanStack Query v5**
- IndexedDB 읽기/쓰기를 캐싱 및 최적화
- 로딩/에러 상태 관리
- Optimistic 업데이트

### 차트 라이브러리: **Recharts**
- React 친화적 API
- 반응형 차트 (파이, 바, 라인)
- 커스터마이징 용이

### 폼 처리: **React Hook Form + Zod**
- 타입 안전한 폼 검증
- 최소한의 리렌더링

### 기타:
- **TypeScript**: 타입 안전성
- **date-fns**: 날짜 포맷팅
- **clsx + tailwind-merge**: 조건부 className

---

## 데이터베이스 스키마 (IndexedDB - Dexie.js)

### 테이블 정의

#### 1. `accounts` (계좌)
```typescript
{
  id: string (uuid, primary key)
  name: string (계좌명 - 예: "NH투자증권")
  description: string | null (설명)
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}

인덱스: id (primary), createdAt
```

#### 2. `stocks` (주식)
```typescript
{
  id: string (uuid, primary key)
  symbol: string (티커 - 예: "AAPL", "005930")
  name: string (종목명 - 예: "Apple Inc.", "삼성전자")
  sector: string | null (섹터 - 예: "Technology")
  industry: string | null (산업 - 예: "Consumer Electronics")
  notes: string | null (메모)
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}

인덱스: id (primary), symbol (unique), name
```

#### 3. `holdings` (보유 종목)
```typescript
{
  id: string (uuid, primary key)
  accountId: string (계좌 ID - foreign key)
  stockId: string (주식 ID - foreign key)
  shares: number (보유 수량)
  averageCost: number (평균 매입가)
  currentPrice: number (현재가 - 사용자 입력)
  lastPriceUpdate: number (가격 마지막 업데이트 시각)
  notes: string | null (메모)
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}

인덱스: id (primary), accountId, stockId, [accountId+stockId] (compound unique)
```

#### 4. `tags` (태그)
```typescript
{
  id: string (uuid, primary key)
  name: string (태그명 - 예: "배당성장주", "고위험")
  color: string | null (색상)
  createdAt: number (timestamp)
}

인덱스: id (primary), name (unique)
```

#### 5. `stock_tags` (주식-태그 연결)
```typescript
{
  stockId: string (주식 ID)
  tagId: string (태그 ID)
}

인덱스: [stockId+tagId] (compound primary)
```

### 계산 필드 (저장하지 않고 런타임에 계산)
- **평가금액** = shares × currentPrice
- **매입금액** = shares × averageCost
- **손익** = 평가금액 - 매입금액
- **수익률** = (손익 / 매입금액) × 100
- **비중** = (보유종목 평가금액 / 계좌 총 평가금액) × 100

---

## 디렉토리 구조

```
C:\workspace\seok-dev\
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 대시보드 (메인)
│   │   ├── accounts/
│   │   │   ├── page.tsx              # 계좌 목록
│   │   │   └── [id]/
│   │   │       └── page.tsx          # 계좌 상세
│   │   └── stocks/
│   │       ├── page.tsx              # 주식 목록
│   │       └── [id]/
│   │           └── page.tsx          # 주식 상세
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── accounts/                 # 계좌 관련 컴포넌트
│   │   │   ├── account-card.tsx
│   │   │   ├── account-form.tsx
│   │   │   └── account-list.tsx
│   │   ├── stocks/                   # 주식 관련 컴포넌트
│   │   │   ├── stock-card.tsx
│   │   │   ├── stock-form.tsx
│   │   │   └── stock-list.tsx
│   │   ├── holdings/                 # 보유 종목 컴포넌트
│   │   │   ├── holding-form.tsx
│   │   │   ├── holding-row.tsx
│   │   │   └── holding-table.tsx
│   │   ├── charts/                   # 차트 컴포넌트
│   │   │   ├── portfolio-pie-chart.tsx
│   │   │   ├── account-allocation-chart.tsx
│   │   │   └── sector-breakdown-chart.tsx
│   │   ├── dashboard/                # 대시보드 컴포넌트
│   │   │   ├── portfolio-overview.tsx
│   │   │   ├── top-holdings.tsx
│   │   │   └── stats-cards.tsx
│   │   └── common/                   # 공통 컴포넌트
│   │       ├── header.tsx
│   │       ├── navigation.tsx
│   │       └── loading.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts             # Dexie 스키마
│   │   │   ├── client.ts             # Dexie 인스턴스
│   │   │   └── queries.ts            # DB 쿼리 함수들
│   │   ├── hooks/                    # React Query 훅
│   │   │   ├── use-accounts.ts
│   │   │   ├── use-stocks.ts
│   │   │   ├── use-holdings.ts
│   │   │   └── use-portfolio-stats.ts
│   │   ├── store/                    # Zustand 스토어
│   │   │   └── ui-store.ts           # UI 상태 (필터, 선택 등)
│   │   ├── utils/
│   │   │   ├── calculations.ts       # 포트폴리오 계산 로직
│   │   │   ├── formatters.ts         # 숫자/날짜 포맷팅
│   │   │   └── validators.ts         # Zod 스키마
│   │   └── types/
│   │       └── index.ts              # TypeScript 타입
│   └── styles/
│       └── globals.css               # Tailwind + 글로벌 스타일
├── public/                           # 정적 파일
├── next.config.mjs                   # Next.js 설정
├── tailwind.config.ts                # Tailwind 설정
├── tsconfig.json                     # TypeScript 설정
├── components.json                   # shadcn/ui 설정
└── package.json
```

---

## 컴포넌트 아키텍처

### 페이지 구조

**1. 대시보드 (`app/page.tsx`)**
```
DashboardPage (Server Component)
  └── DashboardClient (Client Component)
      ├── StatsCards
      │   ├── StatCard (총 평가금액)
      │   ├── StatCard (총 손익)
      │   ├── StatCard (총 수익률)
      │   └── StatCard (보유 종목 수)
      ├── PortfolioPieChart (계좌별 비중)
      ├── AccountList
      │   └── AccountCard (×N)
      └── TopHoldings
          └── HoldingRow (×10)
```

**2. 계좌 목록 (`app/accounts/page.tsx`)**
```
AccountsPage
  └── AccountsClient
      ├── AddAccountButton → AccountForm (Dialog)
      └── AccountList
          └── AccountCard (×N)
              ├── 계좌명
              ├── 총 평가금액
              ├── 보유 종목 수
              └── 미니 파이 차트
```

**3. 계좌 상세 (`app/accounts/[id]/page.tsx`)**
```
AccountDetailPage
  └── AccountDetailClient
      ├── AccountHeader (이름, 편집/삭제 버튼)
      ├── AccountStats (총 평가금액, 손익 등)
      ├── AccountAllocationChart (보유 종목별 비중)
      └── HoldingTable
          ├── AddHoldingButton → HoldingForm
          └── HoldingRow (×N)
              ├── 종목명, 수량, 평균매입가
              ├── 현재가 (인라인 수정 가능)
              ├── 평가금액, 손익, 수익률, 비중
              └── 삭제 버튼
```

**4. 주식 목록 (`app/stocks/page.tsx`)**
```
StocksPage
  └── StocksClient
      ├── SearchBar (티커/종목명 검색)
      ├── TagFilter (태그별 필터)
      ├── AddStockButton → StockForm
      └── StockList
          └── StockCard (×N)
              ├── 티커, 종목명
              ├── 섹터, 태그들
              ├── 총 보유 수량 (모든 계좌 합계)
              └── 총 평가금액
```

---

## 구현 단계

### Phase 0: 프로젝트 초기화 (1일차)

**Step 1: Next.js 프로젝트 생성**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Step 2: 핵심 의존성 설치**
```bash
npm install dexie dexie-react-hooks
npm install zustand @tanstack/react-query
npm install recharts
npm install react-hook-form @hookform/resolvers zod
npm install date-fns clsx tailwind-merge
npm install -D @types/node
```

**Step 3: shadcn/ui 설정**
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label table select badge tabs separator
```

**Step 4: Next.js Static Export 설정**
`next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 정적 사이트 생성
  images: {
    unoptimized: true  // 정적 export 시 필요
  }
}
export default nextConfig
```

**Step 5: Dexie 데이터베이스 설정**
- `src/lib/db/client.ts`: Dexie 인스턴스 생성 및 스키마 정의
- `src/lib/db/queries.ts`: CRUD 함수들

**Step 6: TanStack Query Provider 설정**
- `src/providers/query-provider.tsx` 생성
- `app/layout.tsx`에 추가

---

### Phase 1: 데이터베이스 및 유틸리티 (1-2일차)

**Step 7: Dexie 스키마 구현**
- 5개 테이블 정의 (accounts, stocks, holdings, tags, stock_tags)
- 인덱스 설정
- TypeScript 타입 정의

**Step 8: DB 쿼리 함수 작성**
`src/lib/db/queries.ts`:
- Accounts: `getAllAccounts()`, `getAccountById()`, `createAccount()`, `updateAccount()`, `deleteAccount()`
- Stocks: `getAllStocks()`, `getStockById()`, `createStock()`, `updateStock()`, `deleteStock()`
- Holdings: `getHoldingsByAccount()`, `createHolding()`, `updateHolding()`, `deleteHolding()`
- Tags: `getAllTags()`, `createTag()`, `getStockTags()`, `addTagToStock()`

**Step 9: 계산 유틸리티**
`src/lib/utils/calculations.ts`:
```typescript
// 평가금액 계산
function calculateHoldingValue(shares: number, currentPrice: number): number

// 손익 계산
function calculateGainLoss(shares: number, avgCost: number, currentPrice: number)

// 수익률 계산
function calculateReturnRate(gainLoss: number, totalCost: number): number

// 비중 계산
function calculateAllocation(holdingValue: number, totalValue: number): number

// 계좌 통계 계산
function calculateAccountStats(holdings: Holding[]): AccountStats

// 포트폴리오 통계 계산
function calculatePortfolioStats(accounts: Account[], holdings: Holding[]): PortfolioStats
```

**Step 10: 포맷팅 유틸리티**
`src/lib/utils/formatters.ts`:
```typescript
formatCurrency(value: number): string  // "₩1,234,567"
formatPercent(value: number): string   // "+12.34%"
formatNumber(value: number): string    // "1,234"
formatDate(timestamp: number): string  // "2026-02-08 14:30"
```

**Step 11: Zod 검증 스키마**
`src/lib/utils/validators.ts`:
- accountSchema
- stockSchema
- holdingSchema
- tagSchema

---

### Phase 2: UI 기반 구축 (2-3일차)

**Step 12: 레이아웃 구성**
`app/layout.tsx`:
- 헤더 (앱 제목, 네비게이션)
- QueryProvider 래핑
- 글로벌 스타일

`src/components/common/header.tsx`:
- 앱 타이틀
- 네비게이션 링크 (대시보드, 계좌, 주식)
- 반응형 메뉴 (모바일: 햄버거 메뉴)

**Step 13: 공통 컴포넌트**
- `loading.tsx`: 로딩 스피너
- `empty-state.tsx`: 빈 상태 표시
- `confirm-dialog.tsx`: 삭제 확인 다이얼로그

**Step 14: Tailwind 테마 커스터마이징**
`tailwind.config.ts`:
- 색상 팔레트 (primary, secondary 등)
- 폰트 크기
- 간격 조정

---

### Phase 3: 계좌 관리 (3-4일차)

**Step 15: React Query 훅 - Accounts**
`src/lib/hooks/use-accounts.ts`:
```typescript
useAccounts()           // 모든 계좌 조회
useAccount(id)          // 특정 계좌 조회
useCreateAccount()      // 계좌 생성
useUpdateAccount()      // 계좌 수정
useDeleteAccount()      // 계좌 삭제
```

**Step 16: 계좌 컴포넌트**
- `account-form.tsx`: 계좌 생성/수정 폼 (Dialog)
  - 필드: 계좌명, 설명
  - React Hook Form + Zod 검증
- `account-card.tsx`: 계좌 카드
  - 계좌명, 총 평가금액, 보유 종목 수
  - 클릭 시 상세 페이지로 이동
- `account-list.tsx`: 계좌 카드 그리드

**Step 17: 계좌 페이지**
`app/accounts/page.tsx`:
- 계좌 목록 표시
- "계좌 추가" 버튼
- 빈 상태 처리

**Step 18: 계좌 상세 페이지**
`app/accounts/[id]/page.tsx`:
- 계좌 정보 헤더 (이름, 수정/삭제 버튼)
- 계좌 통계 (총 평가금액, 총 손익, 수익률)
- 보유 종목 테이블 (나중에 Phase 5에서 구현)

---

### Phase 4: 주식 관리 (4-5일차)

**Step 19: React Query 훅 - Stocks & Tags**
`src/lib/hooks/use-stocks.ts`:
```typescript
useStocks()             // 모든 주식 조회
useStock(id)            // 특정 주식 조회
useCreateStock()        // 주식 생성
useUpdateStock()        // 주식 수정
useDeleteStock()        // 주식 삭제
```

`src/lib/hooks/use-tags.ts`:
```typescript
useTags()               // 모든 태그 조회
useStockTags(stockId)   // 특정 주식의 태그
useAddTagToStock()      // 주식에 태그 추가
useRemoveTagFromStock() // 주식에서 태그 제거
```

**Step 20: 주식 컴포넌트**
- `stock-form.tsx`: 주식 생성/수정 폼
  - 필드: 티커, 종목명, 섹터, 산업, 메모
  - 태그 입력 (자동완성 + 신규 생성)
- `stock-card.tsx`: 주식 카드
  - 티커, 종목명, 섹터
  - 태그 배지들
  - 총 보유 수량 및 평가금액 (모든 계좌 합산)
- `stock-list.tsx`: 주식 카드 그리드
- `stock-search.tsx`: 검색 바 (디바운스 적용)

**Step 21: 주식 페이지**
`app/stocks/page.tsx`:
- 검색 바
- 태그 필터 (드롭다운)
- 주식 목록
- "주식 추가" 버튼

**Step 22: 태그 시스템**
- 태그 입력 컴포넌트 (인라인 생성)
- 태그 배지 (색상 표시)
- 태그 필터 UI

---

### Phase 5: 보유 종목 관리 (5-6일차)

**Step 23: React Query 훅 - Holdings**
`src/lib/hooks/use-holdings.ts`:
```typescript
useHoldings()                    // 모든 보유종목
useHoldingsByAccount(accountId)  // 계좌별 보유종목
useHoldingsByStock(stockId)      // 주식별 보유종목
useCreateHolding()               // 보유종목 추가
useUpdateHolding()               // 보유종목 수정 (가격 업데이트)
useDeleteHolding()               // 보유종목 삭제
```

**Step 24: 보유 종목 컴포넌트**
- `holding-form.tsx`: 보유종목 추가 폼
  - 드롭다운: 계좌 선택, 주식 선택
  - 입력: 수량, 평균매입가, 현재가
- `holding-row.tsx`: 테이블 행
  - 종목명, 수량, 평균매입가
  - 현재가 (인라인 수정 가능)
  - 계산된 값: 평가금액, 손익, 수익률, 비중
  - 삭제 버튼
- `holding-table.tsx`: 전체 테이블
  - 정렬 기능 (평가금액, 수익률 등)
  - 총합 표시

**Step 25: 보유 종목 통합**
- 계좌 상세 페이지에 보유종목 테이블 추가
- 주식 상세 페이지에 보유 계좌 목록 표시
- 빠른 가격 업데이트 기능 (버튼 클릭)

---

### Phase 6: 데이터 시각화 (6-7일차)

**Step 26: 차트 컴포넌트**
`src/components/charts/`:
- `portfolio-pie-chart.tsx`: 전체 포트폴리오 계좌별 비중
  - Recharts PieChart 사용
  - 호버 시 툴팁 (계좌명, 평가금액, 비중)
  - 클릭 시 계좌 상세 페이지로 이동

- `account-allocation-chart.tsx`: 계좌 내 종목별 비중
  - PieChart
  - 색상 구분

- `sector-breakdown-chart.tsx`: 섹터별 비중
  - PieChart (섹터 데이터가 있는 경우만)

- `top-holdings-bar-chart.tsx`: Top 10 보유 종목
  - BarChart
  - 평가금액 기준 정렬

**Step 27: 차트 데이터 변환**
`src/lib/utils/chart-data.ts`:
```typescript
transformPortfolioData(accounts, holdings)
transformAccountData(holdings)
transformSectorData(holdings, stocks)
transformTopHoldings(holdings, stocks)
```

**Step 28: 반응형 차트**
- 모바일: 작은 크기, 간소화된 레전드
- 데스크톱: 큰 크기, 상세한 툴팁
- 로딩/빈 상태 처리

---

### Phase 7: 대시보드 (7-8일차)

**Step 29: 포트폴리오 통계 훅**
`src/lib/hooks/use-portfolio-stats.ts`:
```typescript
usePortfolioStats() → {
  totalValue: number           // 총 평가금액
  totalCost: number            // 총 매입금액
  totalGainLoss: number        // 총 손익
  totalReturnRate: number      // 총 수익률
  accountCount: number         // 계좌 수
  stockCount: number           // 보유 종목 수
  topPerformers: Holding[]     // 상위 수익 종목
  worstPerformers: Holding[]   // 하위 수익 종목
}
```

**Step 30: 대시보드 컴포넌트**
- `stats-cards.tsx`: 4개 통계 카드
  - 총 평가금액
  - 총 손익 (금액)
  - 총 수익률 (%)
  - 보유 종목 수

- `portfolio-overview.tsx`: 포트폴리오 개요
  - 큰 파이 차트 (계좌별 비중)
  - 간단한 요약

- `top-holdings.tsx`: 상위 보유 종목 (Top 10)
  - 테이블 또는 바 차트

- `recent-updates.tsx`: 최근 업데이트된 보유종목
  - 가격 업데이트 시각 기준

**Step 31: 대시보드 페이지 완성**
`app/page.tsx`:
- 모든 대시보드 컴포넌트 조합
- 새로고침 버튼
- 마지막 업데이트 시각 표시

---

### Phase 8: 최적화 및 UX 개선 (8-9일차)

**Step 32: UX 개선**
- 로딩 스켈레톤 (모든 데이터 페칭 시)
- Optimistic 업데이트 (가격 수정 시 즉시 반영)
- Toast 알림 (성공/에러 메시지)
  - `npm install sonner` (토스트 라이브러리)
- 폼 검증 에러 메시지 (친절한 안내)

**Step 33: 성능 최적화**
- 계산 함수 메모이제이션 (`useMemo`)
- 차트 lazy loading (`React.lazy`)
- TanStack Query 캐시 설정 조정
- 불필요한 리렌더링 방지

**Step 34: 반응형 디자인**
- 모바일: 햄버거 메뉴, 카드형 레이아웃
- 태블릿: 2열 그리드
- 데스크톱: 3-4열 그리드
- 차트 크기 조정

**Step 35: 데이터 관리**
- 데이터 내보내기 (JSON Export)
  - 모든 데이터를 JSON 파일로 다운로드
- 데이터 가져오기 (JSON Import)
  - JSON 파일 업로드 → 검증 → IndexedDB에 저장
- IndexedDB 초기화 (모든 데이터 삭제)

---

### Phase 9: 테스트 및 배포 (9-10일차)

**Step 36: 수동 테스트**
- CRUD 동작 확인 (계좌, 주식, 보유종목, 태그)
- 계산 정확도 검증
- Edge case 테스트 (0 수량, 음수 등)
- 삭제 cascade 동작 확인

**Step 37: 빌드 및 배포 준비**
```bash
npm run build   # 정적 사이트 생성 (out/ 폴더)
```

**Step 38: Vercel 배포**
- GitHub 레포지토리 생성
- Vercel 연결
- 자동 배포 설정

**Step 39: SEO 최적화**
`app/layout.tsx`:
```typescript
export const metadata = {
  title: '주식 포트폴리오 관리 - 무료 포트폴리오 추적 도구',
  description: '여러 계좌의 주식 투자를 한눈에 관리하세요. 무료, 개인정보 보호, 브라우저 로컬 저장.',
  keywords: '주식, 포트폴리오, 관리, 투자, 계좌',
}
```

`public/robots.txt`:
```
User-agent: *
Allow: /
```

---

## 핵심 파일 목록

구현 시 가장 중요한 파일들:

1. **`src/lib/db/client.ts`** - Dexie 데이터베이스 인스턴스 및 스키마
2. **`src/lib/db/queries.ts`** - 모든 DB CRUD 함수
3. **`src/lib/utils/calculations.ts`** - 포트폴리오 계산 로직 (핵심 비즈니스 로직)
4. **`src/lib/hooks/use-portfolio-stats.ts`** - 포트폴리오 통계 계산
5. **`app/page.tsx`** - 대시보드 메인 페이지
6. **`src/components/charts/portfolio-pie-chart.tsx`** - 메인 차트
7. **`src/components/holdings/holding-table.tsx`** - 보유종목 테이블 (핵심 UI)

---

## 검증 전략

### 계산 정확도 테스트

**테스트 시나리오:**
1. 계좌 "테스트" 생성
2. 주식 2개 추가:
   - 주식 A: 10주, 평균매입가 50,000원, 현재가 60,000원
     - 평가금액: 600,000원
     - 손익: +100,000원 (+20%)
   - 주식 B: 5주, 평균매입가 100,000원, 현재가 80,000원
     - 평가금액: 400,000원
     - 손익: -100,000원 (-20%)
3. 검증:
   - ✓ 계좌 총 평가금액 = 1,000,000원
   - ✓ 주식 A 비중 = 60%
   - ✓ 주식 B 비중 = 40%
   - ✓ 총 손익 = 0원 (0%)

### 기능 테스트 체크리스트

**계좌:**
- [ ] 계좌 생성
- [ ] 계좌 수정 (이름, 설명)
- [ ] 계좌 삭제 (보유종목도 함께 삭제되는지)
- [ ] 계좌 목록 표시

**주식:**
- [ ] 주식 생성 (티커 대문자 변환 확인)
- [ ] 태그 추가/제거
- [ ] 주식 검색 (티커, 종목명)
- [ ] 태그 필터링
- [ ] 주식 삭제 (보유종목도 함께 삭제되는지)

**보유종목:**
- [ ] 보유종목 추가 (계좌 + 주식 연결)
- [ ] 현재가 수정 (인라인 편집)
- [ ] 계산 값 정확도 (평가금액, 손익, 수익률, 비중)
- [ ] 보유종목 삭제
- [ ] 정렬 기능 (각 열 클릭)

**차트:**
- [ ] 대시보드 파이 차트 (계좌별 비중)
- [ ] 계좌 상세 파이 차트 (종목별 비중)
- [ ] Top 10 보유종목 차트
- [ ] 반응형 (모바일에서 확인)

**데이터 관리:**
- [ ] 데이터 내보내기 (JSON 다운로드)
- [ ] 데이터 가져오기 (JSON 업로드)
- [ ] 브라우저 새로고침 후 데이터 유지 확인

**Edge Cases:**
- [ ] 빈 계좌 (보유종목 0개 - Empty State 표시)
- [ ] 수량 0 입력 (검증 에러)
- [ ] 음수 가격 입력 (검증 에러)
- [ ] 중복 보유종목 (같은 계좌에 같은 주식) - 중복 방지

**성능:**
- [ ] 100개 보유종목 추가 후 대시보드 로딩 속도
- [ ] 차트 렌더링 부드러움

---

## 예상 일정

| 단계 | 일수 | 설명 |
|------|------|------|
| Phase 0 | 0.5일 | 프로젝트 초기화, 의존성 설치 |
| Phase 1 | 1.5일 | DB 스키마, 쿼리, 유틸리티 |
| Phase 2 | 1일 | 레이아웃, 네비게이션, 공통 컴포넌트 |
| Phase 3 | 1일 | 계좌 관리 (CRUD) |
| Phase 4 | 1일 | 주식 관리 + 태그 시스템 |
| Phase 5 | 1일 | 보유종목 관리 |
| Phase 6 | 1일 | 차트 및 시각화 |
| Phase 7 | 1일 | 대시보드 완성 |
| Phase 8 | 1일 | 최적화, UX 개선, 데이터 관리 |
| Phase 9 | 1일 | 테스트, SEO, 배포 |
| **총합** | **10일** | 완전한 기능의 웹 앱 |

---

## 주요 기능 요약

1. **계좌 관리**: 여러 투자 계좌 생성 및 관리
2. **주식 관리**: 주식 종목 정보 입력 및 태그 분류
3. **보유종목 관리**: 계좌별 보유 주식 입력 및 가격 업데이트
4. **자동 계산**: 평가금액, 손익, 수익률, 비중 자동 계산
5. **시각화**: 파이 차트, 바 차트로 포트폴리오 분석
6. **대시보드**: 전체 포트폴리오 한눈에 확인
7. **데이터 보호**: 브라우저 로컬 저장 (서버 전송 없음)
8. **데이터 관리**: JSON 내보내기/가져오기
9. **반응형**: 모바일, 태블릿, 데스크톱 지원
10. **SEO 최적화**: 구글 검색 노출

---

## 기술적 특징

✅ **함수형 프로그래밍**: 순수 함수, 불변성, 함수형 컴포넌트
✅ **타입 안전성**: TypeScript Strict Mode
✅ **성능 최적화**: 메모이제이션, lazy loading, 캐싱
✅ **접근성**: ARIA 레이블, 키보드 네비게이션
✅ **2026 최신 스택**: Next.js 15, React 19, TanStack Query v5
✅ **개인정보 보호**: 100% 클라이언트 사이드, 서버 전송 없음
✅ **무료 배포**: Vercel 무료 플랜

---

## 향후 확장 가능성

- 히스토리 추적 (가격 변동 그래프)
- 배당금 추적
- 목표 수익률 설정
- 다중 통화 지원
- CSV 가져오기 (증권사 파일)
- PDF 보고서 생성
- 다크 모드
- 관심 종목 (위시리스트)
