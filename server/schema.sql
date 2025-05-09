CREATE TABLE pharmacy_db;
USE pharmacy_db;

  CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user' NOT NULL
  );

  CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
  );

  CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- Insert initial admin user (password: admin123, hashed later)
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');
INSERT INTO products (name, quantity, price) VALUES ('Ibuprofen', 50, 3.99); 
INSERT INTO sales (product_id, quantity) VALUES (1, 10);