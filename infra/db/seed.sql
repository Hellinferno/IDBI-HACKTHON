-- seed.sql
INSERT INTO users (id, customer_ref, locale) VALUES 
('00000000-0000-0000-0000-000000000001', 'CUST_001', 'en-IN')
ON CONFLICT (customer_ref) DO NOTHING;

INSERT INTO accounts (id, user_id, account_type, balance, synced_at) VALUES 
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'savings', 150000.00, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name, is_discretionary) VALUES
('00000000-0000-0000-0000-000000000003', 'salary', false),
('00000000-0000-0000-0000-000000000004', 'groceries', false)
ON CONFLICT DO NOTHING;

INSERT INTO transactions (id, account_id, amount, direction, description, category_id, txn_date, source_ref) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 85000.00, 'credit', 'SALARY AUG 2026', '00000000-0000-0000-0000-000000000003', '2026-08-01', 'TXN_001'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 12000.00, 'debit', 'BIG BASKET', '00000000-0000-0000-0000-000000000004', '2026-08-05', 'TXN_002');
