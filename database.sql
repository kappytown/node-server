/**
 * Database Schema
 * 
 * Creates the database and all required tables for the REST API.
 * Run this file once to set up your database:
 * mysql -u root -p < database.sql
 */

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE api_db;

-- Create the database user and password
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'api_password';
GRANT ALL PRIVILEGES ON api_db.* TO 'api_user'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

/**
 * Users Table
 * Stores user accounts with authentication credentials
 */
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

/**
 * Sessions Table
 * Stores user session tokens
 */
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user (user_id),
  INDEX idx_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


/**
 * Products Table
 */
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

/**
 * Orders Table
 */
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/**
 * Order Items Table
 */
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/**
 * Reports Table
 */
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_report_type (report_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* Note: Password!1 works for all users */
INSERT INTO users (name, email, password) VALUES 
('Jane Doe', 'test@test.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW'),
('John Doe', 'john.doe@example.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW'),
('Jane Smith', 'jane.smith@example.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW'),
('Bob Johnson', 'bob.johnson@example.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW'),
('Alice Williams', 'alice.williams@example.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW'),
('Charlie Brown', 'charlie.brown@example.com', '$2b$10$gn5r1WPuAEwi9Pnhkv9CUOgayqjHB6PwweTSDeJP4j4ff1aK.O4VW');

INSERT INTO sessions (user_id, token, expires_at) VALUES
(1, 'test-token-john-123456', DATE_ADD(NOW(), INTERVAL 14 DAY)),
(2, 'test-token-jane-789012', DATE_ADD(NOW(), INTERVAL 14 DAY));

INSERT INTO products (name, description, price, stock, category, image_url, is_active) VALUES
('Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 25, 'Electronics', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', TRUE),
('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 150, 'Electronics', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', TRUE),
('Office Chair', 'Comfortable ergonomic office chair with lumbar support', 249.99, 45, 'Furniture', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', TRUE),
('Standing Desk', 'Adjustable height standing desk 48x30 inches', 399.99, 20, 'Furniture', 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500', TRUE),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and card reader', 49.99, 200, 'Electronics', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500', TRUE),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with brown switches', 89.99, 80, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', TRUE),
('Monitor 27"', '27-inch 4K monitor with IPS panel', 449.99, 35, 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', TRUE),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, 100, 'Furniture', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', TRUE),
('Webcam HD', '1080p HD webcam with built-in microphone', 69.99, 60, 'Electronics', 'https://images.unsplash.com/photo-1589739900243-c506f6a96e76?w=500', TRUE),
('Bookshelf', 'Wooden bookshelf with 5 shelves', 129.99, 30, 'Furniture', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500', TRUE),
('Headphones', 'Noise-cancelling wireless headphones', 199.99, 75, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', TRUE),
('Coffee Maker', 'Programmable 12-cup coffee maker', 79.99, 50, 'Appliances', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', TRUE),
('Water Bottle', 'Insulated stainless steel water bottle 32oz', 24.99, 300, 'Accessories', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', TRUE),
('Backpack', 'Laptop backpack with USB charging port', 54.99, 120, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', TRUE),
('Notebook Set', 'Set of 3 lined notebooks', 14.99, 250, 'Stationery', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', TRUE);

INSERT INTO orders (user_id, total, status, shipping_address, created_at) VALUES
-- John Doe orders
(1, 1379.98, 'delivered', '123 Main St, San Diego, CA 92101', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(1, 249.99, 'delivered', '123 Main St, San Diego, CA 92101', DATE_SUB(NOW(), INTERVAL 38 DAY)),
(1, 159.97, 'delivered', '123 Main St, San Diego, CA 92101', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(1, 289.97, 'delivered', '123 Main St, San Diego, CA 92101', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1, 549.98, 'shipped', '123 Main St, San Diego, CA 92101', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Jane Smith orders
(2, 539.97, 'delivered', '456 Oak Ave, Los Angeles, CA 90001', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(2, 729.97, 'delivered', '456 Oak Ave, Los Angeles, CA 90001', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(2, 199.99, 'delivered', '456 Oak Ave, Los Angeles, CA 90001', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 319.97, 'processing', '456 Oak Ave, Los Angeles, CA 90001', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Bob Johnson orders
(3, 89.99, 'delivered', '789 Pine Rd, San Francisco, CA 94102', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(3, 479.98, 'delivered', '789 Pine Rd, San Francisco, CA 94102', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(3, 129.99, 'shipped', '789 Pine Rd, San Francisco, CA 94102', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 234.96, 'pending', '789 Pine Rd, San Francisco, CA 94102', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Alice Williams orders
(4, 1299.99, 'cancelled', '321 Elm St, Sacramento, CA 95814', DATE_SUB(NOW(), INTERVAL 42 DAY)),
(4, 339.98, 'delivered', '321 Elm St, Sacramento, CA 95814', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 759.96, 'delivered', '321 Elm St, Sacramento, CA 95814', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 149.98, 'shipped', '321 Elm St, Sacramento, CA 95814', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Charlie Brown orders
(5, 449.99, 'delivered', '654 Maple Dr, Fresno, CA 93650', DATE_SUB(NOW(), INTERVAL 48 DAY)),
(5, 1749.96, 'delivered', '654 Maple Dr, Fresno, CA 93650', DATE_SUB(NOW(), INTERVAL 32 DAY)),
(5, 369.97, 'delivered', '654 Maple Dr, Fresno, CA 93650', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 89.99, 'processing', '654 Maple Dr, Fresno, CA 93650', DATE_SUB(NOW(), INTERVAL 2 DAY));


INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Order 1 (John Doe - 45 days ago - delivered)
(1, 1, 1, 1299.99),  -- Laptop
(1, 2, 1, 29.99),    -- Mouse
(1, 5, 1, 49.99),    -- USB-C Hub

-- Order 2 (John Doe - 38 days ago - delivered)
(2, 3, 1, 249.99),   -- Office Chair

-- Order 3 (John Doe - 25 days ago - delivered)
(3, 14, 2, 54.99),   -- Backpacks
(3, 13, 2, 24.99),   -- Water Bottles

-- Order 4 (John Doe - 18 days ago - delivered)
(4, 8, 2, 39.99),    -- Desk Lamps
(4, 15, 5, 14.99),   -- Notebook Sets
(4, 13, 4, 24.99),   -- Water Bottles

-- Order 5 (John Doe - 3 days ago - shipped)
(5, 7, 1, 449.99),   -- Monitor
(5, 13, 4, 24.99),   -- Water Bottles

-- Order 6 (Jane Smith - 50 days ago - delivered)
(6, 6, 1, 89.99),    -- Keyboard
(6, 9, 1, 69.99),    -- Webcam
(6, 2, 1, 29.99),    -- Mouse
(6, 8, 1, 39.99),    -- Desk Lamp
(6, 13, 10, 24.99),  -- Water Bottles

-- Order 7 (Jane Smith - 35 days ago - delivered)
(7, 7, 1, 449.99),   -- Monitor
(7, 11, 1, 199.99),  -- Headphones
(7, 2, 1, 29.99),    -- Mouse
(7, 5, 1, 49.99),    -- USB-C Hub

-- Order 8 (Jane Smith - 20 days ago - delivered)
(8, 11, 1, 199.99),  -- Headphones

-- Order 9 (Jane Smith - 2 days ago - processing)
(9, 12, 1, 79.99),   -- Coffee Maker
(9, 13, 8, 24.99),   -- Water Bottles
(9, 15, 2, 14.99),   -- Notebook Sets

-- Order 10 (Bob Johnson - 40 days ago - delivered)
(10, 6, 1, 89.99),   -- Keyboard

-- Order 11 (Bob Johnson - 28 days ago - delivered)
(11, 1, 1, 1299.99), -- Laptop (sold out item)
(11, 6, 2, 89.99),   -- Keyboards

-- Order 12 (Bob Johnson - 5 days ago - shipped)
(12, 10, 1, 129.99), -- Bookshelf

-- Order 13 (Bob Johnson - 1 day ago - pending)
(13, 14, 2, 54.99),  -- Backpacks
(13, 13, 5, 24.99),  -- Water Bottles

-- Order 14 (Alice Williams - 42 days ago - cancelled)
(14, 1, 1, 1299.99), -- Laptop

-- Order 15 (Alice Williams - 30 days ago - delivered)
(15, 3, 1, 249.99),  -- Office Chair
(15, 2, 3, 29.99),   -- Mice

-- Order 16 (Alice Williams - 15 days ago - delivered)
(16, 7, 1, 449.99),  -- Monitor
(16, 6, 1, 89.99),   -- Keyboard
(16, 2, 1, 29.99),   -- Mouse
(16, 5, 1, 49.99),   -- USB-C Hub
(16, 9, 2, 69.99),   -- Webcams

-- Order 17 (Alice Williams - 4 days ago - shipped)
(17, 14, 2, 54.99),  -- Backpacks
(17, 13, 4, 24.99),  -- Water Bottles

-- Order 18 (Charlie Brown - 48 days ago - delivered)
(18, 7, 1, 449.99),  -- Monitor

-- Order 19 (Charlie Brown - 32 days ago - delivered)
(19, 1, 1, 1299.99), -- Laptop
(19, 7, 1, 449.99),  -- Monitor

-- Order 20 (Charlie Brown - 12 days ago - delivered)
(20, 11, 1, 199.99), -- Headphones
(20, 9, 1, 69.99),   -- Webcam
(20, 13, 4, 24.99),  -- Water Bottles

-- Order 21 (Charlie Brown - 2 days ago - processing)
(21, 6, 1, 89.99);   -- Keyboard

INSERT INTO reports (user_id, report_type, title, data) VALUES
(1, 'sales', 'Monthly Sales Report - October', '{"month": "October", "total_sales": 1789.95, "orders": 3, "avg_order_value": 596.65}'),
(1, 'inventory', 'Low Stock Alert', '{"products": [{"id": 4, "name": "Standing Desk", "stock": 20}]}'),
(2, 'sales', 'Quarterly Sales Report - Q3', '{"quarter": "Q3", "total_sales": 1269.94, "orders": 2, "avg_order_value": 634.97}'),
(3, 'orders', 'Pending Orders Report', '{"pending_count": 1, "total_value": 89.99}'),
(1, 'customer', 'Top Customers Report', '{"top_customers": [{"id": 1, "name": "John Doe", "total_spent": 1789.95}, {"id": 2, "name": "Jane Smith", "total_spent": 1269.94}]}');