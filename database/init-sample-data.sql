-- =========================================
-- 데이터베이스 초기 샘플 데이터 삽입 스크립트
-- 프로젝트: st-hongkea (가구 쇼핑몰)
-- 개발 및 테스트용 샘플 데이터
-- =========================================

-- 주의: 이 스크립트는 db.sql 실행 후에 실행해야 합니다.

-- =========================================
-- 1. 관리자 계정 생성 (개발용)
-- =========================================

-- 개발용 관리자 계정 (실제 auth.users에 해당하는 사용자가 있어야 함)
-- 실제 운영에서는 Supabase Auth를 통해 사용자를 먼저 생성해야 합니다.

-- 예시: 개발용 관리자 권한 설정 (실제 사용자 ID로 교체 필요)
-- INSERT INTO hk_admin_users (user_id, role, permissions, is_active) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'super_admin', 
--  '{"products":["create","read","update","delete"],"categories":["create","read","update","delete"],"brands":["create","read","update","delete"],"orders":["read","update","cancel"],"users":["read","update","suspend"],"reviews":["read","approve","delete"],"coupons":["create","read","update","delete"],"analytics":["read","export"],"settings":["read","update"],"admin_management":["create","read","update","delete"]}', 
--  true);

-- =========================================
-- 2. 추가 카테고리 및 서브카테고리 생성
-- =========================================

-- 기본 카테고리는 db.sql에서 이미 생성됨 (Dining, Living, Bedroom)

-- Dining 서브카테고리
INSERT INTO hk_categories (parent_category_id, name, slug, description, sort_order) VALUES 
((SELECT id FROM hk_categories WHERE slug = 'dining'), 'Dining Tables', 'dining-tables', '식탁 카테고리', 1),
((SELECT id FROM hk_categories WHERE slug = 'dining'), 'Dining Chairs', 'dining-chairs', '식탁 의자 카테고리', 2),
((SELECT id FROM hk_categories WHERE slug = 'dining'), 'Bar Stools', 'bar-stools', '바 스툴 카테고리', 3),
((SELECT id FROM hk_categories WHERE slug = 'dining'), 'Sideboards', 'sideboards', '사이드보드 카테고리', 4);

-- Living 서브카테고리
INSERT INTO hk_categories (parent_category_id, name, slug, description, sort_order) VALUES 
((SELECT id FROM hk_categories WHERE slug = 'living'), 'Sofas', 'sofas', '소파 카테고리', 1),
((SELECT id FROM hk_categories WHERE slug = 'living'), 'Coffee Tables', 'coffee-tables', '커피 테이블 카테고리', 2),
((SELECT id FROM hk_categories WHERE slug = 'living'), 'TV Stands', 'tv-stands', 'TV 스탠드 카테고리', 3),
((SELECT id FROM hk_categories WHERE slug = 'living'), 'Bookshelves', 'bookshelves', '책장 카테고리', 4);

-- Bedroom 서브카테고리
INSERT INTO hk_categories (parent_category_id, name, slug, description, sort_order) VALUES 
((SELECT id FROM hk_categories WHERE slug = 'bedroom'), 'Beds', 'beds', '침대 카테고리', 1),
((SELECT id FROM hk_categories WHERE slug = 'bedroom'), 'Wardrobes', 'wardrobes', '옷장 카테고리', 2),
((SELECT id FROM hk_categories WHERE slug = 'bedroom'), 'Nightstands', 'nightstands', '협탁 카테고리', 3),
((SELECT id FROM hk_categories WHERE slug = 'bedroom'), 'Dressers', 'dressers', '화장대 카테고리', 4);

-- =========================================
-- 3. 브랜드 데이터 생성
-- =========================================

