import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Get single product by ID
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  
  // Validate ID is a number
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'ID produk tidak valid' });
  }

  const query = 'SELECT * FROM products WHERE id = ?';
  
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }

    // Check if product exists
    if (result.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    // Return the first (and should be only) result
    res.json(result[0]);
  });
});

export default router;