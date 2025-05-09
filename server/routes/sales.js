const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  db.query(
    'SELECT s.id, s.quantity, s.sale_date, p.name as product_name FROM sales s JOIN products p ON s.product_id = p.id',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  db.query('SELECT quantity FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    const currentQuantity = results[0].quantity;
    if (currentQuantity < quantity)
      return res.status(400).json({ error: 'Insufficient stock' });

    db.query(
      'UPDATE products SET quantity = quantity - ? WHERE id = ?',
      [quantity, productId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(
          'INSERT INTO sales (product_id, quantity, sale_date) VALUES (?, ?, NOW())',
          [productId, quantity],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Sale recorded' });
          }
        );
      }
    );
  });
});

module.exports = router;