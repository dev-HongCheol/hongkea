-- =========================================
-- 가구 전문 이커머스 데이터베이스 스키마
-- 프로젝트: st-hongkea (가구 쇼핑몰)
-- 설계 기준: README.md 요구사항 기반
-- Supabase Auth 연동 구조
-- =========================================

-- 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- Supabase Auth 연동 설정
-- =========================================
-- 주의: Supabase는 auth 스키마를 자동으로 관리합니다.
-- auth.users 테이블은 Supabase가 생성하므로 여기서 생성하지 않습니다.
-- 이 스키마는 auth.users와 연동되는 추가 프로필 정보를 관리합니다.

-- =========================================
-- 1. 사용자 관리 시스템
-- =========================================

-- 사용자 프로필 테이블 (Supabase auth.users와 연동)
CREATE TABLE hk_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    profile_image_url TEXT,
    marketing_consent BOOLEAN DEFAULT FALSE,
    sms_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security) 활성화
ALTER TABLE hk_users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view their own profile" ON hk_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON hk_users
    FOR UPDATE USING (auth.uid() = id);

-- 새 사용자 등록시 자동으로 프로필 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.hk_users (id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성되면 자동으로 프로필 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON TABLE hk_users IS '사용자 프로필 정보 (Supabase auth.users 확장)';
COMMENT ON COLUMN hk_users.id IS 'Supabase auth.users.id와 연동되는 사용자 고유 식별자';
COMMENT ON COLUMN hk_users.first_name IS '사용자 이름';
COMMENT ON COLUMN hk_users.last_name IS '사용자 성';
COMMENT ON COLUMN hk_users.phone IS '전화번호 (예: 010-1234-5678)';
COMMENT ON COLUMN hk_users.birth_date IS '생년월일';
COMMENT ON COLUMN hk_users.gender IS '성별 (male, female, other)';
COMMENT ON COLUMN hk_users.profile_image_url IS '프로필 이미지 URL';
COMMENT ON COLUMN hk_users.marketing_consent IS '마케팅 정보 수신 동의 여부';
COMMENT ON COLUMN hk_users.sms_consent IS 'SMS 수신 동의 여부';
COMMENT ON COLUMN hk_users.created_at IS '계정 생성일시';
COMMENT ON COLUMN hk_users.updated_at IS '마지막 수정일시';
COMMENT ON COLUMN hk_users.last_login_at IS '마지막 로그인 일시';

-- 참고: Supabase는 auth.identities 테이블에서 소셜 로그인을 관리합니다.
-- 추가 소셜 계정 정보가 필요한 경우에만 이 테이블을 사용하세요.
-- CREATE TABLE hk_user_social_accounts (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
--     provider VARCHAR(50) NOT NULL,
--     additional_data JSONB, -- Supabase에서 제공하지 않는 추가 정보
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Supabase auth.identities 뷰 (읽기 전용)
-- 소셜 로그인 정보는 이 뷰를 통해 조회하세요
CREATE OR REPLACE VIEW vw_hk_user_social_accounts AS
SELECT 
    i.id,
    i.user_id,
    i.identity_data->>'provider' as provider,
    i.identity_data->>'email' as provider_email,
    i.identity_data->>'name' as provider_name,
    i.identity_data->>'picture' as provider_picture,
    i.created_at,
    i.updated_at
FROM auth.identities i
WHERE i.provider != 'email'; -- 이메일 로그인 제외

COMMENT ON VIEW vw_hk_user_social_accounts IS 'Supabase auth.identities 소셜 로그인 정보 뷰';

-- 사용자 주소 정보
CREATE TABLE hk_user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    address_name VARCHAR(100), -- '집', '회사', '기본 배송지' 등
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL, -- 도로명 주소
    address_line2 VARCHAR(255), -- 상세 주소
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'South Korea',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE hk_user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 주소만 관리 가능
CREATE POLICY "Users can manage their own addresses" ON hk_user_addresses
    USING (auth.uid() = user_id);

COMMENT ON TABLE hk_user_addresses IS '사용자 배송지 주소 정보';
COMMENT ON COLUMN hk_user_addresses.id IS '배송지 고유 식별자';
COMMENT ON COLUMN hk_user_addresses.user_id IS '사용자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_user_addresses.address_name IS '배송지 별칭 (예: 집, 회사, 기본 배송지)';
COMMENT ON COLUMN hk_user_addresses.recipient_name IS '수령인 이름';
COMMENT ON COLUMN hk_user_addresses.recipient_phone IS '수령인 전화번호';
COMMENT ON COLUMN hk_user_addresses.postal_code IS '우편번호';
COMMENT ON COLUMN hk_user_addresses.address_line1 IS '도로명 주소';
COMMENT ON COLUMN hk_user_addresses.address_line2 IS '상세 주소 (동, 호수 등)';
COMMENT ON COLUMN hk_user_addresses.city IS '시/도';
COMMENT ON COLUMN hk_user_addresses.state IS '구/군';
COMMENT ON COLUMN hk_user_addresses.country IS '국가 (기본값: South Korea)';
COMMENT ON COLUMN hk_user_addresses.is_default IS '기본 배송지 여부';
COMMENT ON COLUMN hk_user_addresses.created_at IS '배송지 등록일시';
COMMENT ON COLUMN hk_user_addresses.updated_at IS '배송지 수정일시';

-- =========================================
-- 2. 상품 관리 시스템
-- =========================================

-- 상품 카테고리 테이블 (계층적 구조 지원)
CREATE TABLE hk_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_category_id UUID REFERENCES hk_categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_categories IS '상품 카테고리 (Dining, Living, Bedroom 등)';
COMMENT ON COLUMN hk_categories.id IS '카테고리 고유 식별자';
COMMENT ON COLUMN hk_categories.parent_category_id IS '상위 카테고리 ID (계층 구조용)';
COMMENT ON COLUMN hk_categories.name IS '카테고리 이름 (예: Dining, Living, Bedroom)';
COMMENT ON COLUMN hk_categories.slug IS 'URL용 슬러그 (SEO 친화적)';
COMMENT ON COLUMN hk_categories.description IS '카테고리 설명';
COMMENT ON COLUMN hk_categories.image_url IS '카테고리 대표 이미지 URL';
COMMENT ON COLUMN hk_categories.sort_order IS '정렬 순서 (낮을수록 우선)';
COMMENT ON COLUMN hk_categories.is_active IS '카테고리 활성화 여부';
COMMENT ON COLUMN hk_categories.meta_title IS 'SEO 메타 타이틀';
COMMENT ON COLUMN hk_categories.meta_description IS 'SEO 메타 설명';
COMMENT ON COLUMN hk_categories.created_at IS '카테고리 생성일시';
COMMENT ON COLUMN hk_categories.updated_at IS '카테고리 수정일시';

-- 브랜드 테이블
CREATE TABLE hk_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_brands IS '가구 브랜드 정보';
COMMENT ON COLUMN hk_brands.id IS '브랜드 고유 식별자';
COMMENT ON COLUMN hk_brands.name IS '브랜드 이름';
COMMENT ON COLUMN hk_brands.slug IS 'URL용 브랜드 슬러그';
COMMENT ON COLUMN hk_brands.description IS '브랜드 설명';
COMMENT ON COLUMN hk_brands.logo_url IS '브랜드 로고 이미지 URL';
COMMENT ON COLUMN hk_brands.website_url IS '브랜드 공식 웹사이트 URL';
COMMENT ON COLUMN hk_brands.is_active IS '브랜드 활성화 여부';
COMMENT ON COLUMN hk_brands.created_at IS '브랜드 등록일시';
COMMENT ON COLUMN hk_brands.updated_at IS '브랜드 수정일시';

-- 상품 기본 정보 테이블
CREATE TABLE hk_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES hk_categories(id),
    brand_id UUID REFERENCES hk_brands(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    long_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL, -- 상품 고유 코드
    base_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2), -- 할인 가격
    cost_price DECIMAL(12,2), -- 원가
    weight DECIMAL(8,2), -- 무게(kg)
    dimensions JSONB, -- {"width": 120, "height": 80, "depth": 50} (cm)
    materials TEXT[], -- 소재 정보 배열
    care_instructions TEXT, -- 관리 방법
    warranty_period INTEGER, -- 보증 기간(월)
    is_featured BOOLEAN DEFAULT FALSE, -- 추천 상품 여부
    is_new BOOLEAN DEFAULT FALSE, -- 신상품 여부
    is_bestseller BOOLEAN DEFAULT FALSE, -- 베스트셀러 여부
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    search_keywords TEXT[], -- 검색 키워드 배열
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화 (상품은 모든 사용자가 조회 가능, 관리자만 CUD 가능)
ALTER TABLE hk_products ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 활성 상품 조회 가능
CREATE POLICY "Anyone can view active products" ON hk_products
    FOR SELECT USING (is_active = TRUE);

-- 관리자 권한 정책은 hk_admin_users 테이블 생성 후에 추가됩니다.

COMMENT ON TABLE hk_products IS '상품 기본 정보';
COMMENT ON COLUMN hk_products.id IS '상품 고유 식별자';
COMMENT ON COLUMN hk_products.category_id IS '카테고리 ID (hk_categories.id 참조)';
COMMENT ON COLUMN hk_products.brand_id IS '브랜드 ID (hk_brands.id 참조)';
COMMENT ON COLUMN hk_products.name IS '상품명';
COMMENT ON COLUMN hk_products.slug IS 'URL용 상품 슬러그 (SEO)';
COMMENT ON COLUMN hk_products.short_description IS '상품 간단 설명';
COMMENT ON COLUMN hk_products.long_description IS '상품 상세 설명';
COMMENT ON COLUMN hk_products.sku IS '상품 고유 코드 (Stock Keeping Unit)';
COMMENT ON COLUMN hk_products.base_price IS '기본 정가';
COMMENT ON COLUMN hk_products.sale_price IS '할인 판매 가격';
COMMENT ON COLUMN hk_products.cost_price IS '원가 (관리용)';
COMMENT ON COLUMN hk_products.weight IS '상품 무게 (kg)';
COMMENT ON COLUMN hk_products.dimensions IS '제품 치수 정보 JSON {"width": 120, "height": 80, "depth": 50}';
COMMENT ON COLUMN hk_products.materials IS '소재 정보 배열 (예: ["원목", "스틸", "패브릭"])';
COMMENT ON COLUMN hk_products.care_instructions IS '제품 관리 방법 및 주의사항';
COMMENT ON COLUMN hk_products.warranty_period IS '품질보증 기간 (개월 단위)';
COMMENT ON COLUMN hk_products.is_featured IS '추천 상품 여부 (메인페이지 노출)';
COMMENT ON COLUMN hk_products.is_new IS '신상품 여부 (NEW 배지)';
COMMENT ON COLUMN hk_products.is_bestseller IS '베스트셀러 여부 (BEST 배지)';
COMMENT ON COLUMN hk_products.is_active IS '상품 활성화 여부 (판매 가능)';
COMMENT ON COLUMN hk_products.meta_title IS 'SEO 메타 타이틀';
COMMENT ON COLUMN hk_products.meta_description IS 'SEO 메타 설명';
COMMENT ON COLUMN hk_products.search_keywords IS '검색 키워드 배열 (검색 최적화용)';
COMMENT ON COLUMN hk_products.created_at IS '상품 등록일시';
COMMENT ON COLUMN hk_products.updated_at IS '상품 수정일시';

-- 상품 이미지 테이블
CREATE TABLE hk_product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE, -- 대표 이미지 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_images IS '상품 이미지 정보';
COMMENT ON COLUMN hk_product_images.id IS '상품 이미지 고유 식별자';
COMMENT ON COLUMN hk_product_images.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_product_images.image_url IS '이미지 파일 URL';
COMMENT ON COLUMN hk_product_images.alt_text IS '이미지 대체 텍스트 (접근성)';
COMMENT ON COLUMN hk_product_images.sort_order IS '이미지 정렬 순서';
COMMENT ON COLUMN hk_product_images.is_primary IS '대표 이미지 여부';
COMMENT ON COLUMN hk_product_images.created_at IS '이미지 등록일시';

-- 상품 옵션 그룹 (사이즈, 컬러 등)
CREATE TABLE hk_product_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Size', 'Color' 등
    display_type VARCHAR(20) DEFAULT 'select', -- 'select', 'radio', 'color_picker'
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_option_groups IS '상품 옵션 그룹 (사이즈, 컬러 등)';
COMMENT ON COLUMN hk_product_option_groups.id IS '옵션 그룹 고유 식별자';
COMMENT ON COLUMN hk_product_option_groups.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_product_option_groups.name IS '옵션 그룹명 (예: Size, Color)';
COMMENT ON COLUMN hk_product_option_groups.display_type IS '화면 표시 방식 (select, radio, color_picker)';
COMMENT ON COLUMN hk_product_option_groups.is_required IS '필수 선택 옵션 여부';
COMMENT ON COLUMN hk_product_option_groups.sort_order IS '옵션 그룹 정렬 순서';
COMMENT ON COLUMN hk_product_option_groups.created_at IS '옵션 그룹 생성일시';

-- 상품 옵션 값
CREATE TABLE hk_product_option_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_group_id UUID NOT NULL REFERENCES hk_product_option_groups(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL, -- 'L', 'XL', 'Red', 'Blue' 등
    display_name VARCHAR(100), -- 화면 표시용 이름
    color_code VARCHAR(7), -- 컬러 옵션인 경우 색상 코드 (#FF0000)
    additional_price DECIMAL(12,2) DEFAULT 0, -- 추가 가격
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_option_values IS '상품 옵션 값';
COMMENT ON COLUMN hk_product_option_values.id IS '옵션 값 고유 식별자';
COMMENT ON COLUMN hk_product_option_values.option_group_id IS '옵션 그룹 ID (hk_product_option_groups.id 참조)';
COMMENT ON COLUMN hk_product_option_values.value IS '옵션 값 (예: L, XL, Red, Blue)';
COMMENT ON COLUMN hk_product_option_values.display_name IS '화면 표시용 이름';
COMMENT ON COLUMN hk_product_option_values.color_code IS '컬러 옵션인 경우 색상 코드 (#FF0000)';
COMMENT ON COLUMN hk_product_option_values.additional_price IS '옵션별 추가 가격';
COMMENT ON COLUMN hk_product_option_values.sort_order IS '옵션 값 정렬 순서';
COMMENT ON COLUMN hk_product_option_values.is_active IS '옵션 값 활성화 여부';
COMMENT ON COLUMN hk_product_option_values.created_at IS '옵션 값 생성일시';

-- 상품 재고 관리 (SKU별 재고)
CREATE TABLE hk_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    variant_sku VARCHAR(100) UNIQUE NOT NULL, -- 옵션 조합별 고유 SKU
    option_combinations JSONB NOT NULL, -- 옵션 조합 정보
    additional_price DECIMAL(12,2) DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- 주문 대기중인 수량
    low_stock_threshold INTEGER DEFAULT 5, -- 재고 부족 임계값
    weight DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_variants IS '상품 옵션별 재고 관리';
COMMENT ON COLUMN hk_product_variants.id IS '상품 옵션 조합 고유 식별자';
COMMENT ON COLUMN hk_product_variants.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_product_variants.variant_sku IS '옵션 조합별 고유 SKU';
COMMENT ON COLUMN hk_product_variants.option_combinations IS '선택된 옵션 조합 JSON {"size": "L", "color": "Red"}';
COMMENT ON COLUMN hk_product_variants.additional_price IS '옵션 조합별 추가 가격';
COMMENT ON COLUMN hk_product_variants.stock_quantity IS '현재 재고 수량';
COMMENT ON COLUMN hk_product_variants.reserved_quantity IS '주문 처리 중인 예약 수량';
COMMENT ON COLUMN hk_product_variants.low_stock_threshold IS '재고 부족 알림 임계값';
COMMENT ON COLUMN hk_product_variants.weight IS '옵션별 무게 (다를 경우)';
COMMENT ON COLUMN hk_product_variants.is_active IS '옵션 조합 활성화 여부';
COMMENT ON COLUMN hk_product_variants.created_at IS '옵션 조합 생성일시';
COMMENT ON COLUMN hk_product_variants.updated_at IS '재고 정보 수정일시';

-- =========================================
-- 3. 장바구니 및 위시리스트 시스템
-- =========================================

-- 장바구니 테이블
CREATE TABLE hk_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES hk_users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- 비회원 장바구니용 세션 ID
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES hk_product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_price DECIMAL(12,2) NOT NULL, -- 담을 당시의 가격 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- RLS 활성화
ALTER TABLE hk_cart_items ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 장바구니만 관리 가능 (세션 기반 포함)
CREATE POLICY "Users can manage their own cart items" ON hk_cart_items
    USING (auth.uid() = user_id OR (auth.uid() IS NULL AND session_id IS NOT NULL));

COMMENT ON TABLE hk_cart_items IS '장바구니 아이템';
COMMENT ON COLUMN hk_cart_items.id IS '장바구니 아이템 고유 식별자';
COMMENT ON COLUMN hk_cart_items.user_id IS '사용자 ID (로그인 사용자용, hk_users.id 참조)';
COMMENT ON COLUMN hk_cart_items.session_id IS '세션 ID (비회원 사용자용)';
COMMENT ON COLUMN hk_cart_items.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_cart_items.variant_id IS '옵션 조합 ID (hk_product_variants.id 참조)';
COMMENT ON COLUMN hk_cart_items.quantity IS '담은 수량';
COMMENT ON COLUMN hk_cart_items.added_price IS '장바구니에 담을 당시의 가격 (가격 변동 추적용)';
COMMENT ON COLUMN hk_cart_items.created_at IS '장바구니 담은 일시';
COMMENT ON COLUMN hk_cart_items.updated_at IS '수량 변경 등 수정일시';

-- 위시리스트 테이블
CREATE TABLE hk_wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- RLS 활성화
ALTER TABLE hk_wishlists ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 위시리스트만 관리 가능
CREATE POLICY "Users can manage their own wishlist" ON hk_wishlists
    USING (auth.uid() = user_id);

COMMENT ON TABLE hk_wishlists IS '위시리스트 (찜하기)';
COMMENT ON COLUMN hk_wishlists.id IS '위시리스트 고유 식별자';
COMMENT ON COLUMN hk_wishlists.user_id IS '사용자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_wishlists.product_id IS '찜한 상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_wishlists.created_at IS '찜하기 등록일시';

-- =========================================
-- 4. 주문 및 결제 시스템
-- =========================================

-- 주문 상태 열거형
CREATE TYPE order_status AS ENUM (
    'pending',           -- 주문 대기
    'confirmed',         -- 주문 확인
    'processing',        -- 처리중
    'shipped',           -- 배송중
    'delivered',         -- 배송완료
    'cancelled',         -- 취소
    'refunded'          -- 환불
);

-- 결제 상태 열거형
CREATE TYPE payment_status AS ENUM (
    'pending',           -- 결제 대기
    'processing',        -- 결제 처리중
    'completed',         -- 결제 완료
    'failed',           -- 결제 실패
    'cancelled',         -- 결제 취소
    'refunded'          -- 환불
);

-- 주문 테이블
CREATE TABLE hk_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- 주문번호
    user_id UUID REFERENCES hk_users(id),
    guest_email VARCHAR(255), -- 비회원 주문시 이메일
    status order_status DEFAULT 'pending',
    
    -- 주문자 정보
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- 배송지 정보 (스냅샷)
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_postal_code VARCHAR(10) NOT NULL,
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'South Korea',
    
    -- 금액 정보
    subtotal_amount DECIMAL(12,2) NOT NULL, -- 상품 금액 합계
    shipping_amount DECIMAL(12,2) DEFAULT 0, -- 배송비
    tax_amount DECIMAL(12,2) DEFAULT 0, -- 세금
    discount_amount DECIMAL(12,2) DEFAULT 0, -- 할인 금액
    total_amount DECIMAL(12,2) NOT NULL, -- 총 결제 금액
    
    -- 메모 및 요청사항
    order_notes TEXT,
    shipping_notes TEXT,
    
    -- 시간 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE hk_orders ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 주문만 조회 가능 (관리자 권한은 나중에 추가)
CREATE POLICY "Users can view their own orders" ON hk_orders
    FOR SELECT USING (auth.uid() = user_id);

-- 관리자 권한 정책은 hk_admin_users 테이블 생성 후에 추가됩니다.

COMMENT ON TABLE hk_orders IS '주문 정보';
COMMENT ON COLUMN hk_orders.id IS '주문 고유 식별자';
COMMENT ON COLUMN hk_orders.order_number IS '주문번호 (사용자용 표시번호)';
COMMENT ON COLUMN hk_orders.user_id IS '주문자 ID (회원 주문시, hk_users.id 참조)';
COMMENT ON COLUMN hk_orders.guest_email IS '비회원 주문시 연락용 이메일';
COMMENT ON COLUMN hk_orders.status IS '주문 상태 (pending, confirmed, processing, shipped, delivered, cancelled, refunded)';
COMMENT ON COLUMN hk_orders.customer_name IS '주문자 이름';
COMMENT ON COLUMN hk_orders.customer_email IS '주문자 이메일';
COMMENT ON COLUMN hk_orders.customer_phone IS '주문자 전화번호';
COMMENT ON COLUMN hk_orders.shipping_name IS '수령인 이름';
COMMENT ON COLUMN hk_orders.shipping_phone IS '수령인 전화번호';
COMMENT ON COLUMN hk_orders.shipping_postal_code IS '배송지 우편번호';
COMMENT ON COLUMN hk_orders.shipping_address_line1 IS '배송지 도로명 주소';
COMMENT ON COLUMN hk_orders.shipping_address_line2 IS '배송지 상세 주소';
COMMENT ON COLUMN hk_orders.shipping_city IS '배송지 시/도';
COMMENT ON COLUMN hk_orders.shipping_state IS '배송지 구/군';
COMMENT ON COLUMN hk_orders.shipping_country IS '배송지 국가';
COMMENT ON COLUMN hk_orders.subtotal_amount IS '상품 금액 합계 (할인 전)';
COMMENT ON COLUMN hk_orders.shipping_amount IS '배송비';
COMMENT ON COLUMN hk_orders.tax_amount IS '세금 (부가세 등)';
COMMENT ON COLUMN hk_orders.discount_amount IS '할인 금액 (쿠폰, 적립금 등)';
COMMENT ON COLUMN hk_orders.total_amount IS '총 결제 금액';
COMMENT ON COLUMN hk_orders.order_notes IS '주문 요청사항';
COMMENT ON COLUMN hk_orders.shipping_notes IS '배송 요청사항';
COMMENT ON COLUMN hk_orders.created_at IS '주문 생성일시';
COMMENT ON COLUMN hk_orders.updated_at IS '주문 정보 수정일시';
COMMENT ON COLUMN hk_orders.shipped_at IS '배송 시작일시';
COMMENT ON COLUMN hk_orders.delivered_at IS '배송 완료일시';

-- 주문 상품 상세 테이블
CREATE TABLE hk_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES hk_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES hk_products(id),
    variant_id UUID REFERENCES hk_product_variants(id),
    
    -- 주문 당시 상품 정보 스냅샷 (가격 변동 대비)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    variant_sku VARCHAR(100),
    option_details JSONB, -- 선택한 옵션 정보
    
    -- 가격 및 수량
    unit_price DECIMAL(12,2) NOT NULL, -- 주문 당시 단가
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(12,2) NOT NULL, -- 단가 × 수량
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_order_items IS '주문 상품 상세 정보';
COMMENT ON COLUMN hk_order_items.id IS '주문 상품 고유 식별자';
COMMENT ON COLUMN hk_order_items.order_id IS '주문 ID (hk_orders.id 참조)';
COMMENT ON COLUMN hk_order_items.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_order_items.variant_id IS '옵션 조합 ID (hk_product_variants.id 참조)';
COMMENT ON COLUMN hk_order_items.product_name IS '주문 당시 상품명 (변경 대비 스냅샷)';
COMMENT ON COLUMN hk_order_items.product_sku IS '주문 당시 상품 SKU';
COMMENT ON COLUMN hk_order_items.variant_sku IS '주문 당시 옵션 조합 SKU';
COMMENT ON COLUMN hk_order_items.option_details IS '선택한 옵션 정보 JSON (주문 당시 스냅샷)';
COMMENT ON COLUMN hk_order_items.unit_price IS '주문 당시 단가';
COMMENT ON COLUMN hk_order_items.quantity IS '주문 수량';
COMMENT ON COLUMN hk_order_items.total_price IS '해당 상품 총 가격 (단가 × 수량)';
COMMENT ON COLUMN hk_order_items.created_at IS '주문 상품 등록일시';

-- 결제 정보 테이블
CREATE TABLE hk_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES hk_orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- 'card', 'bank_transfer', 'paypal' 등
    payment_provider VARCHAR(50), -- 'stripe', 'toss', 'kakao_pay' 등
    provider_payment_id VARCHAR(255), -- 결제 서비스의 결제 ID
    status payment_status DEFAULT 'pending',
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    
    -- 결제 상세 정보
    payment_details JSONB, -- 결제 수단별 상세 정보
    failure_reason TEXT, -- 실패 사유
    
    -- 시간 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE hk_payments IS '결제 정보';
COMMENT ON COLUMN hk_payments.id IS '결제 정보 고유 식별자';
COMMENT ON COLUMN hk_payments.order_id IS '주문 ID (hk_orders.id 참조)';
COMMENT ON COLUMN hk_payments.payment_method IS '결제 수단 (card, bank_transfer, paypal 등)';
COMMENT ON COLUMN hk_payments.payment_provider IS '결제 서비스 제공업체 (stripe, toss, kakao_pay 등)';
COMMENT ON COLUMN hk_payments.provider_payment_id IS '결제 서비스 업체의 거래 ID';
COMMENT ON COLUMN hk_payments.status IS '결제 상태 (pending, processing, completed, failed, cancelled, refunded)';
COMMENT ON COLUMN hk_payments.amount IS '결제 금액';
COMMENT ON COLUMN hk_payments.currency IS '통화 (KRW, USD 등)';
COMMENT ON COLUMN hk_payments.payment_details IS '결제 수단별 상세 정보 JSON';
COMMENT ON COLUMN hk_payments.failure_reason IS '결제 실패 사유';
COMMENT ON COLUMN hk_payments.created_at IS '결제 요청일시';
COMMENT ON COLUMN hk_payments.processed_at IS '결제 처리 완료일시';
COMMENT ON COLUMN hk_payments.failed_at IS '결제 실패일시';

-- =========================================
-- 5. 리뷰 및 평점 시스템
-- =========================================

-- 상품 리뷰 테이블
CREATE TABLE hk_product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES hk_order_items(id), -- 구매한 상품에 대한 리뷰
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5점
    title VARCHAR(200),
    content TEXT NOT NULL,
    
    -- 리뷰 이미지
    image_urls TEXT[],
    
    -- 추천 여부
    is_recommended BOOLEAN DEFAULT TRUE,
    
    -- 관리자 검토
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES hk_users(id),
    
    -- 도움이 된 리뷰 투표
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_reviews IS '상품 리뷰 및 평점';
COMMENT ON COLUMN hk_product_reviews.id IS '리뷰 고유 식별자';
COMMENT ON COLUMN hk_product_reviews.product_id IS '상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_product_reviews.order_item_id IS '구매 확인용 주문 아이템 ID (hk_order_items.id 참조)';
COMMENT ON COLUMN hk_product_reviews.user_id IS '리뷰 작성자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_product_reviews.rating IS '상품 평점 (1-5점)';
COMMENT ON COLUMN hk_product_reviews.title IS '리뷰 제목';
COMMENT ON COLUMN hk_product_reviews.content IS '리뷰 내용';
COMMENT ON COLUMN hk_product_reviews.image_urls IS '리뷰 첨부 이미지 URL 배열';
COMMENT ON COLUMN hk_product_reviews.is_recommended IS '상품 추천 여부';
COMMENT ON COLUMN hk_product_reviews.is_approved IS '관리자 승인 여부';
COMMENT ON COLUMN hk_product_reviews.approved_at IS '리뷰 승인일시';
COMMENT ON COLUMN hk_product_reviews.approved_by IS '리뷰 승인한 관리자 ID';
COMMENT ON COLUMN hk_product_reviews.helpful_count IS '도움이 됨 투표수';
COMMENT ON COLUMN hk_product_reviews.not_helpful_count IS '도움이 안됨 투표수';
COMMENT ON COLUMN hk_product_reviews.created_at IS '리뷰 작성일시';
COMMENT ON COLUMN hk_product_reviews.updated_at IS '리뷰 수정일시';

-- 리뷰 도움됨 투표 테이블
CREATE TABLE hk_review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES hk_product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL, -- true: 도움됨, false: 도움안됨
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);
COMMENT ON TABLE hk_review_votes IS '리뷰 도움됨 투표';
COMMENT ON COLUMN hk_review_votes.id IS '투표 고유 식별자';
COMMENT ON COLUMN hk_review_votes.review_id IS '리뷰 ID (hk_product_reviews.id 참조)';
COMMENT ON COLUMN hk_review_votes.user_id IS '투표한 사용자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_review_votes.is_helpful IS '도움됨 여부 (true: 도움됨, false: 도움안됨)';
COMMENT ON COLUMN hk_review_votes.created_at IS '투표일시';

-- =========================================
-- 6. 쿠폰 및 할인 시스템
-- =========================================

-- 쿠폰 테이블
CREATE TABLE hk_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 할인 타입
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(12,2) NOT NULL, -- 할인율(%) 또는 할인금액
    
    -- 사용 조건
    minimum_order_amount DECIMAL(12,2) DEFAULT 0, -- 최소 주문 금액
    maximum_discount_amount DECIMAL(12,2), -- 최대 할인 금액 (퍼센트 할인시)
    
    -- 사용 제한
    usage_limit INTEGER, -- 전체 사용 제한
    usage_limit_per_user INTEGER DEFAULT 1, -- 사용자당 사용 제한
    used_count INTEGER DEFAULT 0, -- 사용된 횟수
    
    -- 유효 기간
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- 적용 범위
    applicable_categories UUID[] DEFAULT ARRAY[]::UUID[], -- 적용 가능 카테고리
    applicable_products UUID[] DEFAULT ARRAY[]::UUID[], -- 적용 가능 상품
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_coupons IS '쿠폰 및 할인코드';
COMMENT ON COLUMN hk_coupons.id IS '쿠폰 고유 식별자';
COMMENT ON COLUMN hk_coupons.code IS '쿠폰 코드 (사용자 입력용)';
COMMENT ON COLUMN hk_coupons.name IS '쿠폰 이름';
COMMENT ON COLUMN hk_coupons.description IS '쿠폰 설명';
COMMENT ON COLUMN hk_coupons.discount_type IS '할인 타입 (percentage: 퍼센트, fixed_amount: 정액)';
COMMENT ON COLUMN hk_coupons.discount_value IS '할인 값 (퍼센트 또는 금액)';
COMMENT ON COLUMN hk_coupons.minimum_order_amount IS '쿠폰 사용 최소 주문 금액';
COMMENT ON COLUMN hk_coupons.maximum_discount_amount IS '최대 할인 금액 (퍼센트 할인시 제한)';
COMMENT ON COLUMN hk_coupons.usage_limit IS '전체 사용 제한 횟수';
COMMENT ON COLUMN hk_coupons.usage_limit_per_user IS '사용자당 사용 제한 횟수';
COMMENT ON COLUMN hk_coupons.used_count IS '현재까지 사용된 횟수';
COMMENT ON COLUMN hk_coupons.valid_from IS '쿠폰 유효 시작일시';
COMMENT ON COLUMN hk_coupons.valid_until IS '쿠폰 유효 종료일시';
COMMENT ON COLUMN hk_coupons.applicable_categories IS '적용 가능한 카테고리 ID 배열';
COMMENT ON COLUMN hk_coupons.applicable_products IS '적용 가능한 상품 ID 배열';
COMMENT ON COLUMN hk_coupons.is_active IS '쿠폰 활성화 여부';
COMMENT ON COLUMN hk_coupons.created_at IS '쿠폰 생성일시';
COMMENT ON COLUMN hk_coupons.updated_at IS '쿠폰 수정일시';

-- 사용자 쿠폰 사용 내역
CREATE TABLE hk_user_coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES hk_coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES hk_orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(12,2) NOT NULL, -- 실제 할인된 금액
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_user_coupon_usage IS '사용자 쿠폰 사용 내역';
COMMENT ON COLUMN hk_user_coupon_usage.id IS '쿠폰 사용 내역 고유 식별자';
COMMENT ON COLUMN hk_user_coupon_usage.user_id IS '쿠폰 사용자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_user_coupon_usage.coupon_id IS '사용된 쿠폰 ID (hk_coupons.id 참조)';
COMMENT ON COLUMN hk_user_coupon_usage.order_id IS '쿠폰이 사용된 주문 ID (hk_orders.id 참조)';
COMMENT ON COLUMN hk_user_coupon_usage.discount_amount IS '실제 할인된 금액';
COMMENT ON COLUMN hk_user_coupon_usage.used_at IS '쿠폰 사용일시';

-- =========================================
-- 7. 검색 및 통계 지원 테이블
-- =========================================

-- 검색 로그 테이블 (검색 분석용)
CREATE TABLE hk_search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES hk_users(id),
    session_id VARCHAR(255),
    search_query VARCHAR(255) NOT NULL,
    search_filters JSONB, -- 적용된 필터 정보
    results_count INTEGER,
    clicked_product_id UUID REFERENCES hk_products(id), -- 클릭한 상품
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_search_logs IS '검색 로그 (분석용)';
COMMENT ON COLUMN hk_search_logs.id IS '검색 로그 고유 식별자';
COMMENT ON COLUMN hk_search_logs.user_id IS '검색한 사용자 ID (로그인 사용자, hk_users.id 참조)';
COMMENT ON COLUMN hk_search_logs.session_id IS '세션 ID (비회원 사용자)';
COMMENT ON COLUMN hk_search_logs.search_query IS '검색 키워드';
COMMENT ON COLUMN hk_search_logs.search_filters IS '검색시 적용된 필터 정보 JSON';
COMMENT ON COLUMN hk_search_logs.results_count IS '검색 결과 개수';
COMMENT ON COLUMN hk_search_logs.clicked_product_id IS '클릭한 상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_search_logs.created_at IS '검색일시';

-- 상품 조회 로그 테이블 (인기 상품 분석용)
CREATE TABLE hk_product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES hk_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES hk_users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_product_views IS '상품 조회 로그 (인기도 분석용)';
COMMENT ON COLUMN hk_product_views.id IS '상품 조회 로그 고유 식별자';
COMMENT ON COLUMN hk_product_views.product_id IS '조회된 상품 ID (hk_products.id 참조)';
COMMENT ON COLUMN hk_product_views.user_id IS '조회한 사용자 ID (로그인 사용자, hk_users.id 참조)';
COMMENT ON COLUMN hk_product_views.session_id IS '세션 ID (비회원 사용자)';
COMMENT ON COLUMN hk_product_views.ip_address IS '접속 IP 주소';
COMMENT ON COLUMN hk_product_views.user_agent IS '사용자 브라우저 정보';
COMMENT ON COLUMN hk_product_views.referrer_url IS '유입 경로 URL';
COMMENT ON COLUMN hk_product_views.created_at IS '상품 조회일시';

-- =========================================
-- 8. 관리자 및 운영 지원 테이블
-- =========================================

-- 관리자 사용자 테이블
CREATE TABLE hk_admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hk_users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
    permissions JSONB DEFAULT '[]'::JSONB, -- 세부 권한 배열
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES hk_admin_users(id)
);
COMMENT ON TABLE hk_admin_users IS '관리자 계정';
COMMENT ON COLUMN hk_admin_users.id IS '관리자 계정 고유 식별자';
COMMENT ON COLUMN hk_admin_users.user_id IS '사용자 ID (hk_users.id 참조)';
COMMENT ON COLUMN hk_admin_users.role IS '관리자 역할 (super_admin, admin, moderator 등)';
COMMENT ON COLUMN hk_admin_users.permissions IS '관리자 세부 권한 정보 JSON';
COMMENT ON COLUMN hk_admin_users.is_active IS '관리자 계정 활성화 여부';
COMMENT ON COLUMN hk_admin_users.created_at IS '관리자 계정 생성일시';
COMMENT ON COLUMN hk_admin_users.created_by IS '관리자 계정을 생성한 관리자 ID';

-- 시스템 설정 테이블
CREATE TABLE hk_system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- 프론트엔드에서 접근 가능 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES hk_admin_users(id)
);
COMMENT ON TABLE hk_system_settings IS '시스템 설정 관리';
COMMENT ON COLUMN hk_system_settings.id IS '시스템 설정 고유 식별자';
COMMENT ON COLUMN hk_system_settings.setting_key IS '설정 키 (고유값)';
COMMENT ON COLUMN hk_system_settings.setting_value IS '설정 값';
COMMENT ON COLUMN hk_system_settings.setting_type IS '설정 값 타입 (string, number, boolean, json)';
COMMENT ON COLUMN hk_system_settings.description IS '설정 설명';
COMMENT ON COLUMN hk_system_settings.is_public IS '프론트엔드 접근 가능 여부';
COMMENT ON COLUMN hk_system_settings.created_at IS '설정 생성일시';
COMMENT ON COLUMN hk_system_settings.updated_at IS '설정 수정일시';
COMMENT ON COLUMN hk_system_settings.updated_by IS '설정을 수정한 관리자 ID';

-- =========================================
-- 9. 성능 최적화 인덱스
-- =========================================

-- 사용자 관련 인덱스 (Supabase auth.users 기반)
-- 이메일, 소셜 로그인 인덱스는 auth.users, auth.identities에 이미 존재
CREATE INDEX idx_hk_users_created ON hk_users(created_at);
CREATE INDEX idx_hk_user_addresses_user_default ON hk_user_addresses(user_id, is_default);

-- 상품 관련 인덱스 (검색 및 필터링 최적화)
CREATE INDEX idx_hk_products_category_active ON hk_products(category_id, is_active);
CREATE INDEX idx_hk_products_brand_active ON hk_products(brand_id, is_active);
CREATE INDEX idx_hk_products_featured ON hk_products(is_featured, is_active);
CREATE INDEX idx_hk_products_new ON hk_products(is_new, is_active);
CREATE INDEX idx_hk_products_bestseller ON hk_products(is_bestseller, is_active);
CREATE INDEX idx_hk_products_price_range ON hk_products(sale_price, is_active) WHERE sale_price IS NOT NULL;
CREATE INDEX idx_hk_products_base_price_range ON hk_products(base_price, is_active);
CREATE INDEX idx_hk_products_created_desc ON hk_products(created_at DESC) WHERE is_active = TRUE;

-- 검색 최적화 (GIN 인덱스)
CREATE INDEX idx_hk_products_search_keywords ON hk_products USING GIN(search_keywords);
CREATE INDEX idx_hk_products_materials ON hk_products USING GIN(materials);

-- 전문검색을 위한 IMMUTABLE 함수 생성
CREATE OR REPLACE FUNCTION immutable_to_tsvector_english(text)
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', $1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 전문검색 인덱스 (제품명, 설명) - IMMUTABLE 함수 사용
CREATE INDEX idx_hk_products_name_search ON hk_products USING GIN(immutable_to_tsvector_english(name));
CREATE INDEX idx_hk_products_desc_search ON hk_products USING GIN(immutable_to_tsvector_english(short_description));

-- 카테고리 관련 인덱스
CREATE INDEX idx_hk_categories_parent_active ON hk_categories(parent_category_id, is_active);
CREATE INDEX idx_hk_categories_slug ON hk_categories(slug) WHERE is_active = TRUE;

-- 재고 관리 인덱스
CREATE INDEX idx_hk_variants_product_active ON hk_product_variants(product_id, is_active);
CREATE INDEX idx_hk_variants_sku ON hk_product_variants(variant_sku);
CREATE INDEX idx_hk_variants_low_stock ON hk_product_variants(stock_quantity, low_stock_threshold) 
    WHERE is_active = TRUE AND stock_quantity <= low_stock_threshold;

-- 장바구니 관련 인덱스
CREATE INDEX idx_hk_cart_user_created ON hk_cart_items(user_id, created_at);
CREATE INDEX idx_hk_cart_session_created ON hk_cart_items(session_id, created_at);
CREATE INDEX idx_hk_wishlists_user_created ON hk_wishlists(user_id, created_at);

-- 주문 관련 인덱스
CREATE INDEX idx_hk_orders_user_created ON hk_orders(user_id, created_at);
CREATE INDEX idx_hk_orders_status_created ON hk_orders(status, created_at);
CREATE INDEX idx_hk_orders_number ON hk_orders(order_number);
CREATE INDEX idx_hk_order_items_order ON hk_order_items(order_id);
CREATE INDEX idx_hk_order_items_product ON hk_order_items(product_id);

-- 결제 관련 인덱스
CREATE INDEX idx_hk_payments_order ON hk_payments(order_id);
CREATE INDEX idx_hk_payments_status_created ON hk_payments(status, created_at);
CREATE INDEX idx_hk_payments_provider_id ON hk_payments(provider_payment_id);

-- 리뷰 관련 인덱스
CREATE INDEX idx_hk_reviews_product_approved ON hk_product_reviews(product_id, is_approved, created_at);
CREATE INDEX idx_hk_reviews_user_created ON hk_product_reviews(user_id, created_at);
CREATE INDEX idx_hk_reviews_rating ON hk_product_reviews(product_id, rating) WHERE is_approved = TRUE;

-- 분석용 인덱스
CREATE INDEX idx_hk_search_logs_query_created ON hk_search_logs(search_query, created_at);
CREATE INDEX idx_hk_search_logs_user_created ON hk_search_logs(user_id, created_at);
CREATE INDEX idx_hk_product_views_product_created ON hk_product_views(product_id, created_at);
-- 날짜 변환을 위한 IMMUTABLE 함수 생성
CREATE OR REPLACE FUNCTION immutable_date(timestamp with time zone)
RETURNS date AS $$
BEGIN
    RETURN DATE($1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE INDEX idx_hk_product_views_daily_stats ON hk_product_views(product_id, immutable_date(created_at));

-- =========================================
-- 10. 데이터 무결성 제약조건
-- =========================================

-- 사용자당 기본 주소는 하나만
CREATE UNIQUE INDEX idx_hk_user_addresses_unique_default 
ON hk_user_addresses(user_id) WHERE is_default = TRUE;

-- 상품당 대표 이미지는 하나만
CREATE UNIQUE INDEX idx_hk_product_images_unique_primary 
ON hk_product_images(product_id) WHERE is_primary = TRUE;

-- 주문 아이템의 총 가격 검증
ALTER TABLE hk_order_items ADD CONSTRAINT chk_order_items_total_price 
CHECK (total_price = unit_price * quantity);

-- 결제 금액이 주문 금액과 일치하는지 검증 (트리거로 구현 필요)
-- 쿠폰 사용 제한 검증 (트리거로 구현 필요)

-- =========================================
-- 관리자 권한 제약조건 추가
-- =========================================

-- 관리자 역할 제한
ALTER TABLE hk_admin_users ADD CONSTRAINT chk_admin_role 
CHECK (role IN ('super_admin', 'admin', 'moderator', 'content_manager', 'customer_service'));

-- 상품 관리 권한 기록을 위한 컬럼 추가
ALTER TABLE hk_products ADD COLUMN created_by UUID REFERENCES hk_admin_users(id);
ALTER TABLE hk_products ADD COLUMN updated_by UUID REFERENCES hk_admin_users(id);

ALTER TABLE hk_categories ADD COLUMN created_by UUID REFERENCES hk_admin_users(id);
ALTER TABLE hk_categories ADD COLUMN updated_by UUID REFERENCES hk_admin_users(id);

ALTER TABLE hk_brands ADD COLUMN created_by UUID REFERENCES hk_admin_users(id);
ALTER TABLE hk_brands ADD COLUMN updated_by UUID REFERENCES hk_admin_users(id);

-- 추가된 관리자 권한 컬럼 description
COMMENT ON COLUMN hk_products.created_by IS '상품을 생성한 관리자 ID (hk_admin_users.id 참조)';
COMMENT ON COLUMN hk_products.updated_by IS '상품을 마지막으로 수정한 관리자 ID (hk_admin_users.id 참조)';

COMMENT ON COLUMN hk_categories.created_by IS '카테고리를 생성한 관리자 ID (hk_admin_users.id 참조)';
COMMENT ON COLUMN hk_categories.updated_by IS '카테고리를 마지막으로 수정한 관리자 ID (hk_admin_users.id 참조)';

COMMENT ON COLUMN hk_brands.created_by IS '브랜드를 생성한 관리자 ID (hk_admin_users.id 참조)';
COMMENT ON COLUMN hk_brands.updated_by IS '브랜드를 마지막으로 수정한 관리자 ID (hk_admin_users.id 참조)';

-- 관리자 활동 로그 테이블 (권장)
CREATE TABLE hk_admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES hk_admin_users(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'approve', etc.
    target_table VARCHAR(50) NOT NULL, -- 'hk_products', 'hk_orders', etc.
    target_id UUID, -- 대상 레코드 ID
    old_values JSONB, -- 변경 전 값
    new_values JSONB, -- 변경 후 값
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE hk_admin_activity_logs IS '관리자 활동 로그 (감사 목적)';
COMMENT ON COLUMN hk_admin_activity_logs.id IS '활동 로그 고유 식별자';
COMMENT ON COLUMN hk_admin_activity_logs.admin_id IS '작업을 수행한 관리자 ID (hk_admin_users.id 참조)';
COMMENT ON COLUMN hk_admin_activity_logs.action IS '수행한 작업 유형 (create, update, delete, approve 등)';
COMMENT ON COLUMN hk_admin_activity_logs.target_table IS '작업 대상 테이블명 (hk_products, hk_orders 등)';
COMMENT ON COLUMN hk_admin_activity_logs.target_id IS '작업 대상 레코드의 고유 식별자';
COMMENT ON COLUMN hk_admin_activity_logs.old_values IS '변경 전 값 JSON';
COMMENT ON COLUMN hk_admin_activity_logs.new_values IS '변경 후 값 JSON';
COMMENT ON COLUMN hk_admin_activity_logs.ip_address IS '작업 수행 시 IP 주소';
COMMENT ON COLUMN hk_admin_activity_logs.user_agent IS '작업 수행 시 브라우저 정보';
COMMENT ON COLUMN hk_admin_activity_logs.created_at IS '활동 수행일시';

-- 관리자 활동 로그 인덱스
CREATE INDEX idx_hk_admin_logs_admin_created ON hk_admin_activity_logs(admin_id, created_at);
CREATE INDEX idx_hk_admin_logs_target ON hk_admin_activity_logs(target_table, target_id);
CREATE INDEX idx_hk_admin_logs_action_created ON hk_admin_activity_logs(action, created_at);

-- =========================================
-- 관리자 권한 기반 RLS 정책 추가 (관리자 테이블 생성 후)
-- =========================================

-- 상품 관리 정책 추가
CREATE POLICY "Only admins can create products" ON hk_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM hk_admin_users a 
            WHERE a.user_id = auth.uid() 
            AND a.is_active = TRUE
            AND (
                a.role = 'super_admin' 
                OR (a.permissions::jsonb ? 'products' AND a.permissions::jsonb->'products' @> '"create"')
            )
        )
    );

CREATE POLICY "Only admins can update products" ON hk_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM hk_admin_users a 
            WHERE a.user_id = auth.uid() 
            AND a.is_active = TRUE
            AND (
                a.role = 'super_admin' 
                OR (a.permissions::jsonb ? 'products' AND a.permissions::jsonb->'products' @> '"update"')
            )
        )
    );

