const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'aseman_user',
  host: 'localhost',
  database: 'aseman_db',
  password: 'aseman_password',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('❌ خطا در اتصال به PostgreSQL:', err);
  } else {
    console.log('✅ متصل به PostgreSQL شد');
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ========== PRODUCTS API ==========

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      ORDER BY p.id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در دریافت محصولات' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در دریافت محصول' });
  }
});

app.get('/api/products/code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.sku = $1
    `, [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در دریافت محصول' });
  }
});

app.post('/api/products', async (req, res) => {
  const { productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, category, size, glaze, color, images, tags, audience } = req.body;
  
  const finalSku = productcode;
  
  try {
    if (!finalSku) return res.status(400).json({ success: false, error: 'کد محصول الزامی است' });
    if (!name) return res.status(400).json({ success: false, error: 'نام محصول الزامی است' });
    
    const existing = await pool.query('SELECT id FROM products WHERE sku = $1', [finalSku]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: `کد محصول "${finalSku}" قبلاً وجود دارد` });
    }
    
    const result = await pool.query(`
      INSERT INTO products (sku, grade, name, price_public, price_partner, discount, description, brand, category, size, glaze, color, images, tags, audience)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [finalSku, grade, name, price || 0, partnerprice || 0, discount || 0, description, manufacturer, category, size, glaze, color, images || [], tags || [], audience || 'all']);
    
    const product = result.rows[0];
    
    await pool.query(`
      INSERT INTO inventory (product_id, stock_quantity, reserved_stock)
      VALUES ($1, $2, 0)
    `, [product.id, stock || 0]);
    
    res.status(201).json({ 
      success: true, 
      data: { ...product, stock_quantity: stock || 0 },
      message: 'محصول با موفقیت اضافه شد'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در اضافه کردن محصول: ' + err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { productcode, grade, name, price, partnerprice, discount, stock, description, manufacturer, category, size, glaze, color, images, tags, audience } = req.body;
  
  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (productcode !== undefined) {
      updates.push(`sku = $${paramCount++}`);
      values.push(productcode);
    }
    if (grade !== undefined) {
      updates.push(`grade = $${paramCount++}`);
      values.push(grade);
    }
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (price !== undefined) {
      updates.push(`price_public = $${paramCount++}`);
      values.push(price);
    }
    if (partnerprice !== undefined) {
      updates.push(`price_partner = $${paramCount++}`);
      values.push(partnerprice);
    }
    if (discount !== undefined) {
      updates.push(`discount = $${paramCount++}`);
      values.push(discount);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (manufacturer !== undefined) {
      updates.push(`brand = $${paramCount++}`);
      values.push(manufacturer);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (size !== undefined) {
      updates.push(`size = $${paramCount++}`);
      values.push(size);
    }
    if (glaze !== undefined) {
      updates.push(`glaze = $${paramCount++}`);
      values.push(glaze);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount++}`);
      values.push(images);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramCount++}`);
      values.push(tags);
    }
    if (audience !== undefined) {
      updates.push(`audience = $${paramCount++}`);
      values.push(audience);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length > 1) {
      values.push(id);
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount}`;
      await pool.query(query, values);
    }
    
    if (stock !== undefined) {
      await pool.query(`
        UPDATE inventory SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2
      `, [stock, id]);
    }
    
    const result = await pool.query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
    `, [id]);
    
    res.json({ success: true, data: result.rows[0], message: 'محصول با موفقیت به‌روزرسانی شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در به‌روزرسانی محصول: ' + err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    res.json({ success: true, message: 'محصول حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در حذف محصول' });
  }
});

// ========== BRANDS API ==========

app.get('/api/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت برندها' });
  }
});

app.get('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'برند یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت برند' });
  }
});

