-- =========================================
-- 프로젝트 데이터 완전 삭제 스크립트 (구조 유지)
-- 프로젝트: st-hongkea (가구 쇼핑몰)
-- 경고: 이 스크립트는 프로젝트 관련 모든 데이터를 영구 삭제합니다! (테이블 구조는 유지)
-- 파일명: truncate-all-project-data.sql
-- =========================================

-- ⚠️ 중요 경고: 이 스크립트 실행 후 데이터 복구는 불가능합니다!
-- 실행 전에 반드시 백업을 진행하세요.

-- 실행 전 확인 메시지
DO $$
BEGIN
    RAISE EXCEPTION '⚠️ 경고: 프로젝트의 모든 데이터가 영구 삭제됩니다! 이 주석을 제거하고 실행하세요.';
END $$;

-- 위의 DO 블록을 주석처리하고 아래 스크립트를 실행하세요.

-- =========================================
-- 1. 실제 데이터 삭제 (테이블별)
-- =========================================

-- 관리자 활동 로그 데이터 삭제
TRUNCATE TABLE hk_admin_activity_logs CASCADE;
RAISE NOTICE '관리자 활동 로그 데이터 삭제 완료';

-- 쿠폰 사용 내역 삭제
TRUNCATE TABLE hk_user_coupon_usage CASCADE;
RAISE NOTICE '쿠폰 사용 내역 삭제 완료';

-- 리뷰 투표 삭제
TRUNCATE TABLE hk_review_votes CASCADE;
RAISE NOTICE '리뷰 투표 데이터 삭제 완료';

-- 상품 리뷰 삭제
TRUNCATE TABLE hk_product_reviews CASCADE;
RAISE NOTICE '상품 리뷰 데이터 삭제 완료';

-- 결제 정보 삭제
TRUNCATE TABLE hk_payments CASCADE;
RAISE NOTICE '결제 정보 삭제 완료';

-- 주문 상품 상세 삭제
TRUNCATE TABLE hk_order_items CASCADE;
RAISE NOTICE '주문 상품 상세 정보 삭제 완료';

-- 주문 정보 삭제
TRUNCATE TABLE hk_orders CASCADE;
RAISE NOTICE '주문 정보 삭제 완료';

-- 위시리스트 삭제
TRUNCATE TABLE hk_wishlists CASCADE;
RAISE NOTICE '위시리스트 데이터 삭제 완료';

-- 장바구니 아이템 삭제
TRUNCATE TABLE hk_cart_items CASCADE;
RAISE NOTICE '장바구니 데이터 삭제 완료';

-- 상품 재고 정보 삭제
TRUNCATE TABLE hk_product_variants CASCADE;
RAISE NOTICE '상품 재고 정보 삭제 완료';

-- 상품 옵션 값 삭제
TRUNCATE TABLE hk_product_option_values CASCADE;
RAISE NOTICE '상품 옵션 값 삭제 완료';

-- 상품 옵션 그룹 삭제
TRUNCATE TABLE hk_product_option_groups CASCADE;
RAISE NOTICE '상품 옵션 그룹 삭제 완료';

-- 상품 이미지 삭제
TRUNCATE TABLE hk_product_images CASCADE;
RAISE NOTICE '상품 이미지 삭제 완료';

-- 상품 정보 삭제
TRUNCATE TABLE hk_products CASCADE;
RAISE NOTICE '상품 정보 삭제 완료';

-- 브랜드 정보 삭제
TRUNCATE TABLE hk_brands CASCADE;
RAISE NOTICE '브랜드 정보 삭제 완료';

-- 카테고리 정보 삭제
TRUNCATE TABLE hk_categories CASCADE;
RAISE NOTICE '카테고리 정보 삭제 완료';

-- 사용자 주소 정보 삭제
TRUNCATE TABLE hk_user_addresses CASCADE;
RAISE NOTICE '사용자 주소 정보 삭제 완료';

-- 상품 조회 로그 삭제
TRUNCATE TABLE hk_product_views CASCADE;
RAISE NOTICE '상품 조회 로그 삭제 완료';

-- 검색 로그 삭제
TRUNCATE TABLE hk_search_logs CASCADE;
RAISE NOTICE '검색 로그 삭제 완료';

-- 쿠폰 정보 삭제
TRUNCATE TABLE hk_coupons CASCADE;
RAISE NOTICE '쿠폰 정보 삭제 완료';