CREATE POLICY "Only admins can delete products" ON hk_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM hk_admin_users a 
            WHERE a.user_id = auth.uid() 
            AND a.is_active = TRUE
            AND (
                a.role = 'super_admin' 
                OR (a.permissions::jsonb ? 'products' AND a.permissions::jsonb->'products' @> '"delete"')
            )
        )
    );

-- 주문 관리 정책 수정 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view their own orders" ON hk_orders;

CREATE POLICY "Users and admins can view orders" ON hk_orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM hk_admin_users a 
            WHERE a.user_id = auth.uid() AND a.is_active = TRUE
        )
    );

CREATE POLICY "Admins can update orders" ON hk_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM hk_admin_users a 
            WHERE a.user_id = auth.uid() AND a.is_active = TRUE
        )
    );

-- =========================================
-- 11. 기본 데이터 삽입
-- =========================================

-- 기본 카테고리 생성 (README.md 기준)
INSERT INTO hk_categories (name, slug, description, sort_order) VALUES 
('Dining', 'dining', '식당가구 카테고리', 1),
('Living', 'living', '거실가구 카테고리', 2),
('Bedroom', 'bedroom', '침실가구 카테고리', 3);

-- 시스템 기본 설정
INSERT INTO hk_system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', '홍케아 가구', 'string', '사이트 이름', true),
('default_currency', 'KRW', 'string', '기본 통화', true),
('free_shipping_threshold', '100000', 'number', '무료배송 최소 주문금액', true),
('default_shipping_fee', '3000', 'number', '기본 배송비', true),
('low_stock_threshold', '5', 'number', '재고 부족 임계값', false),
('order_number_prefix', 'HK', 'string', '주문번호 접두어', false);