INSERT INTO hk_brands (name, slug, description, logo_url, website_url, is_active) VALUES 
('IKEA', 'ikea', '스웨덴 가구 브랜드', '/brands/ikea-logo.png', 'https://www.ikea.com', true),
('한샘', 'hanssem', '한국 대표 가구 브랜드', '/brands/hanssem-logo.png', 'https://www.hanssem.com', true),
('일룸', 'iloom', '모던 가구 전문 브랜드', '/brands/iloom-logo.png', 'https://www.iloom.co.kr', true),
('리바트', 'livart', '프리미엄 가구 브랜드', '/brands/livart-logo.png', 'https://www.livart.co.kr', true),
('서재필', 'seojae', '원목 가구 전문', '/brands/seojae-logo.png', 'https://www.seojae.com', true);

-- =========================================
-- 4. 샘플 상품 데이터 생성
-- =========================================

-- 식탁 상품들
INSERT INTO hk_products (
    category_id, brand_id, name, slug, short_description, long_description, 
    sku, base_price, sale_price, weight, dimensions, materials, 
    care_instructions, warranty_period, is_featured, is_new, is_bestseller, 
    meta_title, meta_description, search_keywords
) VALUES 
(
    (SELECT id FROM hk_categories WHERE slug = 'dining-tables'),
    (SELECT id FROM hk_brands WHERE slug = 'ikea'),
    '미드센추리 원목 식탁 180cm',
    'midcentury-wood-dining-table-180',
    '심플하고 세련된 미드센추리 스타일의 원목 식탁',
    '북유럽 미드센추리 스타일로 디자인된 원목 식탁입니다. 180cm의 넉넉한 크기로 4-6인이 사용하기에 적합합니다. 견고한 참나무 원목으로 제작되어 내구성이 뛰어나며, 자연스러운 나무 결이 아름다운 제품입니다.',
    'DT-001-180-OAK',
    890000,
    790000,
    45.5,
    '{"width": 180, "height": 75, "depth": 90}',
    '{"원목", "참나무", "친환경 오일 마감"}',
    '부드러운 면 천으로 닦아주시고, 직사광선과 습기를 피해 보관해 주세요.',
    24,
    true,
    false,
    true,
    '미드센추리 원목 식탁 180cm - 홍케아 가구',
    '심플하고 세련된 미드센추리 스타일의 원목 식탁. 180cm 4-6인용 참나무 원목 식탁',
    '{"식탁", "원목식탁", "미드센추리", "180cm", "4인용", "6인용", "참나무", "북유럽"}'
),
(
    (SELECT id FROM hk_categories WHERE slug = 'dining-chairs'),
    (SELECT id FROM hk_brands WHERE slug = 'hanssem'),
    '컴포트 패브릭 다이닝 체어',
    'comfort-fabric-dining-chair',
    '편안한 착석감의 패브릭 다이닝 체어',
    '인체공학적으로 설계된 등받이와 쿠션으로 장시간 앉아도 편안합니다. 고급 패브릭 소재를 사용하여 내구성과 감촉이 우수하며, 다양한 인테리어에 잘 어울리는 심플한 디자인입니다.',
    'DC-002-FAB-GRY',
    180000,
    159000,
    8.2,
    '{"width": 45, "height": 85, "depth": 50}',
    '{"원목 프레임", "고밀도 스펀지", "패브릭"}',
    '물기를 완전히 제거한 후 부드러운 천으로 닦아주세요. 세탁은 불가합니다.',
    12,
    false,
    true,
    false,
    '컴포트 패브릭 다이닝 체어 - 홍케아 가구',
    '편안한 착석감의 패브릭 다이닝 체어. 인체공학적 설계로 장시간 사용 가능',
    '{"다이닝체어", "식탁의자", "패브릭체어", "원목프레임", "쿠션체어"}'
);

