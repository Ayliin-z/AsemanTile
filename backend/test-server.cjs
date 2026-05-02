const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  user: 'aseman_user',
  host: 'localhost',
  database: 'aseman_db',
  password: 'aseman123',
  port: 5432,
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ خطای دقیق:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5003, () => console.log('تست سرور روی پورت 5003'));
