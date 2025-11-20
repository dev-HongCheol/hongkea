-- =========================================
-- 프로젝트 스키마 완전 삭제 스크립트
-- 프로젝트: st-hongkea (가구 쇼핑몰)
-- ⚠️ 경고: 프로젝트 관련 모든 구조(테이블, 뷰, 인덱스, 함수 등)를 영구 삭제합니다!
-- 파일명: drop-all-project-schema.sql
-- =========================================

-- ⚠️ 중요 경고: 이 스크립트 실행 후 복구는 불가능합니다!
-- 실행 전에 반드시 백업을 진행하세요.

-- 실행 전 안전장치
DO $$
BEGIN
    RAISE EXCEPTION '⚠️ 경고: 프로젝트의 모든 구조가 영구 삭제됩니다! 이 DO 블록을 주석처리하고 실행하세요.';
END $$;

-- 위의 DO 블록을 주석처리하고 아래 스크립트를 실행하세요.

RAISE NOTICE '프로젝트 완전 삭제 시작...';

-- =========================================
-- 1. 뷰 삭제 (테이블 의존성 때문에 먼저 삭제)
-- =========================================

DROP VIEW IF EXISTS vw_hk_order_statistics CASCADE;
DROP VIEW IF EXISTS vw_hk_products_summary CASCADE;
DROP VIEW IF EXISTS vw_hk_user_social_accounts CASCADE;
RAISE NOTICE '뷰 삭제 완료';

-- =========================================
-- 2. 트리거 삭제
-- =========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
RAISE NOTICE '트리거 삭제 완료';

-- =========================================
-- 3. 함수 삭제
-- =========================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS immutable_to_tsvector_english(text) CASCADE;
DROP FUNCTION IF EXISTS immutable_date(timestamp with time zone) CASCADE;
RAISE NOTICE '프로젝트 함수 삭제 완료';

-- =========================================
-- 4. RLS 정책 삭제 (테이블 삭제 전)
-- =========================================

-- hk_users 정책
DROP POLICY IF EXISTS "Users can view their own profile" ON hk_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON hk_users;

-- hk_user_addresses 정책
DROP POLICY IF EXISTS "Users can manage their own addresses" ON hk_user_addresses;

-- hk_products 정책
DROP POLICY IF EXISTS "Anyone can view active products" ON hk_products;
DROP POLICY IF EXISTS "Only admins can create products" ON hk_products;
DROP POLICY IF EXISTS "Only admins can update products" ON hk_products;
DROP POLICY IF EXISTS "Only admins can delete products" ON hk_products;

-- hk_cart_items 정책
DROP POLICY IF EXISTS "Users can manage their own cart items" ON hk_cart_items;

-- hk_wishlists 정책
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON hk_wishlists;

-- hk_orders 정책
DROP POLICY IF EXISTS "Users can view their own orders" ON hk_orders;
DROP POLICY IF EXISTS "Users and admins can view orders" ON hk_orders;
DROP POLICY IF EXISTS "Admins can update orders" ON hk_orders;

RAISE NOTICE 'RLS 정책 삭제 완료';

-- =========================================
-- 5. 인덱스 삭제 (테이블별)
-- =========================================

-- 사용자 관련 인덱스
DROP INDEX IF EXISTS idx_hk_users_created;
DROP INDEX IF EXISTS idx_hk_user_addresses_user_default;
DROP INDEX IF EXISTS idx_hk_user_addresses_unique_default;

-- 상품 관련 인덱스
DROP INDEX IF EXISTS idx_hk_products_category_active;
DROP INDEX IF EXISTS idx_hk_products_brand_active;
DROP INDEX IF EXISTS idx_hk_products_featured;
DROP INDEX IF EXISTS idx_hk_products_new;
DROP INDEX IF EXISTS idx_hk_products_bestseller;
DROP INDEX IF EXISTS idx_hk_products_price_range;
DROP INDEX IF EXISTS idx_hk_products_base_price_range;
DROP INDEX IF EXISTS idx_hk_products_created_desc;
DROP INDEX IF EXISTS idx_hk_products_search_keywords;
DROP INDEX IF EXISTS idx_hk_products_materials;
DROP INDEX IF EXISTS idx_hk_products_name_search;
DROP INDEX IF EXISTS idx_hk_products_desc_search;
DROP INDEX IF EXISTS idx_hk_product_images_unique_primary;

