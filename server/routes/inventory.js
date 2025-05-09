const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (db) => {
  router.get('/inventory', authenticateToken, async (req, res) => {
    try {
      if (!db || typeof db.execute !== 'function') {
        throw new Error('Database connection is invalid or execute method is not available');
      }
      const [rows] = await db.execute('SELECT * FROM products');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching inventory:', err.message, err.stack);
      res.status(500).json({ message: `Server error fetching inventory: ${err.message}` });
    }
  });

  router.post('/inventory', authenticateToken, async (req, res) => {
    const { name, quantity, price } = req.body;
    try {
      const [result] = await db.execute(
        'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)',
        [name, quantity, price]
      );
      const [newProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
      res.status(201).json(newProduct[0]);
    } catch (err) {
      console.error('Error adding product:', err.message, err.stack);
      res.status(500).json({ message: `Server error adding product: ${err.message}` });
    }
  });

  router.put('/inventory/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    try {
      const [result] = await db.execute(
        'UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?',
        [name, quantity, price, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const [updatedProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
      res.json(updatedProduct[0]);
    } catch (err) {
      console.error('Error updating product:', err.message, err.stack);
      res.status(500).json({ message: `Server error updating product: ${err.message}` });
    }
  });

  router.delete('/inventory/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting product:', err.message, err.stack);
      res.status(500).json({ message: `Server error deleting product: ${err.message}` });
    }
  });

  router.get('/sales', authenticateToken, async (req, res) => {
    try {
      if (!db || typeof db.execute !== 'function') {
        throw new Error('Database connection is invalid or execute method is not available');
      }
      const [rows] = await db.execute('SELECT * FROM sales');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching sales:', err.message, err.stack);
      res.status(500).json({ message: `Server error fetching sales: ${err.message}` });
    }
  });

  return router;
};