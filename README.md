Pharmacy Management System
A web-based software for "Nova Salud" pharmacy to manage inventory, sales, and customer service.
Features

Centralized inventory management with real-time stock updates.
Sales registration with automatic stock deduction.
User-friendly interface for efficient customer service.
Low-stock alerts to prevent stockouts.

Tech Stack

Front-end: React, Tailwind CSS
Back-end: Node.js, Express
Database: MySQL

Setup Instructions
Prerequisites

Node.js (v16 or higher)
MySQL (v8 or higher)
Git

Installation

Clone the repository:
git clone <repository-url>
cd pharmacy-management


Set up the back-end:
cd server
npm install


Create a MySQL database named pharmacy_db.
Update server/config/db.js with your MySQL credentials.
Run the schema: mysql -u <user> -p pharmacy_db < schema.sql


Set up the front-end:
cd ../client
npm install


Run the application:

Start the back-end: cd server && npm start
Start the front-end: cd client && npm start
Access the app at http://localhost:3000



API Endpoints

Inventory:
GET /api/inventory: List all products.
POST /api/inventory: Add a product.
PUT /api/inventory/:id: Update a product.
DELETE /api/inventory/:id: Delete a product.


Sales:
GET /api/sales: List all sales.
POST /api/sales: Record a sale.



Notes

Ensure MySQL is running before starting the back-end.
For production, use environment variables for sensitive data.

