import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.promise().query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Format the response
    const formattedOrders = orders.map(order => ({
      ...order,
      created_at: new Date(order.created_at).toISOString()
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data pesanan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  const { total_price } = req.body;

  // Validate input
  if (!total_price) {
    return res.status(400).json({
      success: false,
      error: 'Total harga harus diisi'
    });
  }

  try {
    // Insert the new order
    const [result] = await db.promise().query(
      'INSERT INTO orders (total_price) VALUES (?)',
      [total_price]
    );

    // Get the newly created order
    const [newOrder] = await db.promise().query(
      'SELECT * FROM orders WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: newOrder[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat pesanan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
