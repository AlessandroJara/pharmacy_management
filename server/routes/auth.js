const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      if (!db || typeof db.execute !== 'function') {
        throw new Error('Database connection is invalid or execute method is not available');
      }
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      const user = rows[0];

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ role: user.role }, 'your-secure-secret-key', { expiresIn: '1h' });
      res.json({ token, role: user.role, username: user.username });
    } catch (err) {
      console.error('Login error:', err.message, err.stack);
      res.status(500).json({ message: `Server error during login: ${err.message}` });
    }
  });

  return router;
};