-- 시스템 설정 삭제 (프로젝트 관련만)
DELETE FROM hk_system_settings WHERE setting_key LIKE 'admin_permissions_%';
DELETE FROM hk_system_settings WHERE setting_key IN (
    'site_name', 'default_currency', 'free_shipping_threshold', 
    'default_shipping_fee', 'low_stock_threshold', 'order_number_prefix',
    'maintenance_mode', 'max_cart_items', 'review_auto_approve',
    'product_images_max', 'order_cancel_hours', 'schema_version'
);
RAISE NOTICE '프로젝트 관련 시스템 설정 삭제 완료';

-- 관리자 사용자 정보 삭제
TRUNCATE TABLE hk_admin_users CASCADE;
RAISE NOTICE '관리자 사용자 정보 삭제 완료';

-- 사용자 프로필 정보 삭제 (Supabase auth.users는 유지)
TRUNCATE TABLE hk_users CASCADE;
RAISE NOTICE '사용자 프로필 정보 삭제 완료';

-- =========================================
-- 2. 시퀀스 초기화 (ID 카운터 리셋)
-- =========================================

-- UUID 기반이므로 시퀀스 초기화는 불필요하지만, 
-- 혹시 AUTO INCREMENT가 있는 경우를 대비

-- 예시: ALTER SEQUENCE table_id_seq RESTART WITH 1;

-- =========================================
-- 3. 통계 정보 업데이트
-- =========================================

-- PostgreSQL 통계 정보 업데이트
ANALYZE;
RAISE NOTICE '데이터베이스 통계 정보 업데이트 완료';

-- =========================================
-- 4. 삭제 완료 확인
-- =========================================

DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
    total_rows INTEGER := 0;
BEGIN
    RAISE NOTICE '=== 데이터 삭제 완료 확인 ===';
    
    -- 주요 테이블들의 행 개수 확인
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'hk_%'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.table_name) INTO row_count;
        total_rows := total_rows + row_count;
        
        IF row_count > 0 THEN
            RAISE NOTICE '테이블 %: % 행 남음', table_record.table_name, row_count;
        ELSE
            RAISE NOTICE '테이블 %: 완전 삭제됨', table_record.table_name;
        END IF;
    END LOOP;
    
    IF total_rows = 0 THEN
        RAISE NOTICE '🎉 모든 프로젝트 데이터가 성공적으로 삭제되었습니다!';
    ELSE
        RAISE NOTICE '⚠️ 총 % 행의 데이터가 남아있습니다.', total_rows;
    END IF;
    
    RAISE NOTICE '=== 삭제 작업 완료 ===';
END $$;

-- =========================================
-- 5. 선택사항: 기본 데이터 재생성
-- =========================================

-- 기본 데이터를 다시 생성하려면 아래 주석을 해제하세요
-- (기본 카테고리, 시스템 설정 등)

/*
-- 기본 카테고리 재생성
INSERT INTO hk_categories (name, slug, description, sort_order) VALUES 
('Dining', 'dining', '식당가구 카테고리', 1),
('Living', 'living', '거실가구 카테고리', 2),
('Bedroom', 'bedroom', '침실가구 카테고리', 3);

-- 기본 시스템 설정 재생성
INSERT INTO hk_system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', '홍케아 가구', 'string', '사이트 이름', true),
('default_currency', 'KRW', 'string', '기본 통화', true),
('free_shipping_threshold', '100000', 'number', '무료배송 최소 주문금액', true),
('default_shipping_fee', '3000', 'number', '기본 배송비', true),
('low_stock_threshold', '5', 'number', '재고 부족 임계값', false),
('order_number_prefix', 'HK', 'string', '주문번호 접두어', false),
('schema_version', '1.0.0', 'string', '데이터베이스 스키마 버전', false);

RAISE NOTICE '기본 데이터 재생성 완료';
*/

-- =========================================
-- 데이터 삭제 완료
-- =========================================

RAISE NOTICE '프로젝트 데이터 삭제 스크립트 실행 완료';
RAISE NOTICE '필요시 database/init-sample-data.sql을 실행하여 샘플 데이터를 다시 생성할 수 있습니다.';
RAISE NOTICE '테이블 구조까지 삭제하려면 database/drop-all-project-schema.sql을 사용하세요.';