app.post('/api/brands', async (req, res) => {
  const { name, enabled } = req.body;
  if (!name) return res.status(400).json({ error: 'نام برند الزامی است' });
  try {
    const existing = await pool.query('SELECT id FROM brands WHERE name = $1', [name]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'این برند قبلاً وجود دارد' });
    const result = await pool.query(
      'INSERT INTO brands (name, enabled) VALUES ($1, $2) RETURNING *',
      [name, enabled !== undefined ? enabled : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن برند' });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  const { name, enabled } = req.body;
  try {
    const result = await pool.query(
      'UPDATE brands SET name = $1, enabled = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, enabled, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'برند یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی برند' });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'برند یافت نشد' });
    res.json({ message: 'برند حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف برند' });
  }
});

// ========== TAGS API ==========

app.get('/api/tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت تگ‌ها' });
  }
});

app.get('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'تگ یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت تگ' });
  }
});

app.post('/api/tags', async (req, res) => {
  const { name, enabled } = req.body;
  if (!name) return res.status(400).json({ error: 'نام تگ الزامی است' });
  try {
    const existing = await pool.query('SELECT id FROM tags WHERE name = $1', [name]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'این تگ قبلاً وجود دارد' });
    const result = await pool.query(
      'INSERT INTO tags (name, enabled) VALUES ($1, $2) RETURNING *',
      [name, enabled !== undefined ? enabled : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن تگ' });
  }
});

app.put('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  const { name, enabled } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tags SET name = $1, enabled = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, enabled, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'تگ یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی تگ' });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'تگ یافت نشد' });
    res.json({ message: 'تگ حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف تگ' });
  }
});

// ========== EMPLOYEES API ==========

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, permissions, is_active, created_at FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت کارمندان' });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, email, permissions, is_active, created_at FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کارمند یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت کارمند' });
  }
});

app.post('/api/employees', async (req, res) => {
  const { name, email, password, permissions } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'نام، ایمیل و رمز عبور الزامی است' });
  }
  try {
    const existing = await pool.query('SELECT id FROM employees WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است' });
    }
    const result = await pool.query(
      'INSERT INTO employees (name, email, password, permissions, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, name, email, permissions, is_active, created_at',
      [name, email, password, permissions || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن کارمند' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, permissions, is_active } = req.body;
  try {
    let query = 'UPDATE employees SET name = COALESCE($1, name), email = COALESCE($2, email), permissions = COALESCE($3, permissions), is_active = COALESCE($4, is_active), updated_at = CURRENT_TIMESTAMP';
    const params = [name, email, permissions, is_active];
    
    if (password) {
      query += ', password = $5';
      params.push(password);
    }
    
    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING id, name, email, permissions, is_active, created_at';
    params.push(id);
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کارمند یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی کارمند' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کارمند یافت نشد' });
    res.json({ message: 'کارمند حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف کارمند' });
  }
});

app.post('/api/employees/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, name, email, permissions, is_active FROM employees WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }
    if (!result.rows[0].is_active) {
      return res.status(403).json({ error: 'حساب کاربری شما غیرفعال است' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

// ========== USERS API ==========

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, mobile, email, type, is_active, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت کاربران' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, mobile, email, type, is_active, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت کاربر' });
  }
});

app.get('/api/users/mobile/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    const result = await pool.query('SELECT id, name, mobile, email, type, is_active, created_at FROM users WHERE mobile = $1', [mobile]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت کاربر' });
  }
});

app.post('/api/users/register', async (req, res) => {
  const { name, mobile, email, password, type } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ error: 'نام و شماره موبایل الزامی است' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'این شماره موبایل قبلاً ثبت شده است' });
    }
    const result = await pool.query(
      'INSERT INTO users (name, mobile, email, password, type, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, mobile, email, type, is_active, created_at',
      [name, mobile, email || null, password || null, type || 'customer']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ثبت نام کاربر: ' + err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'شماره موبایل الزامی است' });
  }
  try {
    const result = await pool.query('SELECT id, name, mobile, email, type, is_active, created_at FROM users WHERE mobile = $1', [mobile]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'کاربر یافت نشد' });
    }
    const user = result.rows[0];
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'رمز عبور اشتباه است' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'حساب کاربری شما غیرفعال است' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, mobile, email, password, type, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), mobile = COALESCE($2, mobile), email = COALESCE($3, email), type = COALESCE($4, type), is_active = COALESCE($5, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, mobile, email, type, is_active, created_at',
      [name, mobile, email, type, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی کاربر' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'کاربر یافت نشد' });
    res.json({ message: 'کاربر حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف کاربر' });
  }
});

