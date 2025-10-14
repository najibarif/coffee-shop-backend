import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM orders', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { user_id, total_price } = req.body;
  db.query('INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
    [user_id, total_price],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Order created' });
    }
  );
});

export default router;
