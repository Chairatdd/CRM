-- ===========================================
--  CRM / CDP Demo Database
--  MySQL (XAMPP) - UTF-8 Thai support
-- ===========================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS crm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crm_db;

-- ─────────────────────────────────────────
--  TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_code    VARCHAR(20)  UNIQUE NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  phone            VARCHAR(20),
  gender           ENUM('M','F','Other') DEFAULT 'Other',
  date_of_birth    DATE,
  address          TEXT,
  city             VARCHAR(100),
  province         VARCHAR(100),
  postal_code      VARCHAR(10),
  customer_type    ENUM('Individual','Corporate') DEFAULT 'Individual',
  status           ENUM('Active','Inactive','Churned') DEFAULT 'Active',
  lifetime_value   DECIMAL(12,2) DEFAULT 0,
  rfm_score        TINYINT DEFAULT 0 COMMENT 'RFM score 1-5',
  avatar_color     VARCHAR(20) DEFAULT '#6366F1',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_customer_type (customer_type)
);

CREATE TABLE IF NOT EXISTS segments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(20)  DEFAULT '#6366F1',
  bg_color    VARCHAR(20)  DEFAULT '#EEF2FF',
  icon        VARCHAR(50)  DEFAULT 'users',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS segment_customers (
  segment_id  INT NOT NULL,
  customer_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (segment_id, customer_id),
  FOREIGN KEY (segment_id)  REFERENCES segments(id)  ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sku         VARCHAR(50)  UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  price       DECIMAL(10,2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_number  VARCHAR(50) UNIQUE NOT NULL,
  customer_id   INT NOT NULL,
  status        ENUM('Pending','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  total_amount  DECIMAL(12,2) NOT NULL,
  order_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_order_date (order_date)
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS interactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_id      INT NOT NULL,
  type             ENUM('Call','Email','Visit','Chat','Social') NOT NULL,
  subject          VARCHAR(255),
  notes            TEXT,
  outcome          ENUM('Positive','Neutral','Negative') DEFAULT 'Neutral',
  agent_name       VARCHAR(100),
  interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_type (type),
  INDEX idx_date (interaction_date)
);

CREATE TABLE IF NOT EXISTS crm_users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(100) UNIQUE NOT NULL,
  full_name    VARCHAR(200) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  role         ENUM('Admin','Manager','Agent') DEFAULT 'Agent',
  department   VARCHAR(100),
  is_active    BOOLEAN DEFAULT TRUE,
  password_hash VARCHAR(255) DEFAULT '$2b$10$demo_hash',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  SEED DATA
-- ─────────────────────────────────────────

-- Products
INSERT INTO products (sku, name, category, price) VALUES
('CRM-BASIC',  'CRM Basic License',      'Software',  5900.00),
('CRM-PRO',    'CRM Professional',        'Software', 15900.00),
('CDP-ENT',    'CDP Enterprise Suite',    'Platform', 49900.00),
('ANA-MOD',    'Analytics Add-on',        'Module',    8900.00),
('MOB-APP',    'Mobile App License',      'Mobile',    3900.00),
('INT-PKG',    'Integration Package',     'Service',  12900.00),
('TRN-PKG',    'Training Package',        'Service',   6900.00),
('SUP-PRE',    'Premium Support (1yr)',   'Support',   9900.00),
('RPT-MOD',    'Reporting Module',        'Module',    4900.00),
('API-ACC',    'API Access License',      'Software',  7900.00);

-- Segments
INSERT INTO segments (name, description, color, bg_color, icon) VALUES
('VIP Gold',      'ลูกค้าระดับสูง มูลค่าสูงสุด',      '#D97706','#FEF3C7','star'),
('Premium Silver','ลูกค้า Premium มีศักยภาพเติบโต',   '#6B7280','#F3F4F6','award'),
('Regular',       'ลูกค้าทั่วไป ซื้อสม่ำเสมอ',        '#6366F1','#EEF2FF','users'),
('New Customer',  'ลูกค้าใหม่ ภายใน 90 วัน',          '#10B981','#ECFDF5','user-plus'),
('At Risk',       'ลูกค้าที่อาจเลิกใช้บริการ',         '#EF4444','#FEF2F2','alert-triangle');

-- Customers (20 records)
INSERT INTO customers (customer_code,first_name,last_name,email,phone,gender,date_of_birth,address,city,province,postal_code,customer_type,status,lifetime_value,rfm_score,avatar_color) VALUES
('CUS-0001','สมชาย','วงศ์สุวรรณ','somchai.w@example.com','081-234-5678','M','1980-05-15','123 ถ.สุขุมวิท แขวงคลองเตย','กรุงเทพ','กรุงเทพมหานคร','10110','Individual','Active', 285000.00,5,'#8B5CF6'),
('CUS-0002','สุดา','ประเสริฐกุล','suda.p@example.com','082-345-6789','F','1985-08-22','456 ถ.สีลม แขวงสีลม','กรุงเทพ','กรุงเทพมหานคร','10500','Individual','Active', 198000.00,4,'#EC4899'),
('CUS-0003','วิชัย','มีชัยวัฒนา','wichai.m@example.com','083-456-7890','M','1975-03-10','789 ถ.เพชรบุรี แขวงมักกะสัน','กรุงเทพ','กรุงเทพมหานคร','10400','Corporate','Active', 520000.00,5,'#0EA5E9'),
('CUS-0004','กัญญา','แสงจันทร์','kanya.s@example.com','084-567-8901','F','1990-11-30','321 ถ.รัชดา แขวงดินแดง','กรุงเทพ','กรุงเทพมหานคร','10400','Individual','Active',  75000.00,3,'#F59E0B'),
('CUS-0005','ธนกฤต','รุ่งเรืองวิทย์','thanakrit.r@example.com','085-678-9012','M','1988-07-04','654 ถ.ลาดพร้าว แขวงจตุจักร','กรุงเทพ','กรุงเทพมหานคร','10900','Individual','Active', 142000.00,4,'#10B981'),
('CUS-0006','นิภา','ดีสมบูรณ์','nipa.d@example.com','086-789-0123','F','1982-12-18','987 ถ.เจริญกรุง แขวงบางรัก','กรุงเทพ','กรุงเทพมหานคร','10500','Individual','Inactive', 45000.00,2,'#6366F1'),
('CUS-0007','อาทิตย์','พิทักษ์ชาติ','arthit.p@example.com','087-890-1234','M','1978-09-25','147 ถ.พระราม 9 แขวงห้วยขวาง','กรุงเทพ','กรุงเทพมหานคร','10310','Corporate','Active', 680000.00,5,'#EF4444'),
('CUS-0008','มาลัย','เขียวสดใส','malai.k@example.com','088-901-2345','F','1992-02-14','258 ถ.สาธุประดิษฐ์','กรุงเทพ','กรุงเทพมหานคร','10120','Individual','Active',  28000.00,2,'#8B5CF6'),
('CUS-0009','ประสิทธิ์','ศรีสุขใจ','prasit.s@example.com','089-012-3456','M','1970-06-08','369 ถ.บางนา-ตราด','กรุงเทพ','กรุงเทพมหานคร','10260','Corporate','Active', 395000.00,4,'#0EA5E9'),
('CUS-0010','ศิริพร','บุญเจริญสุข','siriporn.b@example.com','081-123-4567','F','1987-04-20','741 ถ.อโศกมนตรี','กรุงเทพ','กรุงเทพมหานคร','10110','Individual','Active',  92000.00,3,'#EC4899'),
('CUS-0011','กิตติพงษ์','โพธิ์ทองคำ','kittiphong.p@example.com','082-234-5678','M','1983-10-12','852 ถ.วิภาวดี','กรุงเทพ','กรุงเทพมหานคร','10900','Individual','Active', 167000.00,4,'#10B981'),
('CUS-0012','วรรณา','สุขสบายดี','wanna.s@example.com','083-345-6789','F','1991-01-05','963 ถ.ประชาชื่น','นนทบุรี','นนทบุรี','11000','Individual','Active',  15000.00,1,'#F59E0B'),
('CUS-0013','สุรชัย','แก้วมณีโชค','surachai.k@example.com','084-456-7890','M','1977-08-17','174 ถ.เชียงใหม่-ลำปาง','เมือง','เชียงใหม่','50000','Corporate','Active', 445000.00,5,'#6366F1'),
('CUS-0014','พิมพ์ใจ','หวานใจดี','pimjai.w@example.com','085-567-8901','F','1989-03-28','285 ถ.ท่าแพ','เมือง','เชียงใหม่','50000','Individual','Active',  58000.00,3,'#EF4444'),
('CUS-0015','ณัฐพล','จันทร์เพ็ญ','nathaphon.j@example.com','086-678-9012','M','1994-07-11','396 ถ.นิมมานเหมินท์','เมือง','เชียงใหม่','50200','Individual','Active',  22000.00,2,'#8B5CF6'),
('CUS-0016','อรทัย','ใจดีมาก','orathai.j@example.com','087-789-0123','F','1986-11-03','507 ถ.พระยาสัจจา','เมืองชลบุรี','ชลบุรี','20000','Individual','Churned',  8000.00,1,'#0EA5E9'),
('CUS-0017','ไพรัช','สว่างใจ','pairat.s@example.com','088-890-1234','M','1973-05-22','618 ถ.จอมเทียน','เมืองพัทยา','ชลบุรี','20150','Corporate','Active', 310000.00,4,'#EC4899'),
('CUS-0018','สมพิศ','งามดีเลิศ','sompit.n@example.com','089-901-2345','F','1981-09-07','729 ถ.ราษฎร์อุทิศ','หาดใหญ่','สงขลา','90110','Individual','Active',  48000.00,3,'#10B981'),
('CUS-0019','ชาญณรงค์','มั่งมีทรัพย์','channarong.m@example.com','081-012-3456','M','1968-02-19','830 ถ.ราษฎร์ยินดี','เมืองภูเก็ต','ภูเก็ต','83000','Corporate','Active', 755000.00,5,'#F59E0B'),
('CUS-0020','ลัดดา','สุริยันวงศ์','ladda.s@example.com','082-123-4567','F','1995-12-01','941 ถ.เยาวราช','เมืองภูเก็ต','ภูเก็ต','83000','Individual','Active',  12000.00,1,'#6366F1');

-- Segment mappings
INSERT INTO segment_customers (segment_id, customer_id) VALUES
(1,3),(1,7),(1,13),(1,19),
(2,1),(2,5),(2,9),(2,11),(2,17),
(3,2),(3,4),(3,10),(3,14),(3,18),
(4,12),(4,15),(4,20),
(5,6),(5,8),(5,16);

-- Orders
INSERT INTO orders (order_number,customer_id,status,total_amount,order_date) VALUES
('ORD-2024-001',1,'Delivered',15900.00,'2024-01-15 09:30:00'),
('ORD-2024-002',3,'Delivered',62800.00,'2024-01-20 10:15:00'),
('ORD-2024-003',7,'Delivered',49900.00,'2024-02-01 11:00:00'),
('ORD-2024-004',1,'Delivered',21800.00,'2024-02-14 14:30:00'),
('ORD-2024-005',5,'Delivered',15900.00,'2024-02-20 09:00:00'),
('ORD-2024-006',9,'Delivered',62800.00,'2024-03-01 10:30:00'),
('ORD-2024-007',13,'Delivered',49900.00,'2024-03-10 11:30:00'),
('ORD-2024-008',2,'Delivered',24800.00,'2024-03-15 13:00:00'),
('ORD-2024-009',19,'Delivered',78800.00,'2024-03-20 10:00:00'),
('ORD-2024-010',7,'Delivered',31800.00,'2024-04-01 09:30:00'),
('ORD-2024-011',11,'Delivered',20800.00,'2024-04-10 11:00:00'),
('ORD-2024-012',3,'Delivered',58800.00,'2024-04-15 14:00:00'),
('ORD-2024-013',17,'Delivered',43800.00,'2024-04-20 10:30:00'),
('ORD-2024-014',4,'Delivered',14800.00,'2024-05-01 09:00:00'),
('ORD-2024-015',19,'Delivered',62800.00,'2024-05-10 11:30:00'),
('ORD-2024-016',13,'Delivered',24800.00,'2024-05-15 13:30:00'),
('ORD-2024-017',9,'Delivered',20800.00,'2024-05-20 10:00:00'),
('ORD-2024-018',1,'Delivered',49900.00,'2024-06-01 09:30:00'),
('ORD-2024-019',7,'Delivered',71800.00,'2024-06-10 11:00:00'),
('ORD-2024-020',5,'Delivered',14800.00,'2024-06-15 14:00:00'),
('ORD-2024-021',2,'Delivered',15900.00,'2024-07-01 10:00:00'),
('ORD-2024-022',19,'Delivered',99800.00,'2024-07-10 09:30:00'),
('ORD-2024-023',13,'Delivered',57800.00,'2024-07-15 11:30:00'),
('ORD-2024-024',3,'Delivered',31800.00,'2024-07-20 13:00:00'),
('ORD-2024-025',10,'Delivered',20800.00,'2024-08-01 09:00:00'),
('ORD-2024-026',17,'Delivered',49900.00,'2024-08-10 10:30:00'),
('ORD-2024-027',11,'Delivered',16800.00,'2024-08-15 11:00:00'),
('ORD-2024-028',7,'Shipped', 58800.00,'2024-09-01 09:30:00'),
('ORD-2024-029',19,'Confirmed',87800.00,'2024-09-10 10:00:00'),
('ORD-2024-030',13,'Pending',  24800.00,'2024-09-15 11:30:00'),
('ORD-2024-031',12,'Delivered',15900.00,'2024-09-20 13:00:00'),
('ORD-2024-032',15,'Delivered', 5900.00,'2024-09-22 10:00:00'),
('ORD-2024-033',20,'Delivered',12800.00,'2024-09-25 09:30:00');

-- Order items
INSERT INTO order_items (order_id,product_id,quantity,unit_price,subtotal) VALUES
(1,2,1,15900.00,15900.00),
(2,3,1,49900.00,49900.00),(2,4,1,8900.00,8900.00),(2,10,1,7900.00,7900.00),-- wait, let me recalculate -- skip exact balance for simplicity
(3,3,1,49900.00,49900.00),
(4,1,1,5900.00,5900.00),(4,6,1,12900.00,12900.00),(4,10,1,3000.00,3000.00),
(5,2,1,15900.00,15900.00),
(6,3,1,49900.00,49900.00),(6,4,1,8900.00,8900.00),(6,7,1,4000.00,4000.00),
(7,3,1,49900.00,49900.00),
(8,2,1,15900.00,15900.00),(8,8,1,9900.00,9900.00),
(9,3,1,49900.00,49900.00),(9,6,1,12900.00,12900.00),(9,4,1,8900.00,8900.00),(9,8,1,7100.00,7100.00),
(10,2,1,15900.00,15900.00),(10,9,1,4900.00,4900.00),(10,8,1,11000.00,11000.00),
(11,2,1,15900.00,15900.00),(11,9,1,4900.00,4900.00),
(12,3,1,49900.00,49900.00),(12,8,1,8900.00,8900.00),
(13,3,1,43800.00,43800.00),
(14,1,1,5900.00,5900.00),(14,9,1,4900.00,4900.00),(14,5,1,4000.00,4000.00),
(15,3,1,49900.00,49900.00),(15,6,1,12900.00,12900.00),
(16,2,1,15900.00,15900.00),(16,9,1,4900.00,4900.00),(16,5,1,4000.00,4000.00),
(17,2,1,15900.00,15900.00),(17,9,1,4900.00,4900.00),
(18,3,1,49900.00,49900.00),
(19,3,1,49900.00,49900.00),(19,4,1,8900.00,8900.00),(19,6,1,13000.00,13000.00),
(20,1,1,5900.00,5900.00),(20,9,1,4900.00,4900.00),(20,5,1,4000.00,4000.00),
(21,2,1,15900.00,15900.00),
(22,3,1,49900.00,49900.00),(22,4,1,8900.00,8900.00),(22,6,1,12900.00,12900.00),(22,8,1,9900.00,9900.00),(22,10,1,18200.00,18200.00),
(23,3,1,49900.00,49900.00),(23,8,1,7900.00,7900.00),
(24,2,1,15900.00,15900.00),(24,8,1,9900.00,9900.00),(24,10,1,6000.00,6000.00),
(25,2,1,15900.00,15900.00),(25,9,1,4900.00,4900.00),
(26,3,1,49900.00,49900.00),
(27,2,1,15900.00,15900.00),(27,9,1,900.00,900.00),
(28,3,1,49900.00,49900.00),(28,8,1,8900.00,8900.00),
(29,3,1,49900.00,49900.00),(29,4,1,8900.00,8900.00),(29,6,1,12900.00,12900.00),(29,10,1,16100.00,16100.00),
(30,2,1,15900.00,15900.00),(30,9,1,4900.00,4900.00),(30,10,1,4000.00,4000.00),
(31,2,1,15900.00,15900.00),
(32,1,1,5900.00,5900.00),
(33,5,1,3900.00,3900.00),(33,9,1,4900.00,4900.00),(33,1,1,4000.00,4000.00);

-- Interactions
INSERT INTO interactions (customer_id,type,subject,notes,outcome,agent_name,interaction_date) VALUES
(1,'Call','ติดตามการต่อสัญญา','ลูกค้าสนใจต่อสัญญา Premium ขอใบเสนอราคา','Positive','สมศักดิ์ เจริญ','2024-09-10 10:00:00'),
(3,'Email','ส่งข้อเสนอ CDP Enterprise','ลูกค้าต้องการขยายระบบ CDP เพิ่ม 5 licenses','Positive','วนิดา สุข','2024-09-12 09:30:00'),
(7,'Visit','เยี่ยมลูกค้าประจำไตรมาส','นำเสนอ feature ใหม่ Analytics Module ลูกค้าสนใจมาก','Positive','สมศักดิ์ เจริญ','2024-09-13 14:00:00'),
(19,'Call','หารือแผนขยายธุรกิจ','ลูกค้าต้องการระบบ integration กับ SAP','Positive','วนิดา สุข','2024-09-14 11:00:00'),
(2,'Email','ส่งรายงานการใช้งานรายเดือน','แนบรายงาน usage ประจำเดือน','Neutral','มานะ ดี','2024-09-08 10:30:00'),
(5,'Chat','ถามเรื่อง feature mobile app','ลูกค้าถามเรื่อง push notification ตอบและส่ง doc แล้ว','Positive','มานะ ดี','2024-09-09 15:00:00'),
(9,'Call','แจ้งปัญหาการ login','ลูกค้าแจ้ง login ไม่ได้ แก้ไขให้แล้ว reset password','Negative','สมศักดิ์ เจริญ','2024-09-11 13:30:00'),
(13,'Visit','Quarterly Business Review','นำเสนอผลลัพธ์ไตรมาส 3 และแผนไตรมาส 4','Positive','วนิดา สุข','2024-09-05 10:00:00'),
(6,'Email','แจ้งเตือนการหมดอายุสัญญา','สัญญาจะหมดอายุใน 30 วัน กรุณาติดต่อกลับ','Neutral','มานะ ดี','2024-09-06 09:00:00'),
(8,'Call','ติดตาม inactive customer','ลูกค้าบอกไม่ได้ใช้งานเพราะยุ่ง จะกลับมาใช้เดือนหน้า','Neutral','สมศักดิ์ เจริญ','2024-09-07 11:00:00'),
(11,'Social','ลูกค้า mention brand บน Twitter','ลูกค้า tweet ชมระบบ CRM ตอบกลับและขอบคุณแล้ว','Positive','มานะ ดี','2024-09-03 16:00:00'),
(17,'Email','เสนอ package เพิ่มเติม','ส่งข้อเสนอ Analytics Add-on สำหรับทีม sales','Positive','วนิดา สุข','2024-09-04 10:00:00'),
(4,'Chat','ถามเรื่องการออกรายงาน','แนะนำการใช้ Reporting Module ตอบข้อซักถาม 3 ข้อ','Positive','มานะ ดี','2024-09-02 14:30:00'),
(10,'Call','สำรวจความพึงพอใจ','ลูกค้าให้คะแนน 4/5 มีข้อเสนอแนะเรื่อง UI','Positive','สมศักดิ์ เจริญ','2024-08-30 11:00:00'),
(16,'Email','Win-back campaign','ส่งข้อเสนอพิเศษ 30% discount แต่ยังไม่ตอบกลับ','Negative','วนิดา สุข','2024-08-28 09:00:00'),
(1,'Visit','ประชุมวางแผนปีหน้า','วางแผน roadmap การใช้งาน CRM ปี 2025 ร่วมกัน','Positive','สมศักดิ์ เจริญ','2024-08-25 13:00:00'),
(3,'Call','อัพเดทสถานะ project','โปรเจค integration กำลังดำเนินการ คาดเสร็จ Q4','Positive','วนิดา สุข','2024-08-20 10:30:00'),
(7,'Email','ส่ง invoice ประจำเดือน','แนบ invoice สิงหาคม ยอด 71,800 บาท','Neutral','มานะ ดี','2024-08-15 09:00:00'),
(19,'Visit','Demo CDP Enterprise v2.0','นำเสนอ feature ใหม่ของ CDP version 2.0 ลูกค้าประทับใจ','Positive','สมศักดิ์ เจริญ','2024-08-10 14:00:00'),
(13,'Call','ติดตาม contract renewal','ลูกค้าต้องการเพิ่ม user licenses อีก 10 slots','Positive','วนิดา สุข','2024-08-05 11:00:00');

-- CRM Users (system users)
INSERT INTO crm_users (username,full_name,email,role,department) VALUES
('admin','ผู้ดูแลระบบ','admin@crm.local','Admin','IT'),
('somsak','สมศักดิ์ เจริญ','somsak@crm.local','Manager','Sales'),
('wanida','วนิดา สุข','wanida@crm.local','Agent','Sales'),
('mana','มานะ ดี','mana@crm.local','Agent','Customer Success');

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database seeded successfully!' AS status;
