-- Pilih database (pastikan 'railway' ada)
USE railway;

-- 1️⃣ Membuat tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL
);

-- 2️⃣ Membuat tabel products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image VARCHAR(255) NOT NULL DEFAULT 'default.png'
);

-- 3️⃣ Membuat tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ Mengisi tabel users
INSERT INTO users (name, email, password) VALUES
('Naufal Najib', 'naufal@example.com', '123456'),
('Rina Setiawan', 'rina@example.com', 'password123'),
('Andi Pratama', 'andi@example.com', 'qwerty'),
('Dewi Lestari', 'dewi@example.com', 'abc123');

-- 5️⃣ Mengisi tabel products
INSERT INTO products (name, price, description, image) VALUES
('Espresso', 25000.00, 'Kopi espresso murni dengan rasa kuat dan aroma khas.', 'espresso.png'),
('Latte', 30000.00, 'Campuran espresso dengan susu hangat dan sedikit foam.', 'latte.png'),
('Cappuccino', 32000.00, 'Kopi susu dengan perbandingan seimbang antara espresso, susu, dan busa.', 'cappuccino.png'),
('Mocha', 35000.00, 'Campuran cokelat, espresso, dan susu.', 'mocha.png'),
('Americano', 22000.00, 'Espresso yang dicampur dengan air panas.', 'americano.png');

-- 6️⃣ Mengisi tabel orders
INSERT INTO orders (total_price) VALUES
(55000.00),
(30000.00),
(67000.00),
(22000.00);