-- 소파 상품들
INSERT INTO hk_products (
    category_id, brand_id, name, slug, short_description, long_description, 
    sku, base_price, sale_price, weight, dimensions, materials, 
    care_instructions, warranty_period, is_featured, is_new, is_bestseller, 
    meta_title, meta_description, search_keywords
) VALUES 
(
    (SELECT id FROM hk_categories WHERE slug = 'sofas'),
    (SELECT id FROM hk_brands WHERE slug = 'livart'),
    '모던 3인용 패브릭 소파',
    'modern-3seater-fabric-sofa',
    '모던하고 세련된 3인용 패브릭 소파',
    '깔끔한 라인과 모던한 디자인의 3인용 소파입니다. 고급 패브릭과 고밀도 폼을 사용하여 편안함과 내구성을 모두 갖췄습니다. 컴팩트한 사이즈로 다양한 공간에 잘 어울립니다.',
    'SF-003-3S-BLU',
    1290000,
    1190000,
    55.0,
    '{"width": 210, "height": 85, "depth": 90}',
    '{"고급 패브릭", "고밀도 폼", "원목 프레임", "스프링"}',
    '진공청소기로 먼지를 제거하고, 얼룩은 중성세제로 부분 세척해 주세요.',
    36,
    true,
    false,
    true,
    '모던 3인용 패브릭 소파 - 홍케아 가구',
    '모던하고 세련된 3인용 패브릭 소파. 고급 패브릭과 고밀도 폼으로 편안함 제공',
    '{"소파", "3인용소파", "패브릭소파", "모던소파", "거실소파"}'
);

-- =========================================
-- 5. 상품 이미지 데이터 생성
-- =========================================

INSERT INTO hk_product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES 
((SELECT id FROM hk_products WHERE sku = 'DT-001-180-OAK'), '/products/dining-table-180-main.jpg', '미드센추리 원목 식탁 메인 이미지', 0, true),
((SELECT id FROM hk_products WHERE sku = 'DT-001-180-OAK'), '/products/dining-table-180-detail1.jpg', '식탁 측면 상세 이미지', 1, false),
((SELECT id FROM hk_products WHERE sku = 'DT-001-180-OAK'), '/products/dining-table-180-detail2.jpg', '식탁 다리 상세 이미지', 2, false),

((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), '/products/dining-chair-fabric-main.jpg', '패브릭 다이닝 체어 메인 이미지', 0, true),
((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), '/products/dining-chair-fabric-side.jpg', '다이닝 체어 측면 이미지', 1, false),

((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), '/products/sofa-3seater-main.jpg', '3인용 소파 메인 이미지', 0, true),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), '/products/sofa-3seater-room.jpg', '소파 배치 룸셋 이미지', 1, false);

-- =========================================
-- 6. 상품 옵션 그룹 및 옵션 값 생성
-- =========================================

-- 다이닝 체어 색상 옵션
INSERT INTO hk_product_option_groups (product_id, name, display_type, is_required, sort_order) VALUES 
((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), 'Color', 'color_picker', true, 0);

INSERT INTO hk_product_option_values (option_group_id, value, display_name, color_code, additional_price, sort_order) VALUES 
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY')), 'grey', '그레이', '#808080', 0, 0),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY')), 'navy', '네이비', '#000080', 10000, 1),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY')), 'beige', '베이지', '#F5F5DC', 0, 2);

-- 소파 색상 옵션
INSERT INTO hk_product_option_groups (product_id, name, display_type, is_required, sort_order) VALUES 
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'Color', 'select', true, 0),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'Leg Color', 'select', false, 1);

INSERT INTO hk_product_option_values (option_group_id, value, display_name, additional_price, sort_order) VALUES 
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Color'), 'blue', '블루', 0, 0),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Color'), 'charcoal', '차콜', 20000, 1),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Color'), 'cream', '크림', 15000, 2),

