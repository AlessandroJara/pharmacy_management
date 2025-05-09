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
      console.log('Fetched products data:', rows);
      const normalizedRows = rows.map(product => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      }));
      res.json(normalizedRows);
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
      res.status(201).json({
        ...newProduct[0],
        price: typeof newProduct[0].price === 'string' ? parseFloat(newProduct[0].price) : newProduct[0].price,
      });
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
      res.json({
        ...updatedProduct[0],
        price: typeof updatedProduct[0].price === 'string' ? parseFloat(updatedProduct[0].price) : updatedProduct[0].price,
      });
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
      const [rows] = await db.execute(`
        SELECT s.id, s.quantity, s.sale_date, p.name, p.price
        FROM sales s
        JOIN products p ON s.product_id = p.id
      `);
      console.log('Fetched sales data:', rows);
      const normalizedRows = rows.map(sale => ({
        ...sale,
        price: typeof sale.price === 'string' ? parseFloat(sale.price) : sale.price,
      }));
      res.json(normalizedRows);
    } catch (err) {
      console.error('Error fetching sales:', err.message, err.stack);
      res.status(500).json({ message: `Server error fetching sales: ${err.message}` });
    }
  });

  router.post('/sales', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body;

    console.log('Received sale request:', { productId, quantity });

    if (!productId || !Number.isInteger(productId) || !quantity || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Valid product ID and positive quantity are required' });
    }

    try {
      // Use db.query for transaction commands
      await db.query('START TRANSACTION');

      const [products] = await db.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
      const product = products[0];
      console.log('Fetched product for sale:', product);

      if (!product) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.quantity < quantity) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock. Only ${product.quantity} units available.` });
      }

      const newQuantity = product.quantity - quantity;
      await db.execute('UPDATE products SET quantity = ? WHERE id = ?', [newQuantity, productId]);

      const [result] = await db.execute(
        'INSERT INTO sales (product_id, quantity) VALUES (?, ?)',
        [productId, quantity]
      );
      console.log('Sale inserted, result:', result);

      const [newSale] = await db.execute(`
        SELECT s.id, s.quantity, s.sale_date, p.name, p.price
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE s.id = ?
      `, [result.insertId]);
      console.log('Fetched new sale:', newSale);

      await db.query('COMMIT');

      const lowStock = newQuantity <= 10;
      res.status(201).json({ 
        sale: {
          ...newSale[0],
          price: typeof newSale[0].price === 'string' ? parseFloat(newSale[0].price) : newSale[0].price,
        }, 
        lowStock, 
        remainingStock: newQuantity 
      });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Error processing sale:', err.message, err.stack);
      res.status(500).json({ message: `Server error processing sale: ${err.message}` });
    }
  });

  return router;
};