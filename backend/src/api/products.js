// backend/src/api/products.js
import express from 'express';
import { query } from '../utils/db.js';

const router = express.Router();

const normalizeProduct = (row) => ({
  id: row.id,
  productcode: row.sku,
  grade: row.grade || '',
  name: row.name,
  price: Number(row.price_public) || 0,
  partnerprice: Number(row.price_partner) || 0,
  discount: row.discount || 0,
  stock: Number(row.stock_quantity) || 0,
  description: row.description || '',
  manufacturer: row.brand || '',
  glazetype: row.glaze_type || '',
  suitablefor: row.suitable_for || '',
  category: row.category || '',
  size: row.size || '',
  glaze: row.glaze || '',
  color: row.color || '',
  images: row.images || [],
  fulldescription: row.full_description || '',
  tags: row.tags || [],
  audience: row.audience || 'all',
  created_at: row.created_at,
  updated_at: row.updated_at
});

// GET /api/products - دریافت همه محصولات
router.get('/', async (req, res) => {
  try {
    const { category, manufacturer, tag, min_price, max_price, search, sort_by, sort_order, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT p.*, 
             COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    
    if (category) {
      sql += ` AND p.category = $${idx++}`;
      params.push(category);
    }
    if (manufacturer) {
      sql += ` AND p.brand = $${idx++}`;
      params.push(manufacturer);
    }
    if (min_price) {
      sql += ` AND p.price_public >= $${idx++}`;
      params.push(min_price);
    }
    if (max_price) {
      sql += ` AND p.price_public <= $${idx++}`;
      params.push(max_price);
    }
    if (search) {
      sql += ` AND (p.name ILIKE $${idx++} OR p.sku ILIKE $${idx++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // مرتب‌سازی
    const sortField = sort_by === 'price' ? 'p.price_public' : (sort_by === 'name' ? 'p.name' : 'p.created_at');
    const sortOrderDir = sort_order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrderDir}`;
    
    // صفحه‌بندی
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit), offset);
    
    const result = await query(sql, params);
    
    // دریافت تعداد کل برای صفحه‌بندی
    const countResult = await query('SELECT COUNT(*) as total FROM products');
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: result.rows.map(normalizeProduct),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - دریافت محصول با ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    
    res.json({ success: true, data: normalizeProduct(result.rows[0]) });
  } catch (error) {
    console.error('GET /api/products/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/code/:code - دریافت محصول با کد
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.sku = $1
    `, [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    
    res.json({ success: true, data: normalizeProduct(result.rows[0]) });
  } catch (error) {
    console.error('GET /api/products/code/:code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - ایجاد محصول جدید
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data.name || !data.price) {
      return res.status(400).json({ success: false, error: 'نام و قیمت محصول الزامی است' });
    }
    
    // بررسی تکراری نبودن SKU
    if (data.productcode) {
      const existing = await query('SELECT id FROM products WHERE sku = $1', [data.productcode]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, error: `کد محصول "${data.productcode}" قبلاً وجود دارد` });
      }
    }
    
    // افزودن محصول
    const result = await query(`
      INSERT INTO products (
        sku, grade, name, price_public, price_partner, discount, 
        description, brand, glaze_type, suitable_for, category, 
        size, glaze, color, images, full_description, tags, audience
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      data.productcode || null,
      data.grade || null,
      data.name,
      data.price || 0,
      data.partnerprice || 0,
      data.discount || 0,
      data.description || null,
      data.manufacturer || null,
      data.glazetype || null,
      data.suitablefor || null,
      data.category || null,
      data.size || null,
      data.glaze || null,
      data.color || null,
      data.images || [],
      data.fulldescription || null,
      data.tags || [],
      data.audience || 'all'
    ]);
    
    const product = result.rows[0];
    
    // ایجاد موجودی اولیه
    await query(`
      INSERT INTO inventory (product_id, stock_quantity, reserved_stock)
      VALUES ($1, $2, 0)
    `, [product.id, data.stock || 0]);
    
    res.status(201).json({
      success: true,
      data: normalizeProduct({ ...product, stock_quantity: data.stock || 0 }),
      message: 'محصول با موفقیت اضافه شد'
    });
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - به‌روزرسانی محصول
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    // بررسی وجود محصول
    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    
    // بررسی تکراری نبودن SKU
    if (updates.productcode && updates.productcode !== existing.rows[0].sku) {
      const duplicate = await query('SELECT id FROM products WHERE sku = $1 AND id != $2', [updates.productcode, id]);
      if (duplicate.rows.length > 0) {
        return res.status(409).json({ success: false, error: `کد محصول "${updates.productcode}" قبلاً وجود دارد` });
      }
    }
    
    // به‌روزرسانی محصول
    await query(`
      UPDATE products SET
        sku = COALESCE($1, sku),
        grade = COALESCE($2, grade),
        name = COALESCE($3, name),
        price_public = COALESCE($4, price_public),
        price_partner = COALESCE($5, price_partner),
        discount = COALESCE($6, discount),
        description = COALESCE($7, description),
        brand = COALESCE($8, brand),
        glaze_type = COALESCE($9, glaze_type),
        suitable_for = COALESCE($10, suitable_for),
        category = COALESCE($11, category),
        size = COALESCE($12, size),
        glaze = COALESCE($13, glaze),
        color = COALESCE($14, color),
        images = COALESCE($15, images),
        full_description = COALESCE($16, full_description),
        tags = COALESCE($17, tags),
        audience = COALESCE($18, audience),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
    `, [
      updates.productcode,
      updates.grade,
      updates.name,
      updates.price,
      updates.partnerprice,
      updates.discount,
      updates.description,
      updates.manufacturer,
      updates.glazetype,
      updates.suitablefor,
      updates.category,
      updates.size,
      updates.glaze,
      updates.color,
      updates.images,
      updates.fulldescription,
      updates.tags,
      updates.audience,
      id
    ]);
    
    // به‌روزرسانی موجودی
    if (updates.stock !== undefined) {
      await query(`
        UPDATE inventory SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2
      `, [updates.stock, id]);
    }
    
    const result = await query(`
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
    `, [id]);
    
    res.json({
      success: true,
      data: normalizeProduct(result.rows[0]),
      message: 'محصول با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('PUT /api/products/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - حذف محصول
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // حذف موجودی (به دلیل CASCADE خودکار حذف می‌شه)
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
    }
    
    res.json({ success: true, message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    console.error('DELETE /api/products/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
