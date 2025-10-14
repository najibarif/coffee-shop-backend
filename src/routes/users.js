import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT id, name, email FROM users', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { name, email, password } = req.body;
  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User added' });
    }
  );
});

export default router;
