import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// Input validation middleware
const validateUserInput = (req, res, next) => {
  const { name, email } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      success: false,
      error: 'Nama harus diisi dan minimal 2 karakter' 
    });
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Format email tidak valid'
    });
  }
  
  next();
};

// GET all users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, name, email FROM users');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data pengguna'
    });
  }
});

// Create new user
router.post('/', validateUserInput, async (req, res) => {
  const { name, email } = req.body;
  const sanitizedName = name.trim();
  
  try {
    // Check if user exists
    const [existingUsers] = await db.promise().query(
      'SELECT id, name, email FROM users WHERE name = ?',
      [sanitizedName]
    );

    if (existingUsers.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Pengguna sudah ada',
        data: existingUsers[0]
      });
    }

    // Create email if not provided
    const userEmail = email || `${sanitizedName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    // Create new user
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [sanitizedName, userEmail]
    );

    if (result.affectedRows === 1) {
      const [newUser] = await db.promise().query(
        'SELECT id, name, email FROM users WHERE id = ?',
        [result.insertId]
      );
      
      if (newUser.length > 0) {
        return res.status(201).json({
          success: true,
          message: 'Pengguna berhasil dibuat',
          data: newUser[0]
        });
      }
    }
    
    throw new Error('Gagal membuat pengguna');

  } catch (error) {
    console.error('Error creating user:', error);
    const statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 500;
    const errorMessage = error.code === 'ER_DUP_ENTRY' 
      ? 'Email sudah digunakan' 
      : 'Terjadi kesalahan saat membuat pengguna';
      
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;