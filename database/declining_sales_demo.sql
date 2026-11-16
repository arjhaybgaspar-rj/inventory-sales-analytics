-- One-time demo seed for the dashboard's Declining Sales panel.
-- Adds historical sales only; quantities intentionally do not change inventory.
-- Uses relative dates so the records stay inside the report's rolling 60-day window.
-- Run against inventory_sale_analytics after importing inventory_sale.sql.

START TRANSACTION;

-- Previous 30-day window: eight distinct selling days with stronger demand.
INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 58 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 54 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 50 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 46 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 42 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 38 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 34 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 3900.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 30 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 12, 250.00, 3000.00), (@demo_sale_id, 2, 12, 75.00, 900.00);

-- Recent 30-day window: only two selling days, with much smaller quantities.
INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 400.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 20 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 1, 250.00, 250.00), (@demo_sale_id, 2, 2, 75.00, 150.00);

INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
VALUES (1, 400.00, 'cash', DATE_SUB(CURDATE(), INTERVAL 8 DAY) + INTERVAL 10 HOUR);
SET @demo_sale_id = LAST_INSERT_ID();
INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal)
VALUES (@demo_sale_id, 1, 1, 250.00, 250.00), (@demo_sale_id, 2, 2, 75.00, 150.00);

COMMIT;
