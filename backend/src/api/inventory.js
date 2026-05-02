// backend/src/api/inventory.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
// موجودی محصولات (مرتبط با product id)
let inventory = new Map(); // key: productId, value: { stock_quantity, reserved_stock, updated_at }

// لاگ‌های موجودی
let inventoryLogs = [];

// تابع کمکی برای مقداردهی اولیه موجودی
const initInventory = (productId, stockQuantity = 0) => {
  if (!inventory.has(productId)) {
    inventory.set(productId, {
      product_id: productId,
      stock_quantity: stockQuantity,
      reserved_stock: 0,
      updated_at: new Date().toISOString()
    });
  }
};

// تابع ثبت لاگ
const addInventoryLog = (productId, changeType, quantity, reason, userId = null) => {
  const log = {
    id: inventoryLogs.length + 1,
    product_id: productId,
    change_type: changeType, // increase, decrease, reserve, release
    quantity: Math.abs(quantity),
    reason: reason || 'manual',
    user_id: userId,
    created_at: new Date().toISOString()
  };
  inventoryLogs.unshift(log);
  
  // نگهداری فقط 1000 لاگ آخر
  if (inventoryLogs.length > 1000) {
    inventoryLogs = inventoryLogs.slice(0, 1000);
  }
  
  console.log(`[INVENTORY_LOG] product ${productId}: ${changeType} ${quantity} (${reason})`);
  return log;
};

