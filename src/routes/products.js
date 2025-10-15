import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// GET /products - Ambil semua produk
router.get('/', async (req, res) => {
  try {
    const [products] = await db.promise().query('SELECT * FROM products ORDER BY id ASC');
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data produk',
      details: error.message
    });
  }
});

// GET /products/:id - Ambil produk berdasarkan ID
router.get('/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({
      success: false,
      error: 'ID produk tidak valid'
    });
  }

  try {
    const [products] = await db.promise().query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produk tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data produk',
      details: error.message
    });
  }
});

export default router;