-- 기본 관리자 권한 템플릿 (JSON 형태로 저장)
INSERT INTO hk_system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('admin_permissions_super_admin', '{"products":["create","read","update","delete"],"categories":["create","read","update","delete"],"brands":["create","read","update","delete"],"orders":["read","update","cancel"],"users":["read","update","suspend"],"reviews":["read","approve","delete"],"coupons":["create","read","update","delete"],"analytics":["read","export"],"settings":["read","update"],"admin_management":["create","read","update","delete"]}', 'json', '최고 관리자 권한', false),
('admin_permissions_admin', '{"products":["create","read","update"],"categories":["create","read","update"],"brands":["create","read","update"],"orders":["read","update"],"users":["read"],"reviews":["read","approve"],"coupons":["create","read","update"],"analytics":["read"]}', 'json', '일반 관리자 권한', false),
('admin_permissions_moderator', '{"products":["read"],"orders":["read","update"],"users":["read"],"reviews":["read","approve","delete"],"analytics":["read"]}', 'json', '모더레이터 권한', false),
('admin_permissions_content_manager', '{"products":["create","read","update"],"categories":["read","update"],"brands":["read","update"],"reviews":["read","approve"]}', 'json', '콘텐츠 관리자 권한', false),
('admin_permissions_customer_service', '{"orders":["read","update"],"users":["read"],"reviews":["read"],"coupons":["read"]}', 'json', '고객서비스 권한', false);

