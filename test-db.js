import 'dotenv/config';
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

connection.connect(err => {
  if (err) console.error('❌ Error connecting to DB:', err);
  else console.log('✅ Connected to DB!');
  connection.end();
});
