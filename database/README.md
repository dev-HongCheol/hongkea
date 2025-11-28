# 홍케아 가구 쇼핑몰 데이터베이스 스키마

이 문서는 가구 전문 이커머스 사이트를 위한 PostgreSQL 데이터베이스 스키마에 대한 상세한 설명을 제공합니다.

## 📋 목차

- [스키마 개요](#스키마-개요)
- [테이블 구조](#테이블-구조)
- [권한 시스템](#권한-시스템)
- [인덱스 최적화](#인덱스-최적화)
- [설치 및 설정](#설치-및-설정)
- [데이터 마이그레이션](#데이터-마이그레이션)
- [성능 최적화](#성능-최적화)

## 🏗️ 스키마 개요

### 기술 스택

- **데이터베이스**: PostgreSQL 14+ (Supabase)
- **인증 시스템**: Supabase Auth
- **확장 모듈**: uuid-ossp, pgcrypto
- **인덱스**: B-tree, GIN (전문검색, 배열 검색)
- **제약조건**: CHECK, UNIQUE, FOREIGN KEY
- **보안**: Row Level Security (RLS)

### 아키텍처 특징

- **Supabase 연동**: auth.users와 완전 통합된 사용자 관리
- **확장성**: UUID 기반 ID로 분산 환경 지원
- **성능**: 쿼리 패턴에 최적화된 복합 인덱스
- **보안**: RLS 정책으로 데이터 접근 제어
- **무결성**: 포괄적인 제약조건과 데이터 검증
- **유지보수**: 모든 테이블/컬럼에 상세한 코멘트

## 📊 테이블 구조

### 1. Supabase Auth 기반 사용자 관리 시스템

#### Supabase에서 자동 제공되는 테이블 (우리가 생성하지 않음)

- **`auth.users`**: Supabase가 자동 관리하는 사용자 인증 테이블
  - 이메일 로그인, 비밀번호 관리
  - 이메일 인증, 비밀번호 재설정
  - 사용자 메타데이터 (이름 등)
- **`auth.identities`**: Supabase가 자동 관리하는 소셜 로그인 테이블
  - Google, Facebook 등 소셜 계정 정보
  - 액세스 토큰, 리프레시 토큰 자동 관리
  - 다중 소셜 계정 연동 지원

#### 우리가 생성하는 사용자 확장 테이블

#### `hk_users` - 사용자 프로필 확장 정보

- **목적**: Supabase auth.users의 추가 프로필 정보 저장
- **특징**:
  - auth.users.id와 Foreign Key로 직접 연동
  - 자동 프로필 생성 트리거 (신규 가입시)
  - RLS 정책으로 개인정보 보호
- **필드**: 전화번호, 생년월일, 성별, 마케팅 동의 등
- **관계**: 1:N (주소, 주문, 리뷰)

#### `vw_hk_user_social_accounts` - 소셜 로그인 정보 뷰

- **목적**: auth.identities의 읽기 전용 뷰
- **특징**:
  - Supabase에서 관리하는 소셜 계정 정보 조회
  - Google, Facebook 프로필 정보 접근
  - 토큰 관리는 Supabase가 자동 처리

#### `hk_user_addresses` - 배송지 관리

- **목적**: 사용자 배송지 정보 저장
- **특징**: 기본 배송지 설정, 다중 주소 지원
- **보안**: RLS로 본인 주소만 조회/수정 가능

### 2. 상품 관리 시스템

#### `hk_categories` - 상품 카테고리

- **목적**: 계층적 카테고리 구조 (Dining > Table > Dining Table)
- **특징**: 무한 계층 지원, SEO 친화적 슬러그
- **기본 데이터**: Dining, Living, Bedroom

#### `hk_products` - 상품 기본 정보

- **목적**: 상품 마스터 정보 저장
- **특징**:
  - 가구 특화 필드 (치수, 소재, 관리방법)
  - 검색 최적화 (키워드 배열, 전문검색)
  - 마케팅 지원 (신상품, 베스트셀러, 추천)

#### `hk_product_variants` - 상품 옵션별 재고

- **목적**: 사이즈/컬러별 재고 관리
- **특징**: SKU 기반 재고 추적, 예약 수량 관리
- **알림**: 재고 부족 임계값 설정

#### `hk_product_images` - 상품 이미지

- **목적**: 상품 이미지 갤러리 관리
- **특징**: 대표 이미지 설정, 정렬 순서 지원
- **최적화**: CDN 연동 고려한 URL 구조

### 3. 쇼핑 및 주문 시스템

#### `hk_cart_items` - 장바구니

- **목적**: 로그인/비로그인 사용자 장바구니
- **특징**: 세션 기반 비회원 지원, 가격 스냅샷
- **성능**: 사용자별 인덱스 최적화

#### `hk_orders` - 주문 정보

- **목적**: 주문 마스터 정보 저장
- **특징**:
  - 주문번호 자동 생성 (HK 접두어)
  - 배송지 정보 스냅샷 (주소 변경 대비)
  - 상태별 시간 추적

#### `hk_order_items` - 주문 상세

- **목적**: 주문 상품별 상세 정보
- **특징**: 가격 스냅샷 (가격 변동 대비), 옵션 정보 저장
- **무결성**: 총액 = 단가 × 수량 제약조건

#### `hk_payments` - 결제 정보

- **목적**: 다양한 결제수단 지원
- **특징**: PG사 연동 정보, 결제 상태 추적
- **보안**: 민감 정보 제외한 메타데이터만 저장

### 4. 리뷰 및 평점 시스템

#### `hk_product_reviews` - 상품 리뷰

- **목적**: 구매 확정 고객 리뷰 시스템
- **특징**:
  - 주문 연동으로 구매 검증
  - 이미지 리뷰 지원
  - 관리자 승인 시스템

#### `hk_review_votes` - 리뷰 유용성 투표

- **목적**: 리뷰 품질 개선
- **특징**: 사용자별 중복 투표 방지
- **활용**: 유용한 리뷰 우선 노출

### 5. 마케팅 및 할인 시스템

#### `hk_coupons` - 쿠폰 관리

- **목적**: 다양한 할인 정책 지원
- **특징**:
  - 퍼센트/정액 할인
  - 사용 제한 및 조건 설정
  - 카테고리/상품별 적용 범위

### 6. 분석 및 로그 시스템

#### `hk_search_logs` - 검색 로그

- **목적**: 사용자 검색 패턴 분석
- **활용**: 인기 검색어, 검색 결과 개선

#### `hk_product_views` - 상품 조회 로그

- **목적**: 상품별 인기도 측정
- **활용**: 추천 알고리즘, 트렌드 분석

## 🔐 권한 시스템

### 관리자 계정 구조 (Supabase Auth 기반)

#### `hk_admin_users` - 관리자 사용자

- **연동**: auth.users.id와 Foreign Key로 연결
- **역할**:
  - `super_admin`: 시스템 전체 권한
  - `admin`: 일반 관리 권한
  - `moderator`: 리뷰/고객서비스 권한
  - `content_manager`: 콘텐츠 관리 권한
  - `customer_service`: 고객서비스 권한

#### 세부 권한 관리

```json
{
  "products": ["create", "read", "update", "delete"],
  "orders": ["read", "update"],
  "users": ["read", "update"],
  "reviews": ["read", "approve", "delete"],
  "coupons": ["create", "read", "update", "delete"],
  "analytics": ["read"]
}
```

### 상품 관리 권한

- **상품 등록**: `admin`, `super_admin` 권한 필요
- **상품 수정**: `admin`, `super_admin` 권한 필요
- **재고 관리**: `admin`, `super_admin` 권한 필요
- **카테고리 관리**: `super_admin` 권한 필요

### Supabase Auth 기반 관리자 등록 방법

#### 1. 첫 번째 Super Admin 생성 (Supabase Dashboard)

```sql
-- 1단계: Supabase에서 사용자 생성 (Dashboard 또는 Admin API)
-- 2단계: 생성된 사용자를 관리자로 등록
INSERT INTO hk_admin_users (user_id, role, permissions)
SELECT
    id,
    'super_admin',
    (SELECT setting_value::jsonb FROM hk_system_settings WHERE setting_key = 'admin_permissions_super_admin')
FROM auth.users
WHERE email = 'admin@hongkea.com';
```

#### 2. 기존 관리자가 새 관리자 생성 (애플리케이션)

```typescript
// 1. Supabase Admin API로 사용자 생성
const { data: authUser, error } = await supabase.auth.admin.createUser({
  email: "new-admin@hongkea.com",
  password: "secure_password",
  user_metadata: {
    first_name: "새",
    last_name: "관리자",
  },
});

// 2. 관리자 권한 부여
await supabase.from("hk_admin_users").insert({
  user_id: authUser.user.id,
  role: "admin",
  permissions: getPermissionsByRole("admin"),
  created_by: currentAdminId,
});
```

### RLS (Row Level Security) 정책

#### 주요 보안 정책

- **사용자 데이터**: `auth.uid() = user_id` - 본인 데이터만 접근
- **상품 관리**: 관리자만 CUD 가능, 일반 사용자는 조회만
- **주문 정보**: 사용자는 본인 주문만, 관리자는 전체 조회
- **장바구니**: 로그인 사용자는 본인 것만, 비회원은 세션 기반

#### RLS 정책 예시

```sql
-- 사용자 프로필: 본인만 조회/수정
CREATE POLICY "Users can view their own profile" ON hk_users
    FOR SELECT USING (auth.uid() = id);

-- 상품 등록: 관리자만 가능
CREATE POLICY "Only admins can create products" ON hk_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM hk_admin_users a
            WHERE a.user_id = auth.uid()
            AND a.is_active = TRUE
            AND (a.permissions->>'products' ? 'create' OR a.role = 'super_admin')
        )
    );
```

### 보안 고려사항

- **Supabase Auth 활용**: 이메일 인증, 비밀번호 정책 자동 적용
- **관리자 계정**: 기존 관리자 승인 필요한 생성 프로세스
- **RLS 정책**: 테이블별 세밀한 접근 제어
- **토큰 관리**: Supabase에서 JWT 토큰 자동 관리
- **감사 로그**: 관리자 활동 추적 (`hk_admin_activity_logs`)

## 📈 인덱스 최적화

### 검색 성능 최적화

```sql
-- 상품 검색 (복합 인덱스)
idx_hk_products_category_active      -- 카테고리별 조회
idx_hk_products_price_range          -- 가격대 필터
idx_hk_products_name_search          -- 상품명 전문검색

-- 재고 관리
idx_hk_variants_low_stock           -- 재고 부족 상품 조회

-- 주문 조회
idx_hk_orders_user_created          -- 사용자별 주문 내역
idx_hk_orders_status_created        -- 주문 상태별 조회
```

### GIN 인덱스 활용

```sql
-- 배열 검색 최적화
idx_hk_products_search_keywords     -- 검색 키워드
idx_hk_products_materials           -- 소재 정보

-- JSON 검색 최적화
hk_product_variants.option_combinations -- 옵션 조합 검색
```

## 🚀 Supabase 설치 및 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. PostgreSQL 데이터베이스 자동 생성됨
3. auth.users, auth.identities 테이블 자동 제공

### 2. 인증 설정

```javascript
// Supabase 설정에서 Auth 활성화
// 1. Email/Password 로그인 활성화
// 2. Google OAuth 설정
//    - Google Console에서 OAuth 2.0 클라이언트 ID 생성
//    - Supabase Auth 설정에 Client ID, Secret 입력
//    - 리디렉션 URL: https://your-project.supabase.co/auth/v1/callback
```

### 3. 스키마 실행 (Supabase SQL Editor)

```sql
-- Supabase SQL Editor에서 실행
-- database/db.sql 내용을 복사하여 실행
```

### 4. RLS 활성화 확인

```sql
-- RLS가 제대로 활성화되었는지 확인
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'hk_%' AND rowsecurity = true;
```

### 5. 초기 데이터 확인

```sql
-- 기본 카테고리 확인
SELECT * FROM hk_categories;

-- 시스템 설정 확인
SELECT * FROM hk_system_settings;

-- Auth 테이블 확인 (Supabase 제공)
SELECT id, email, created_at FROM auth.users LIMIT 5;
```

### 6. 환경변수 설정 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📦 데이터 마이그레이션

### 기존 시스템에서 마이그레이션

1. **사용자 데이터**: 비밀번호 해싱 재처리 필요
2. **상품 데이터**: 이미지 URL 경로 업데이트
3. **주문 데이터**: 상태 코드 매핑 테이블 작성

### Supabase 마이그레이션 스크립트 예시

```sql
-- 1. 기존 사용자를 Supabase Auth로 마이그레이션
-- 주의: Supabase Admin API 사용 필요
-- 2. 프로필 정보는 자동 트리거로 생성됨
-- 3. 추가 프로필 정보 업데이트
UPDATE hk_users SET
    phone = old_users.phone,
    birth_date = old_users.birth_date
FROM old_users_table old_users
JOIN auth.users au ON au.email = old_users.email
WHERE hk_users.id = au.id;
```

### Supabase 인증 플로우

```typescript
// 1. 일반 회원가입 (이메일/비밀번호)
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password",
  options: {
    data: {
      first_name: "홍",
      last_name: "길동",
    },
  },
});
// -> auth.users 생성 -> hk_users 프로필 자동 생성 (트리거)

// 2. Google 소셜 로그인
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "https://your-site.com/auth/callback",
  },
});
// -> auth.users + auth.identities 생성 -> hk_users 프로필 자동 생성
```

## ⚡ 성능 최적화

### 쿼리 최적화 가이드

#### 1. 상품 목록 조회

```sql
-- 권장: 인덱스 활용
SELECT * FROM vw_hk_products_summary
WHERE category_id = ? AND is_active = true
ORDER BY created_at DESC;

-- 비권장: 풀스캔
SELECT * FROM hk_products WHERE name LIKE '%의자%';
```

#### 2. 재고 확인

```sql
-- 권장: variant 테이블 직접 조회
SELECT stock_quantity FROM hk_product_variants
WHERE variant_sku = ?;

-- 비권장: 조인 후 집계
SELECT SUM(stock_quantity) FROM hk_product_variants
JOIN hk_products ON ...;
```

### 정기 유지보수

#### 1. 통계 정보 업데이트

```sql
-- 주간 실행 권장
ANALYZE hk_products;
ANALYZE hk_orders;
ANALYZE hk_product_views;
```

#### 2. 인덱스 재구성

```sql
-- 월간 실행 권장
REINDEX INDEX idx_hk_products_name_search;
REINDEX INDEX idx_hk_search_logs_query_created;
```

#### 3. 로그 데이터 정리

```sql
-- 6개월 이상 된 검색 로그 아카이빙
DELETE FROM hk_search_logs
WHERE created_at < NOW() - INTERVAL '6 months';
```

## 🔍 유용한 뷰 활용

### `vw_hk_products_summary` - 상품 요약 정보

```sql
-- 평점, 리뷰수, 재고 포함한 상품 정보
SELECT * FROM vw_hk_products_summary
WHERE category_slug = 'dining'
ORDER BY avg_rating DESC;
```

### `vw_hk_order_statistics` - 주문 통계

```sql
-- 일별 매출 통계
SELECT * FROM vw_hk_order_statistics
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';
```

## 📝 주요 비즈니스 로직

### 1. 재고 차감 프로세스

1. 주문 생성시 `reserved_quantity` 증가
2. 결제 완료시 `stock_quantity` 차감, `reserved_quantity` 감소
3. 주문 취소시 `reserved_quantity` 감소

### 2. 쿠폰 적용 검증

1. 유효기간 확인
2. 사용 횟수 제한 확인
3. 최소 주문 금액 확인
4. 적용 가능 상품/카테고리 확인

### 3. 리뷰 작성 권한

1. 주문 완료 상태 확인
2. 배송 완료 후 작성 가능
3. 상품별 1회 제한

## 🚨 주의사항

### 보안

- 관리자 계정 생성/권한 변경시 승인 프로세스 필수
- 결제 정보는 PG사 토큰만 저장, 카드번호 등 민감정보 저장 금지
- 사용자 비밀번호는 bcrypt 해싱 필수

### 성능

- 대용량 로그 테이블의 정기적인 파티셔닝 고려
- 이미지 URL은 CDN 도메인 사용 권장
- 검색 쿼리는 전문검색 인덱스 활용 필수

### 데이터 무결성

- 금액 관련 계산은 애플리케이션에서 이중 검증
- 재고 수량은 동시성 제어 필수 (낙관적 락 활용)
- 주문 상태 변경은 워크플로우 검증 후 처리

---

## 📞 지원

데이터베이스 스키마 관련 문의사항이 있으시면 개발팀으로 연락 바랍니다.

**버전**: 1.0.0  
**최종 업데이트**: 2024-11-20  
**호환성**: PostgreSQL 14+
