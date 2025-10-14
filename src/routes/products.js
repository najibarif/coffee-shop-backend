import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { name, price, description } = req.body;
  db.query('INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
    [name, price, description],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Product added' });
    }
  );
});

export default router;