-- 카테고리 관련 인덱스
DROP INDEX IF EXISTS idx_hk_categories_parent_active;
DROP INDEX IF EXISTS idx_hk_categories_slug;

-- 재고 관리 인덱스
DROP INDEX IF EXISTS idx_hk_variants_product_active;
DROP INDEX IF EXISTS idx_hk_variants_sku;
DROP INDEX IF EXISTS idx_hk_variants_low_stock;

-- 장바구니 관련 인덱스
DROP INDEX IF EXISTS idx_hk_cart_user_created;
DROP INDEX IF EXISTS idx_hk_cart_session_created;
DROP INDEX IF EXISTS idx_hk_wishlists_user_created;

-- 주문 관련 인덱스
DROP INDEX IF EXISTS idx_hk_orders_user_created;
DROP INDEX IF EXISTS idx_hk_orders_status_created;
DROP INDEX IF EXISTS idx_hk_orders_number;
DROP INDEX IF EXISTS idx_hk_order_items_order;
DROP INDEX IF EXISTS idx_hk_order_items_product;

-- 결제 관련 인덱스
DROP INDEX IF EXISTS idx_hk_payments_order;
DROP INDEX IF EXISTS idx_hk_payments_status_created;
DROP INDEX IF EXISTS idx_hk_payments_provider_id;

-- 리뷰 관련 인덱스
DROP INDEX IF EXISTS idx_hk_reviews_product_approved;
DROP INDEX IF EXISTS idx_hk_reviews_user_created;
DROP INDEX IF EXISTS idx_hk_reviews_rating;

-- 분석용 인덱스
DROP INDEX IF EXISTS idx_hk_search_logs_query_created;
DROP INDEX IF EXISTS idx_hk_search_logs_user_created;
DROP INDEX IF EXISTS idx_hk_product_views_product_created;
DROP INDEX IF EXISTS idx_hk_product_views_daily_stats;

-- 관리자 활동 로그 인덱스
DROP INDEX IF EXISTS idx_hk_admin_logs_admin_created;
DROP INDEX IF EXISTS idx_hk_admin_logs_target;
DROP INDEX IF EXISTS idx_hk_admin_logs_action_created;

RAISE NOTICE '모든 인덱스 삭제 완료';

-- =========================================
-- 6. 제약조건 삭제
-- =========================================

-- 주문 아이템 제약조건
ALTER TABLE IF EXISTS hk_order_items DROP CONSTRAINT IF EXISTS chk_order_items_total_price;

-- 관리자 역할 제약조건
ALTER TABLE IF EXISTS hk_admin_users DROP CONSTRAINT IF EXISTS chk_admin_role;

-- 장바구니 제약조건
ALTER TABLE IF EXISTS hk_cart_items DROP CONSTRAINT IF EXISTS chk_cart_user_or_session;

RAISE NOTICE '제약조건 삭제 완료';

-- =========================================
-- 7. 테이블 삭제 (의존성 순서 고려)
-- =========================================

-- 관리자 활동 로그 (다른 테이블 참조)
DROP TABLE IF EXISTS hk_admin_activity_logs CASCADE;

-- 쿠폰 사용 내역 (사용자, 쿠폰, 주문 참조)
DROP TABLE IF EXISTS hk_user_coupon_usage CASCADE;

-- 리뷰 투표 (리뷰, 사용자 참조)
DROP TABLE IF EXISTS hk_review_votes CASCADE;

-- 리뷰 (상품, 주문아이템, 사용자 참조)
DROP TABLE IF EXISTS hk_product_reviews CASCADE;

-- 결제 정보 (주문 참조)
DROP TABLE IF EXISTS hk_payments CASCADE;

-- 주문 상품 상세 (주문, 상품, 상품옵션 참조)
DROP TABLE IF EXISTS hk_order_items CASCADE;

-- 주문 (사용자 참조)
DROP TABLE IF EXISTS hk_orders CASCADE;

-- 위시리스트 (사용자, 상품 참조)
DROP TABLE IF EXISTS hk_wishlists CASCADE;

