require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 30000, // 30 seconds timeout
};

let db;

async function initializeDb() {
  if (db) return db; // Return existing connection if already initialized
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    console.log('DB object:', db ? 'Initialized' : 'Not initialized');
    console.log('DB execute method:', typeof db.execute === 'function' ? 'Available' : 'Not available');
    return db;
  } catch (err) {
    console.error('Database connection failed:', err.code, err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your database username and password in the .env file.');
    }
    throw err;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database connection not initialized. Ensure initializeDb has been called.');
  }
  return db;
}

module.exports = { initializeDb, getDb };