-- =========================================
-- 12. 유용한 뷰 생성
-- =========================================

-- 상품 요약 정보 뷰 (평점, 리뷰수, 재고 포함)
CREATE VIEW vw_hk_products_summary AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    b.name as brand_name,
    COALESCE(r.avg_rating, 0) as avg_rating,
    COALESCE(r.review_count, 0) as review_count,
    COALESCE(s.total_stock, 0) as total_stock,
    COALESCE(s.variant_count, 0) as variant_count,
    pi.image_url as primary_image_url
FROM hk_products p
LEFT JOIN hk_categories c ON p.category_id = c.id
LEFT JOIN hk_brands b ON p.brand_id = b.id
LEFT JOIN (
    SELECT 
        product_id,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(*) as review_count
    FROM hk_product_reviews 
    WHERE is_approved = TRUE 
    GROUP BY product_id
) r ON p.id = r.product_id
LEFT JOIN (
    SELECT 
        product_id,
        SUM(stock_quantity) as total_stock,
        COUNT(*) as variant_count
    FROM hk_product_variants 
    WHERE is_active = TRUE 
    GROUP BY product_id
) s ON p.id = s.product_id
LEFT JOIN hk_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE;

COMMENT ON VIEW vw_hk_products_summary IS '상품 요약 정보 뷰 (평점, 재고, 이미지 포함)';

