import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Ambil semua pesanan dengan nama user
    const [orders] = await db.promise().query(`
      SELECT o.*, u.name as customer_name 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    // Ambil items untuk setiap pesanan
    for (let order of orders) {
      const [items] = await db.promise().query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      // Format tanggal
      const orderDate = new Date(order.created_at);
      order.formatted_date = orderDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      order.items = items || [];
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil data pesanan',
      details: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  console.log('Received order data:', req.body); // Log data yang diterima
  
  const { customer_name, items, total_price } = req.body;
  
  // Validasi input
  if (!customer_name || !items?.length || total_price === undefined) {
    console.log('Validation failed:', { customer_name, items, total_price });
    return res.status(400).json({ 
      success: false,
      error: 'customer_name, items, dan total_price harus diisi' 
    });
  }
  
  let connection;
  try {
    // Dapatkan koneksi dari pool
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    
    console.log('Transaction started');
    
    // 1. Cari atau buat user
    console.log('Finding or creating user...');
    let [users] = await connection.query(
      'SELECT id FROM users WHERE name = ?',
      [customer_name]
    );
    
    let userId;
    if (users.length > 0) {
      userId = users[0].id;
      console.log('User found:', userId);
    } else {
      console.log('Creating new user...');
      const email = `${customer_name.toLowerCase().replace(/\s+/g, '')}@example.com`;
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [customer_name, email, 'default123']
      );
      userId = result.insertId;
      console.log('User created:', userId);
    }
    
    // 2. Buat order
    console.log('Creating order...');
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_price, customer_name) VALUES (?, ?, ?)',
      [userId, total_price, customer_name]
    );
    
    const orderId = orderResult.insertId;
    console.log('Order created:', orderId);
    
    // 3. Simpan items
    console.log('Saving order items...');
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.name,
      product_image: item.image
    }));
    
    // Gunakan bulk insert
    const [itemResult] = await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price, product_name, product_image) VALUES ?',
      [orderItems.map(item => [
        item.order_id,
        item.product_id,
        item.quantity,
        item.price,
        item.product_name,
        item.product_image
      ])]
    );
    
    console.log('Order items saved:', itemResult.affectedRows);
    
    // Commit transaksi
    await connection.commit();
    console.log('Transaction committed');
    
    res.json({ 
      success: true,
      message: 'Pesanan berhasil dibuat',
      order_id: orderId
    });
    
  } catch (error) {
    // Rollback jika terjadi error
    if (connection) {
      await connection.rollback();
      console.log('Transaction rolled back');
    }
    
    console.error('Order creation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Gagal membuat pesanan',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Terjadi kesalahan server'
    });
  } finally {
    // Selalu lepaskan koneksi
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

export default router;
