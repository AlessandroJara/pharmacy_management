Pharmacy Management System
Overview
This is a Pharmacy Management System built to manage products, sales, and user roles in a pharmacy. The application includes a back-end server using Node.js and Express, a front-end built with React, and a MySQL database to store data. It features user authentication, inventory tracking, and sales recording functionality.
Features

User authentication with admin and user roles.
Inventory management (add, update, delete products).
Sales tracking with stock updates.
Real-time search for products.
Sales history display.
Responsive design using Tailwind CSS.

Prerequisites

Node.js (v14 or later)
MySQL Server
npm or yarn
Git

Installation
1. Clone the Repository
git clone https://github.com/your-username/pharmacy-management.git
cd pharmacy-management

2. Set Up the Database

Install MySQL and create a database:CREATE DATABASE pharmacy_db;
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


Update the database configuration in server/db.js with your MySQL credentials.

3. Install Dependencies

Navigate to the server directory:cd server
npm install


Navigate to the client directory:cd ../client
npm install



4. Configure Environment Variables

Create a .env file in the server directory:JWT_SECRET=your-secure-secret-key
DB_HOST=localhost
DB_USER=your-username
DB_PASSWORD=your-password
DB_DATABASE=pharmacy_db
PORT=5001


Ensure dotenv is loaded in server.js or app.js with require('dotenv').config().

5. Run the Application

Start the server:cd server
npm start


Start the client:cd ../client
npm start


Open your browser and navigate to http://localhost:3000.

Usage

Login: Use the login page to authenticate with a username and password. Initial users can be added to the users table manually.
Sales Management: Navigate to the /sales route to search for products, record sales, and view sales history.
Inventory Management: Admins can add, update, or delete products via API endpoints (to be implemented in the front-end if not already done).

Project Structure
pharmacy-management/
├── client/              # React front-end
│   ├── src/
│   │   ├── components/  # React components
│   │   └── ...          # Other client files
│   ├── package.json
│   └── ...
├── server/              # Node.js back-end
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── db.js            # Database connection
│   ├── package.json
│   └── ...
├── .env                 # Environment variables
├── README.md            # This file
└── ...

Contributing

Fork the repository.
Create a new branch: git checkout -b feature-branch.
Make your changes and commit: git commit -m "Description of changes".
Push to the branch: git push origin feature-branch.
Submit a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or issues, please open an issue on GitHub or contact [alessandrojara05@gmail.com].
Acknowledgments

Built with help from the xAI community and Grok 3.
Thanks to the open-source community for tools like Node.js, React, and MySQL.