// ========== GET /api/inventory ==========
// دریافت وضعیت موجودی همه محصولات
router.get('/', async (req, res) => {
  try {
    const { low_stock, product_ids } = req.query;
    
    let results = [];
    
    if (product_ids) {
      // دریافت موجودی محصولات خاص
      const ids = product_ids.split(',').map(id => parseInt(id));
      for (const id of ids) {
        if (inventory.has(id)) {
          results.push(inventory.get(id));
        } else {
          results.push({
            product_id: id,
            stock_quantity: 0,
            reserved_stock: 0,
            available_stock: 0,
            updated_at: new Date().toISOString()
          });
        }
      }
    } else {
      // دریافت همه موجودی‌ها
      for (const [productId, inv] of inventory) {
        results.push({
          ...inv,
          available_stock: inv.stock_quantity - inv.reserved_stock
        });
      }
    }
    
    // فیلتر محصولات با موجودی کم (کمتر از 50 متر)
    if (low_stock === 'true') {
      results = results.filter(r => (r.stock_quantity - r.reserved_stock) < 50);
    }
    
    // مرتب‌سازی بر اساس موجودی قابل فروش (کمترین اول)
    results.sort((a, b) => {
      const availableA = a.stock_quantity - a.reserved_stock;
      const availableB = b.stock_quantity - b.reserved_stock;
      return availableA - availableB;
    });
    
    // آمار کلی
    const stats = {
      total_products: inventory.size,
      total_stock: 0,
      total_reserved: 0,
      total_available: 0,
      low_stock_count: 0
    };
    
    for (const inv of inventory.values()) {
      stats.total_stock += inv.stock_quantity;
      stats.total_reserved += inv.reserved_stock;
      const available = inv.stock_quantity - inv.reserved_stock;
      stats.total_available += available;
      if (available < 50) stats.low_stock_count++;
    }
    
    res.json({ 
      success: true, 
      data: results,
      stats
    });
  } catch (error) {
    console.error('GET /api/inventory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/:productId ==========
// دریافت وضعیت موجودی یک محصول خاص
router.get('/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (!inventory.has(productId)) {
      return res.json({ 
        success: true, 
        data: {
          product_id: productId,
          stock_quantity: 0,
          reserved_stock: 0,
          available_stock: 0,
          updated_at: new Date().toISOString()
        }
      });
    }
    
    const inv = inventory.get(productId);
    res.json({ 
      success: true, 
      data: {
        ...inv,
        available_stock: inv.stock_quantity - inv.reserved_stock
      }
    });
  } catch (error) {
    console.error('GET /api/inventory/:productId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/inventory/:productId ==========
// به‌روزرسانی دستی موجودی یک محصول
router.patch('/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity, reason } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    if (quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'مقدار تغییر موجودی الزامی است' 
      });
    }
    
    // مقداردهی اولیه اگر وجود نداشت
    if (!inventory.has(productId)) {
      initInventory(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const newStockQuantity = inv.stock_quantity + quantity;
    
    if (newStockQuantity < 0) {
      return res.status(400).json({ 
        success: false, 
        error: `موجودی کافی نیست. موجودی فعلی: ${inv.stock_quantity}` 
      });
    }
    
    const changeType = quantity > 0 ? 'increase' : 'decrease';
    inv.stock_quantity = newStockQuantity;
    inv.updated_at = new Date().toISOString();
    
    // ثبت لاگ
    addInventoryLog(productId, changeType, quantity, reason || 'manual', userId);
    
    res.json({ 
      success: true, 
      data: {
        product_id: productId,
        stock_quantity: inv.stock_quantity,
        reserved_stock: inv.reserved_stock,
        available_stock: inv.stock_quantity - inv.reserved_stock,
        updated_at: inv.updated_at
      }
    });
  } catch (error) {
    console.error('PATCH /api/inventory/:productId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/inventory/bulk ==========
// آپدیت گروهی موجودی (از روی اکسل)
router.post('/bulk', async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, stock_quantity }, ...]
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'آرایه‌ای از آیتم‌ها با productId و stock_quantity ارسال کنید' 
      });
    }
    
    const results = {
      success: [],
      failed: [],
      warnings: []
    };
    
    for (const item of items) {
      try {
        const productId = parseInt(item.productId);
        const newStock = parseInt(item.stock_quantity);
        
        if (isNaN(productId) || isNaN(newStock)) {
          results.failed.push({ productId: item.productId, error: 'productId یا stock_quantity نامعتبر' });
          continue;
        }
        
        // مقداردهی اولیه اگر وجود نداشت
        if (!inventory.has(productId)) {
          initInventory(productId, 0);
        }
        
        const inv = inventory.get(productId);
        
        // هشدار اگر موجودی جدید کمتر از رزرو شده باشد
        if (newStock < inv.reserved_stock) {
          results.warnings.push({
            product_id: productId,
            message: `موجودی جدید (${newStock}) کمتر از موجودی رزرو شده (${inv.reserved_stock}) است.`
          });
        }
        
        const quantityChange = newStock - inv.stock_quantity;
        if (quantityChange !== 0) {
          const changeType = quantityChange > 0 ? 'increase' : 'decrease';
          inv.stock_quantity = newStock;
          inv.updated_at = new Date().toISOString();
          
          addInventoryLog(productId, changeType, quantityChange, 'bulk_upload', userId);
          
          results.success.push({
            product_id: productId,
            old_stock: inv.stock_quantity - quantityChange,
            new_stock: newStock
          });
        }
      } catch (err) {
        results.failed.push({ productId: item.productId, error: err.message });
      }
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('POST /api/inventory/bulk error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/inventory/reserve ==========
// رزرو موجودی (برای پیش‌فاکتورها)
router.post('/reserve', async (req, res) => {
  try {
    const { productId, quantity, quoteId } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'productId و quantity الزامی است' 
      });
    }
    
    if (!inventory.has(productId)) {
      initInventory(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const available = inv.stock_quantity - inv.reserved_stock;
    
    if (available < quantity) {
      return res.status(400).json({ 
        success: false, 
        error: `موجودی قابل فروش کافی نیست. موجودی: ${inv.stock_quantity}, رزرو شده: ${inv.reserved_stock}, قابل فروش: ${available}` 
      });
    }
    
    inv.reserved_stock += quantity;
    inv.updated_at = new Date().toISOString();
    
    addInventoryLog(productId, 'reserve', quantity, `quote_${quoteId || 'manual'}`, userId);
    
    res.json({ 
      success: true, 
      data: {
        product_id: productId,
        stock_quantity: inv.stock_quantity,
        reserved_stock: inv.reserved_stock,
        available_stock: inv.stock_quantity - inv.reserved_stock
      }
    });
  } catch (error) {
    console.error('POST /api/inventory/reserve error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/inventory/release ==========
// آزادسازی رزرو موجودی
router.post('/release', async (req, res) => {
  try {
    const { productId, quantity, quoteId } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'productId و quantity الزامی است' 
      });
    }
    
    if (!inventory.has(productId)) {
      initInventory(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const newReservedStock = Math.max(0, inv.reserved_stock - quantity);
    
    inv.reserved_stock = newReservedStock;
    inv.updated_at = new Date().toISOString();
    
    addInventoryLog(productId, 'release', quantity, `quote_${quoteId || 'manual'}_released`, userId);
    
    res.json({ 
      success: true, 
      data: {
        product_id: productId,
        stock_quantity: inv.stock_quantity,
        reserved_stock: inv.reserved_stock,
        available_stock: inv.stock_quantity - inv.reserved_stock
      }
    });
  } catch (error) {
    console.error('POST /api/inventory/release error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/check/:productId ==========
// بررسی موجودی قابل فروش برای یک مقدار درخواستی
router.get('/check/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.query;
    
    if (!inventory.has(productId)) {
      initInventory(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const available = inv.stock_quantity - inv.reserved_stock;
    const requested = quantity ? parseInt(quantity) : null;
    
    res.json({
      success: true,
      data: {
        product_id: productId,
        stock_quantity: inv.stock_quantity,
        reserved_stock: inv.reserved_stock,
        available_stock: available,
        requested_quantity: requested,
        is_available: requested ? available >= requested : null
      }
    });
  } catch (error) {
    console.error('GET /api/inventory/check/:productId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/logs/:productId ==========
// دریافت لاگ‌های موجودی یک محصول
router.get('/logs/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { limit = 50 } = req.query;
    
    const logs = inventoryLogs
      .filter(log => log.product_id === productId)
      .slice(0, parseInt(limit));
    
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('GET /api/inventory/logs/:productId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/logs ==========
// دریافت همه لاگ‌های موجودی با فیلتر
router.get('/logs', async (req, res) => {
  try {
    const { change_type, from_date, to_date, limit = 100, offset = 0 } = req.query;
    
    let filtered = [...inventoryLogs];
    
    if (change_type) {
      filtered = filtered.filter(log => log.change_type === change_type);
    }
    
    if (from_date) {
      const from = new Date(from_date);
      filtered = filtered.filter(log => new Date(log.created_at) >= from);
    }
    
    if (to_date) {
      const to = new Date(to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.created_at) <= to);
    }
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({ 
      success: true, 
      data: paginated,
      pagination: {
        total: filtered.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('GET /api/inventory/logs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/logs/recent/changes ==========
// دریافت آخرین تغییرات موجودی (برای تابلوی اعلانات)
router.get('/logs/recent/changes', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const recentChanges = inventoryLogs.slice(0, parseInt(limit));
    
    res.json({ success: true, data: recentChanges });
  } catch (error) {
    console.error('GET /api/inventory/logs/recent/changes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/inventory/stats/summary ==========
// خلاصه آماری موجودی (برای داشبورد)
router.get('/stats/summary', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // محاسبه تاریخ شروع
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const recentLogs = inventoryLogs.filter(log => new Date(log.created_at) >= startDate);
    
    const summary = {
      total_products: inventory.size,
      total_stock: 0,
      total_reserved: 0,
      total_available: 0,
      low_stock_count: 0,
      recent_changes: {
        increase: recentLogs.filter(log => log.change_type === 'increase').length,
        decrease: recentLogs.filter(log => log.change_type === 'decrease').length,
        reserve: recentLogs.filter(log => log.change_type === 'reserve').length,
        release: recentLogs.filter(log => log.change_type === 'release').length,
        total: recentLogs.length
      }
    };
    
    for (const inv of inventory.values()) {
      summary.total_stock += inv.stock_quantity;
      summary.total_reserved += inv.reserved_stock;
      const available = inv.stock_quantity - inv.reserved_stock;
      summary.total_available += available;
      if (available < 50) summary.low_stock_count++;
    }
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('GET /api/inventory/stats/summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/inventory/init/:productId ==========
// مقداردهی اولیه موجودی برای محصول جدید
router.post('/init/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { stock_quantity = 0 } = req.body;
    
    if (inventory.has(productId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'این محصول قبلاً موجودی دارد. برای تغییر از PATCH استفاده کنید.' 
      });
    }
    
    initInventory(productId, stock_quantity);
    const inv = inventory.get(productId);
    
    addInventoryLog(productId, 'increase', stock_quantity, 'initial_creation', null);
    
    res.status(201).json({ 
      success: true, 
      data: {
        product_id: productId,
        stock_quantity: inv.stock_quantity,
        reserved_stock: inv.reserved_stock,
        available_stock: inv.stock_quantity - inv.reserved_stock
      }
    });
  } catch (error) {
    console.error('POST /api/inventory/init/:productId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