-- 주문 통계 뷰
CREATE VIEW vw_hk_order_statistics AS
SELECT 
    immutable_date(created_at) as order_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
FROM hk_orders
GROUP BY immutable_date(created_at)
ORDER BY order_date DESC;

COMMENT ON VIEW vw_hk_order_statistics IS '일별 주문 통계 뷰';

-- =========================================
-- 13. 자동 updated_at 트리거 설정
-- =========================================

-- updated_at 자동 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS 'UPDATE 시 updated_at 컬럼을 현재 시간으로 자동 갱신';

-- 각 테이블에 updated_at 자동 갱신 트리거 적용
CREATE TRIGGER update_hk_users_updated_at
    BEFORE UPDATE ON hk_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_user_addresses_updated_at
    BEFORE UPDATE ON hk_user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_categories_updated_at
    BEFORE UPDATE ON hk_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_brands_updated_at
    BEFORE UPDATE ON hk_brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_products_updated_at
    BEFORE UPDATE ON hk_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_product_variants_updated_at
    BEFORE UPDATE ON hk_product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_cart_items_updated_at
    BEFORE UPDATE ON hk_cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_orders_updated_at
    BEFORE UPDATE ON hk_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_product_reviews_updated_at
    BEFORE UPDATE ON hk_product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_coupons_updated_at
    BEFORE UPDATE ON hk_coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_system_settings_updated_at
    BEFORE UPDATE ON hk_system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 스키마 생성 완료
-- =========================================

-- 스키마 버전 정보
INSERT INTO hk_system_settings (setting_key, setting_value, setting_type, description) VALUES
('schema_version', '1.0.1', 'string', '데이터베이스 스키마 버전 (updated_at 자동 갱신 트리거 추가)');

COMMENT ON SCHEMA public IS '가구 전문 이커머스 데이터베이스 스키마 v1.0.1';