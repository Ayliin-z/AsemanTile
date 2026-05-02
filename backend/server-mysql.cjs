const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'asemant2_Aseman',
  password: '12345',
  database: 'asemant2_Aseman',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ خطا در اتصال به MySQL:', err);
  } else {
    console.log('✅ متصل به MySQL شد');
    connection.release();
  }
});

// ========== API محصولات ==========
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت محصولات' });
  }
});

app.post('/api/products', async (req, res) => {
  const { productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, glazetype, suitablefor, category, size, glaze, color, images, fulldescription, tags, audience } = req.body;
  try {
    const [result] = await promisePool.query(
      `INSERT INTO products (productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, glazetype, suitablefor, category, size, glaze, color, images, fulldescription, tags, audience) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, glazetype, suitablefor, category, size, glaze, color, JSON.stringify(images), fulldescription, JSON.stringify(tags), audience]
    );
    const [rows] = await promisePool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن محصول' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, glazetype, suitablefor, category, size, glaze, color, images, fulldescription, tags, audience } = req.body;
  try {
    await promisePool.query(
      `UPDATE products SET 
        productcode=?, grade=?, name=?, price=?, partnerprice=?, discount=?, stock=?, description=?, manufacturer=?, glazetype=?, suitablefor=?, category=?, size=?, glaze=?, color=?, images=?, fulldescription=?, tags=?, audience=?
       WHERE id=?`,
      [productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, glazetype, suitablefor, category, size, glaze, color, JSON.stringify(images), fulldescription, JSON.stringify(tags), audience, id]
    );
    const [rows] = await promisePool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی محصول' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'محصول حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف محصول' });
  }
});

// ========== API برندها ==========
app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM brands ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت برندها' });
  }
});

app.post('/api/brands', async (req, res) => {
  const { name, enabled } = req.body;
  try {
    const [result] = await promisePool.query('INSERT INTO brands (name, enabled) VALUES (?, ?)', [name, enabled !== undefined ? enabled : true]);
    const [rows] = await promisePool.query('SELECT * FROM brands WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن برند' });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  const { name, enabled } = req.body;
  try {
    await promisePool.query('UPDATE brands SET name=?, enabled=? WHERE id=?', [name, enabled, id]);
    const [rows] = await promisePool.query('SELECT * FROM brands WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی برند' });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ message: 'برند حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف برند' });
  }
});

// ========== API تگ‌ها ==========
app.get('/api/tags', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM tags ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت تگ‌ها' });
  }
});

app.post('/api/tags', async (req, res) => {
  const { name, enabled } = req.body;
  try {
    const [result] = await promisePool.query('INSERT INTO tags (name, enabled) VALUES (?, ?)', [name, enabled !== undefined ? enabled : true]);
    const [rows] = await promisePool.query('SELECT * FROM tags WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن تگ' });
  }
});

app.put('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  const { name, enabled } = req.body;
  try {
    await promisePool.query('UPDATE tags SET name=?, enabled=? WHERE id=?', [name, enabled, id]);
    const [rows] = await promisePool.query('SELECT * FROM tags WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی تگ' });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ message: 'تگ حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف تگ' });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 سرور روی پورت ${PORT} در حال اجراست`);
});
