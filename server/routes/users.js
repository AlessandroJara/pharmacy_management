const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (db) => {
  router.get('/users', authenticateToken, async (req, res) => {
    try {
      if (!db || typeof db.execute !== 'function') {
        throw new Error('Database connection is invalid or execute method is not available');
      }
      const [rows] = await db.execute('SELECT id, username, role FROM users');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching users:', err.message, err.stack);
      res.status(500).json({ message: `Server error fetching users: ${err.message}` });
    }
  });

  router.post('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create users' });
    }
    const { username, password, role } = req.body;

    try {
      const [result] = await db.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, password, role]
      );
      const [newUser] = await db.execute('SELECT id, username, role FROM users WHERE id = ?', [result.insertId]);
      res.status(201).json(newUser[0]);
    } catch (err) {
      console.error('Error creating user:', err.message, err.stack);
      res.status(500).json({ message: `Server error creating user: ${err.message}` });
    }
  });

  router.put('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update users' });
    }
    const { id } = req.params;
    const { username, password, role } = req.body;

    try {
      const [result] = await db.execute(
        'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
        [username, password || null, role, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const [updatedUser] = await db.execute('SELECT id, username, role FROM users WHERE id = ?', [id]);
      res.json(updatedUser[0]);
    } catch (err) {
      console.error('Error updating user:', err.message, err.stack);
      res.status(500).json({ message: `Server error updating user: ${err.message}` });
    }
  });

  router.delete('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }
    const { id } = req.params;

    try {
      const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting user:', err.message, err.stack);
      res.status(500).json({ message: `Server error deleting user: ${err.message}` });
    }
  });

  return router;
};