// ========== PARTNERS API ==========

app.get('/api/partners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partners ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌های همکاری' });
  }
});

app.post('/api/partners', async (req, res) => {
  const { user_id, company_name, city, address } = req.body;
  if (!user_id) return res.status(400).json({ error: 'شناسه کاربر الزامی است' });
  try {
    const result = await pool.query(
      'INSERT INTO partners (user_id, company_name, city, address, is_approved) VALUES ($1, $2, $3, $4, false) RETURNING *',
      [user_id, company_name, city, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در افزودن درخواست همکاری' });
  }
});

app.put('/api/partners/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE partners SET is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'درخواست همکاری تأیید شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در تأیید درخواست همکاری' });
  }
});

app.delete('/api/partners/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM partners WHERE id = $1', [id]);
    res.json({ message: 'درخواست همکاری حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف درخواست همکاری' });
  }
});

// ========== BLOG API ==========

app.get('/api/blog', async (req, res) => {
  const { homepage } = req.query;
  try {
    let query = 'SELECT * FROM blog_posts ORDER BY created_at DESC';
    let params = [];
    
    if (homepage === 'true') {
      query = 'SELECT * FROM blog_posts WHERE show_on_homepage = true ORDER BY created_at DESC LIMIT 3';
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت پست‌ها' });
  }
});

app.get('/api/blog/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت پست' });
  }
});

app.get('/api/blog/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت پست' });
  }
});

app.post('/api/blog', async (req, res) => {
  const { title, slug, excerpt, content, image, status } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ error: 'عنوان، اسلاگ و متن اصلی الزامی است' });
  }
  try {
    const existing = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'این اسلاگ قبلاً استفاده شده است' });
    }
    const result = await pool.query(
      'INSERT INTO blog_posts (title, slug, excerpt, content, image, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, slug, excerpt || null, content, image || null, status || 'published']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در اضافه کردن پست' });
  }
});

app.put('/api/blog/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, image, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE blog_posts SET title = COALESCE($1, title), slug = COALESCE($2, slug), excerpt = COALESCE($3, excerpt), content = COALESCE($4, content), image = COALESCE($5, image), status = COALESCE($6, status), updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, slug, excerpt, content, image, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی پست' });
  }
});

app.delete('/api/blog/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json({ message: 'پست حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف پست' });
  }
});

// به‌روزرسانی وضعیت نمایش در صفحه اصلی
app.patch('/api/blog/:id/toggle-homepage', async (req, res) => {
  const { id } = req.params;
  const { show_on_homepage } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE blog_posts SET show_on_homepage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [show_on_homepage, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'پست یافت نشد' });
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: show_on_homepage ? 'مقاله در صفحه اصلی نمایش داده می‌شود' : 'مقاله از صفحه اصلی حذف شد'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی وضعیت مقاله' });
  }
});

// ========== CONTACT REQUESTS API ==========

app.get('/api/contact', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت درخواست‌ها' });
  }
});

app.get('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM contact_requests WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'درخواست یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت درخواست' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, mobile, city, area_m2, message } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ error: 'نام و شماره موبایل الزامی است' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO contact_requests (name, mobile, city, area_m2, message, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, mobile, city || null, area_m2 || null, message || null, 'new']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ثبت درخواست' });
  }
});

app.patch('/api/contact/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['new', 'contacted', 'followed'].includes(status)) {
    return res.status(400).json({ error: 'وضعیت نامعتبر است' });
  }
  try {
    const result = await pool.query(
      'UPDATE contact_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'درخواست یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در تغییر وضعیت' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM contact_requests WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'درخواست یافت نشد' });
    res.json({ message: 'درخواست حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف درخواست' });
  }
});

