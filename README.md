# 쇼핑몰 사이트 기능 명세서

## 기술 스택

- **Frontend**: Next.js 14+ (App Router), TypeScript, React
- **Backend**: Supabase (PostgreSQL)
- **UI**: TailwindCSS, shadcn/ui
- **상태관리**: TanStack Query

## 코드 컨벤션

### TypeScript/React

- 모든 함수에 주석 추가
- 분기문 내부 10라인 이상 시 주석 추가
- Props 타입 정의 필수
- shadcn/ui 컴포넌트 사용
- next js기반의 SSR우선 적용과 FSD 아키텍쳐 적용
- 파일 최상단에 해당파일의 관현 설명 추가
- 생성한 모든 type, interface는 inner 주석 추가

### DB 스키마 관리 원칙

1. **코멘트 필수**: 모든 테이블, 컬럼, 인덱스, 함수에 코멘트 작성
2. **SQL 파일 동기화**: database/schema.sql 파일을 항상 최신 상태로 유지
3. **타입 생성 자동화**: `pnpm run gen-types`로 Supabase 타입 생성 및 JSONB 타입 자동 수정

### 성능 최적화 가이드

- 조회 패턴에 맞는 복합 인덱스 생성
- WHERE 절에 자주 사용되는 컬럼에 인덱스
- 파티셔닝 고려 (대용량 데이터)
- 제약조건으로 데이터 무결성 보장

### 네이밍 컨벤션

- 테이블: hk\_ prefix + 복수형 (`hk_companies`)
- 인덱스: `idx_hk_table_column` 형식
- 제약조건: `chk_table_rule`

### 타입 생성 워크플로우

1. **Supabase 클라우드에 스키마 변경사항 적용**
2. **타입 생성**: `pnpm run gen-types` 실행
   - Supabase CLI로 타입 생성
   - `scripts/fix-database-types.ts`로 JSONB 타입 자동 수정
3. **JSONB 타입 수정 설정**: `scripts/fix-database-types.ts`의 CONFIG 배열에서 관리

## 디자인 시안 기반 기능 목록

### 1. 홈페이지 (Home)

- Hero 배너 / 메인 비주얼
- 카테고리별 브라우징 섹션 (Dining, Living, Bedroom)
- 상품 그리드 디스플레이
- 할인/신상품 배지 표시
- 인스피레이션 섹션 (50+ Beautiful rooms)

### 2. 상품 목록 페이지 (Shop)

- 필터 기능
- 그리드/리스트 뷰 전환
- 정렬 옵션 (Sort by)
- 상품당 표시 개수 선택
- 페이지네이션
- 상품 카드 호버 인터랙션 (Share, Compare, Like)
- 빠른 장바구니 추가

### 3. 상품 상세 페이지 (Product Detail)

- 이미지 갤러리 및 썸네일
- 상품명, 가격, 평점
- 고객 리뷰 개수 표시
- 사이즈 선택 (S, L, XL)
- 컬러 선택
- 수량 조절 (+/-)
- 장바구니 추가 버튼
- 비교하기 기능
- 카테고리, 태그 정보
- 소셜 공유 (Facebook, LinkedIn, Twitter)
- 위시리스트 추가
- 탭 메뉴 (Description, Additional Information, Reviews)
- 상품 설명 및 이미지
- 연관 상품 추천

### 4. 장바구니 (Shopping Cart)

- 사이드 드로어 형태의 장바구니
- 상품 썸네일, 이름, 수량, 가격
- 항목별 삭제 기능
- 소계(Subtotal) 표시
- Cart, Checkout, Comparison 버튼

### 5. 공통 헤더 기능

- 로고 및 브랜드명
- 네비게이션 메뉴 (Home, Shop, About, Contact)
- 사용자 계정 아이콘
- 검색 아이콘
- 위시리스트 아이콘
- 장바구니 아이콘

### 6. Breadcrumb

- 현재 페이지 위치 표시

### 7. 푸터

- 회사 정보 (주소, 연락처)
- 링크 섹션 (Links, Help)
- 뉴스레터 구독
- SNS 링크
- 저작권 정보

---

## 시안에는 없지만 추가로 필요한 일반적인 쇼핑몰 기능

### 사용자 관리

- 회원가입 / 로그인 / 로그아웃
- 소셜 로그인 (Google)

### 결제 시스템

- 체크아웃 페이지
- 주문 확인 페이지
- 주문 완료 이메일 발송

### 검색 기능

- 검색 결과 페이지
- 최근 검색어
- 인기 검색어

### 위시리스트

- 위시리스트 페이지
- 위시리스트에서 장바구니로 이동

### 관리자 기능

- 상품 관리 (등록, 수정, 삭제)
- 재고 관리
- 할인 관리
- 주문 관리
- 회원 관리
- 통계/대시보드

### 기타

- 포인트/마일리지 시스템
- 반응형 디자인 (모바일 최적화)

---

## 개발 우선순위 제안

### Phase 1 - MVP (최소 기능 제품)

1. 홈페이지 기본 구조
2. 상품 목록 및 상세 페이지
3. 장바구니 기능
4. 간단한 체크아웃
5. 기본 사용자 인증

### Phase 2 - 핵심 기능 강화

1. 검색 및 필터링 고도화
2. 위시리스트

### Phase 3 - 부가 기능

1. 관리자 대시보드

### Phase 4 - 최적화 및 확장

1. 성능 최적화
2. SEO 최적화
3. 고급 분석 도구
