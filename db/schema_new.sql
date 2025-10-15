-- Pilih database (pastikan 'railway' ada)
USE railway;

-- 1️⃣ Membuat tabel products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price VARCHAR(20) NOT NULL,
  description TEXT,
  image VARCHAR(255) NOT NULL DEFAULT 'default.png'
);

-- 2️⃣ Membuat tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_price VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ Mengisi tabel products
INSERT INTO products (name, price, description, image) VALUES
('Espresso', '25000', 'Kopi espresso murni dengan rasa kuat dan aroma khas.', 'espresso.png'),
('Latte', '30000', 'Campuran espresso dengan susu hangat dan sedikit foam.', 'latte.png'),
('Cappuccino', '32000', 'Kopi susu dengan perbandingan seimbang antara espresso, susu, dan busa.', 'cappuccino.png'),
('Mocha', '35000', 'Campuran cokelat, espresso, dan susu.', 'mocha.png'),
('Americano', '22000', 'Espresso yang dicampur dengan air panas.', 'americano.png');

-- 4️⃣ Mengisi tabel orders
INSERT INTO orders (total_price) VALUES
('55000'),
('30000'),
('67000'),
('22000');