((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Leg Color'), 'walnut', '월넛', 0, 0),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Leg Color'), 'oak', '오크', 25000, 1),
((SELECT id FROM hk_product_option_groups WHERE product_id = (SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU') AND name = 'Leg Color'), 'black', '블랙', 30000, 2);

-- =========================================
-- 7. 상품 재고 정보 생성
-- =========================================

-- 식탁 재고 (옵션 없음)
INSERT INTO hk_product_variants (product_id, variant_sku, option_combinations, stock_quantity, low_stock_threshold) VALUES 
((SELECT id FROM hk_products WHERE sku = 'DT-001-180-OAK'), 'DT-001-180-OAK-DEFAULT', '{}', 15, 3);

-- 다이닝 체어 재고 (색상별)
INSERT INTO hk_product_variants (product_id, variant_sku, option_combinations, stock_quantity, low_stock_threshold) VALUES 
((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), 'DC-002-FAB-GRY-GREY', '{"Color": "grey"}', 25, 5),
((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), 'DC-002-FAB-GRY-NAVY', '{"Color": "navy"}', 18, 5),
((SELECT id FROM hk_products WHERE sku = 'DC-002-FAB-GRY'), 'DC-002-FAB-GRY-BEIGE', '{"Color": "beige"}', 22, 5);

-- 소파 재고 (색상 + 다리 색상 조합)
INSERT INTO hk_product_variants (product_id, variant_sku, option_combinations, stock_quantity, low_stock_threshold) VALUES 
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'SF-003-3S-BLU-BLU-WAL', '{"Color": "blue", "Leg Color": "walnut"}', 8, 2),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'SF-003-3S-BLU-BLU-OAK', '{"Color": "blue", "Leg Color": "oak"}', 6, 2),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'SF-003-3S-BLU-CHAR-WAL', '{"Color": "charcoal", "Leg Color": "walnut"}', 5, 2),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'SF-003-3S-BLU-CHAR-BLK', '{"Color": "charcoal", "Leg Color": "black"}', 4, 2),
((SELECT id FROM hk_products WHERE sku = 'SF-003-3S-BLU'), 'SF-003-3S-BLU-CREAM-OAK', '{"Color": "cream", "Leg Color": "oak"}', 7, 2);

-- =========================================
-- 8. 할인 쿠폰 생성
-- =========================================

INSERT INTO hk_coupons (code, name, description, discount_type, discount_value, minimum_order_amount, valid_from, valid_until, is_active) VALUES 
('WELCOME10', '신규회원 10% 할인', '신규회원 가입시 제공되는 10% 할인 쿠폰', 'percentage', 10, 100000, NOW(), NOW() + INTERVAL '3 months', true),
('FURNITURE50', '가구 5만원 할인', '가구 구매시 5만원 즉시 할인', 'fixed_amount', 50000, 500000, NOW(), NOW() + INTERVAL '1 month', true),
('VIP15', 'VIP 회원 15% 할인', 'VIP 회원 전용 15% 할인 쿠폰', 'percentage', 15, 200000, NOW(), NOW() + INTERVAL '6 months', true);

-- =========================================
-- 9. 시스템 설정 추가
-- =========================================

INSERT INTO hk_system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('maintenance_mode', 'false', 'boolean', '사이트 점검 모드', false),
('max_cart_items', '20', 'number', '장바구니 최대 아이템 수', true),
('review_auto_approve', 'false', 'boolean', '리뷰 자동 승인 여부', false),
('product_images_max', '8', 'number', '상품당 최대 이미지 수', false),
('order_cancel_hours', '24', 'number', '주문 취소 가능 시간(시간)', true);

-- =========================================
-- 샘플 데이터 삽입 완료
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '샘플 데이터 삽입이 완료되었습니다.';
    RAISE NOTICE '- 카테고리: % 개', (SELECT COUNT(*) FROM hk_categories);
    RAISE NOTICE '- 브랜드: % 개', (SELECT COUNT(*) FROM hk_brands);
    RAISE NOTICE '- 상품: % 개', (SELECT COUNT(*) FROM hk_products);
    RAISE NOTICE '- 상품 옵션: % 개', (SELECT COUNT(*) FROM hk_product_variants);
    RAISE NOTICE '- 쿠폰: % 개', (SELECT COUNT(*) FROM hk_coupons);
END $$;