// ========== SETTINGS API ==========

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت تنظیمات' });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    await pool.query(
      'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [key, value]
    );
    res.json({ message: 'تنظیمات ذخیره شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ذخیره تنظیمات' });
  }
});

// ========== PRODUCT TEMPLATES API ==========

app.get('/api/product-templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_templates ORDER BY size');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در دریافت قالب‌ها' });
  }
});

app.post('/api/product-templates', async (req, res) => {
  const { size, glaze_type, title, description, usage_guide, maintenance } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO product_templates (size, glaze_type, title, description, usage_guide, maintenance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [size, glaze_type, title, description, usage_guide, maintenance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در افزودن قالب' });
  }
});

app.put('/api/product-templates/:id', async (req, res) => {
  const { id } = req.params;
  const { size, glaze_type, title, description, usage_guide, maintenance } = req.body;
  try {
    const result = await pool.query(
      'UPDATE product_templates SET size = $1, glaze_type = $2, title = $3, description = $4, usage_guide = $5, maintenance = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [size, glaze_type, title, description, usage_guide, maintenance, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'قالب یافت نشد' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در به‌روزرسانی قالب' });
  }
});

app.delete('/api/product-templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM product_templates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'قالب یافت نشد' });
    res.json({ message: 'قالب حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در حذف قالب' });
  }
});

// ========== QUOTES API ==========

app.get('/api/quotes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotes ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در دریافت پیش‌فاکتورها' });
  }
});

app.get('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quoteResult = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    const itemsResult = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    const quote = quoteResult.rows[0];
    quote.items = itemsResult.rows;
    res.json({ success: true, data: quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در دریافت پیش‌فاکتور' });
  }
});

app.post('/api/quotes', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      customer_name, customer_mobile, customer_phone, customer_email,
      customer_economic_code, customer_postal_code, customer_address,
      issue_date, expires_at, payment_terms, credit_duration,
      delivery_location, prepayment_amount, discount_amount, tax_amount,
      notes, items, created_by
    } = req.body;
    
    if (!customer_name || !customer_mobile) {
      return res.status(400).json({ success: false, error: 'نام و شماره موبایل مشتری الزامی است' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'حداقل یک محصول باید اضافه شود' });
    }
    
    let total_amount = 0;
    for (const item of items) {
      total_amount += (item.price || 0) * (item.quantity || 0);
    }
    
    const discount = parseFloat(discount_amount) || 0;
    const tax = parseFloat(tax_amount) || 0;
    const final_amount = total_amount - discount + tax;
    
    const quoteResult = await client.query(`
      INSERT INTO quotes (
        customer_name, customer_mobile, customer_phone, customer_email,
        customer_economic_code, customer_postal_code, customer_address,
        issue_date, expires_at, status, payment_terms, credit_duration,
        delivery_location, prepayment_amount, discount_amount, tax_amount,
        total_amount, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      customer_name, customer_mobile, customer_phone || null, customer_email || null,
      customer_economic_code || null, customer_postal_code || null, customer_address || null,
      issue_date || new Date(), expires_at || null, 'issued',
      payment_terms || null, credit_duration || null, delivery_location || null,
      prepayment_amount || 0, discount, tax, final_amount,
      notes || null, created_by || null
    ]);
    
    const quote = quoteResult.rows[0];
    
    for (const item of items) {
      await client.query(`
        INSERT INTO quote_items (
          quote_id, product_id, product_name, product_specs,
          quantity, unit, price, total, discount_percent, tax_percent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        quote.id, item.product_id || null, item.product_name, item.product_specs || null,
        item.quantity, item.unit || 'متر مربع', item.price,
        item.price * item.quantity, item.discount_percent || 0, item.tax_percent || 0
      ]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true, 
      data: quote, 
      message: 'پیش‌فاکتور با موفقیت ایجاد شد' 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در ایجاد پیش‌فاکتور: ' + err.message });
  } finally {
    client.release();
  }
});