-- 장바구니 (사용자, 상품, 상품옵션 참조)
DROP TABLE IF EXISTS hk_cart_items CASCADE;

-- 상품 재고 (상품 참조)
DROP TABLE IF EXISTS hk_product_variants CASCADE;

-- 상품 옵션 값 (옵션그룹 참조)
DROP TABLE IF EXISTS hk_product_option_values CASCADE;

-- 상품 옵션 그룹 (상품 참조)
DROP TABLE IF EXISTS hk_product_option_groups CASCADE;

-- 상품 이미지 (상품 참조)
DROP TABLE IF EXISTS hk_product_images CASCADE;

-- 상품 (카테고리, 브랜드 참조)
DROP TABLE IF EXISTS hk_products CASCADE;

-- 브랜드
DROP TABLE IF EXISTS hk_brands CASCADE;

-- 카테고리 (자기 참조)
DROP TABLE IF EXISTS hk_categories CASCADE;

-- 사용자 주소 (사용자 참조)
DROP TABLE IF EXISTS hk_user_addresses CASCADE;

-- 시스템 설정 (관리자 참조)
DROP TABLE IF EXISTS hk_system_settings CASCADE;

-- 관리자 사용자 (사용자, 자기 참조)
DROP TABLE IF EXISTS hk_admin_users CASCADE;

-- 상품 조회 로그 (사용자, 상품 참조)
DROP TABLE IF EXISTS hk_product_views CASCADE;

-- 검색 로그 (사용자, 상품 참조)
DROP TABLE IF EXISTS hk_search_logs CASCADE;

-- 쿠폰
DROP TABLE IF EXISTS hk_coupons CASCADE;

-- 사용자 프로필 (auth.users 참조)
DROP TABLE IF EXISTS hk_users CASCADE;

RAISE NOTICE '모든 테이블 삭제 완료';

-- =========================================
-- 8. ENUM 타입 삭제
-- =========================================

DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

RAISE NOTICE 'ENUM 타입 삭제 완료';

-- =========================================
-- 9. 확장 모듈 정리 (선택사항 - 다른 프로젝트에서 사용할 수 있음)
-- =========================================

-- DROP EXTENSION IF EXISTS "pgcrypto";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- =========================================
-- 10. 삭제 완료 확인 및 정리
-- =========================================

-- 남은 프로젝트 관련 객체 확인
DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
    type_count INTEGER;
BEGIN
    RAISE NOTICE '=== 삭제 완료 확인 ===';
    
    -- 남은 hk_ 테이블 확인
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'hk_%';
    
    -- 남은 hk_ 뷰 확인
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'vw_hk_%';
    
    -- 남은 프로젝트 함수 확인
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND (routine_name LIKE '%hk%' OR routine_name LIKE 'immutable_%' OR routine_name LIKE 'handle_new_user');
    
    -- 남은 커스텀 타입 확인
    SELECT COUNT(*) INTO type_count
    FROM pg_type 
    WHERE typname IN ('order_status', 'payment_status');
    
    RAISE NOTICE '남은 테이블: %개', table_count;
    RAISE NOTICE '남은 뷰: %개', view_count;
    RAISE NOTICE '남은 함수: %개', function_count;
    RAISE NOTICE '남은 타입: %개', type_count;
    
    IF (table_count + view_count + function_count + type_count) = 0 THEN
        RAISE NOTICE '🎉 프로젝트의 모든 구조가 성공적으로 삭제되었습니다!';
    ELSE
        RAISE NOTICE '⚠️ 일부 객체가 남아있을 수 있습니다. 수동으로 확인해주세요.';
    END IF;
    
    RAISE NOTICE '=== 삭제 작업 완료 ===';
END $$;

-- =========================================
-- 프로젝트 완전 삭제 완료
-- =========================================

RAISE NOTICE '프로젝트 완전 삭제 스크립트 실행 완료';
RAISE NOTICE '새 스키마를 생성하려면 database/db.sql을 실행하세요.';
RAISE NOTICE '샘플 데이터가 필요하면 database/init-sample-data.sql을 실행하세요.';
RAISE NOTICE '데이터만 삭제하려면 database/truncate-all-project-data.sql을 사용하세요.';