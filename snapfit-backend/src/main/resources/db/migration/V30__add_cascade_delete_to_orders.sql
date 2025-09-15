-- 기존 Foreign Key 제약조건 삭제
ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey;

-- CASCADE 삭제가 포함된 새로운 Foreign Key 제약조건 추가
ALTER TABLE order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