app.patch('/api/quotes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['submitted', 'reviewing', 'issued', 'waiting_customer', 'preparing', 'completed', 'final_confirmed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'وضعیت نامعتبر است' });
  }
  
  try {
    const result = await pool.query(`
      UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در تغییر وضعیت' });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    res.json({ success: true, message: 'پیش‌فاکتور حذف شد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'خطا در حذف پیش‌فاکتور' });
  }
});

// ========== PDF GENERATION ==========

// مسیر فونت‌ها
const fontsDir = path.join(__dirname, 'fonts');
const vazirRegular = path.join(fontsDir, 'Vazir-Regular.ttf');
const vazirBold = path.join(fontsDir, 'Vazir-Bold.ttf');

app.get('/api/quotes/:id/pdf', async (req, res) => {
  const { id } = req.params;
  
  try {
    const quoteResult = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    const quote = quoteResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    const items = itemsResult.rows;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quote_${quote.quote_number || id}.pdf`);
    
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 50 });
    doc.pipe(res);
    
    // ثبت فونت فارسی (در صورت وجود)
    if (fs.existsSync(vazirRegular)) {
      doc.registerFont('Vazir', vazirRegular);
      doc.registerFont('Vazir-Bold', vazirBold);
    }
    
    const mainFont = fs.existsSync(vazirRegular) ? 'Vazir' : 'Helvetica';
    const boldFont = fs.existsSync(vazirBold) ? 'Vazir-Bold' : 'Helvetica-Bold';
    
    doc.font(mainFont);
    
    // هدر با لوگو
    const logoPath = path.join(__dirname, '../frontend/public/images/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }
    
    doc.font(boldFont).fontSize(22)
      .text('بازرگانی کاشی و سرامیک آسمان', 0, 50, { align: 'center' });
    
    doc.font(mainFont).fontSize(10)
      .text('شیراز، بلوار پاسداران، نبش کوچه 60، طبقه دوم بانک سیه', { align: 'center' })
      .text('تلفن: 07143333333 | ایمیل: info@asemantile.com', { align: 'center' });
    
    doc.moveDown();
    doc.strokeColor('#1c7385').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // عنوان پیش‌فاکتور
    doc.font(boldFont).fontSize(16).fillColor('#1c7385')
      .text('پیش‌فاکتور', { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(0.5);
    
    // اطلاعات پیش‌فاکتور
    const startY = doc.y;
    doc.fontSize(10).font(mainFont);
    
    doc.text(`شماره: ${quote.quote_number || `PF-${quote.id}`}`, 350, startY);
    doc.text(`تاریخ صدور: ${new Date(quote.issue_date).toLocaleDateString('fa-IR')}`, 350, startY + 20);
    if (quote.expires_at) {
      doc.text(`تاریخ اعتبار: ${new Date(quote.expires_at).toLocaleDateString('fa-IR')}`, 350, startY + 40);
    }
    
    doc.font(boldFont).text('مشتری:', 50, startY);
    doc.font(mainFont);
    doc.text(`نام: ${quote.customer_name}`, 50, startY + 20);
    doc.text(`شماره موبایل: ${quote.customer_mobile}`, 50, startY + 40);
    if (quote.customer_phone) doc.text(`تلفن: ${quote.customer_phone}`, 50, startY + 60);
    if (quote.customer_email) doc.text(`ایمیل: ${quote.customer_email}`, 50, startY + 80);
    if (quote.customer_economic_code) doc.text(`کد اقتصادی: ${quote.customer_economic_code}`, 50, startY + 100);
    if (quote.customer_address) doc.text(`آدرس: ${quote.customer_address}`, 50, startY + 120, { width: 250 });
    
    doc.moveDown(6);
    
    // جدول محصولات
    const tableTop = doc.y;
    const tableHeaders = ['ردیف', 'نام محصول', 'تعداد', 'قیمت واحد', 'جمع'];
    const colWidths = [35, 230, 55, 100, 80];
    
    // پس‌زمینه هدر
    doc.rect(50, tableTop, 500, 22).fill('#1c7385');
    doc.fillColor('white').font(boldFont).fontSize(10);
    
    let x = 50;
    for (let i = 0; i < tableHeaders.length; i++) {
      doc.text(tableHeaders[i], x + (colWidths[i] / 2), tableTop + 5, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    }
    
    doc.fillColor('black');
    doc.moveTo(50, tableTop + 22).lineTo(550, tableTop + 22).stroke();
    
    doc.font(mainFont).fontSize(9);
    let y = tableTop + 30;
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      x = 50;
      doc.text((i + 1).toString(), x + (colWidths[0] / 2), y, { width: colWidths[0], align: 'center' });
      x += colWidths[0];
      doc.text(item.product_name || '—', x, y, { width: colWidths[1] });
      x += colWidths[1];
      doc.text(item.quantity.toString(), x + (colWidths[2] / 2), y, { width: colWidths[2], align: 'center' });
      x += colWidths[2];
      doc.text(item.price.toLocaleString(), x + (colWidths[3] / 2), y, { width: colWidths[3], align: 'center' });
      x += colWidths[3];
      doc.text(itemTotal.toLocaleString(), x + (colWidths[4] / 2), y, { width: colWidths[4], align: 'center' });
      
      y += 20;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }
    
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // جمع کل
    const discount = parseFloat(quote.discount_amount) || 0;
    const tax = parseFloat(quote.tax_amount) || 0;
    const finalTotal = total - discount + tax;
    
    doc.font(boldFont);
    doc.text(`جمع کل: ${total.toLocaleString()} تومان`, 380, y);
    if (discount > 0) {
      doc.text(`تخفیف: ${discount.toLocaleString()} تومان`, 380, y + 18);
    }
    if (tax > 0) {
      doc.text(`مالیات: ${tax.toLocaleString()} تومان`, 380, y + 36);
    }
    doc.font(boldFont).fontSize(12).fillColor('#1c7385');
    doc.text(`مبلغ قابل پرداخت: ${finalTotal.toLocaleString()} تومان`, 380, y + 58);
    doc.fillColor('black');
    
    // شرایط فروش
    let condY = y + 90;
    doc.font(mainFont).fontSize(9);
    if (quote.payment_terms) {
      doc.text(`شرایط فروش: ${quote.payment_terms}`, 50, condY);
      condY += 15;
    }
    if (quote.credit_duration) {
      doc.text(`مدت اعتبار: ${quote.credit_duration}`, 50, condY);
      condY += 15;
    }
    if (quote.delivery_location) {
      doc.text(`محل تحویل: ${quote.delivery_location}`, 50, condY);
      condY += 15;
    }
    if (quote.prepayment_amount > 0) {
      doc.text(`پیش‌پرداخت: ${quote.prepayment_amount.toLocaleString()} تومان`, 50, condY);
    }
    
    if (quote.notes) {
      doc.moveDown();
      doc.font(boldFont).text('توضیحات:');
      doc.font(mainFont).text(quote.notes, { width: 500 });
    }
    
    const pageHeight = doc.page.height;
    doc.fontSize(8).font(mainFont).fillColor('#666666');
    doc.text('از انتخاب شما متشکریم', 0, pageHeight - 40, { align: 'center' });
    doc.text(`تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}`, 0, pageHeight - 25, { align: 'center' });
    doc.fillColor('black');
    
    doc.end();
    
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, error: 'خطا در تولید PDF' });
  }
});

// ========== START SERVER ==========
const PORT = 5003;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🏷️ Brands: http://localhost:${PORT}/api/brands`);
  console.log(`🔖 Tags: http://localhost:${PORT}/api/tags`);
  console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
  console.log(`👤 Users: http://localhost:${PORT}/api/users`);
  console.log(`🤝 Partners: http://localhost:${PORT}/api/partners`);
  console.log(`📝 Blog: http://localhost:${PORT}/api/blog`);
  console.log(`📞 Contact: http://localhost:${PORT}/api/contact`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/api/settings`);
  console.log(`📋 Templates: http://localhost:${PORT}/api/product-templates`);
  console.log(`📄 Quotes: http://localhost:${PORT}/api/quotes`);
  console.log(`🖨️ PDF: http://localhost:${PORT}/api/quotes/:id/pdf\n`);
});
