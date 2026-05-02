// backend/src/models/Inventory.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let inventory = new Map(); // key: productId, value: inventory object
let inventoryLogs = [];
let logIdCounter = 1;

// ========== کلاس Inventory ==========
class Inventory {
  // نرمالایز کردن موجودی
  static normalize(inv) {
    return {
      productId: inv.product_id,
      stockQuantity: inv.stock_quantity,
      reservedStock: inv.reserved_stock,
      availableStock: inv.stock_quantity - inv.reserved_stock,
      updatedAt: inv.updated_at
    };
  }
  
  // نرمالایز کردن لاگ
  static normalizeLog(log) {
    return {
      id: log.id,
      productId: log.product_id,
      productName: log.product_name,
      productCode: log.product_code,
      changeType: log.change_type,
      quantity: log.quantity,
      oldStock: log.old_stock,
      newStock: log.new_stock,
      reason: log.reason,
      userId: log.user_id,
      userName: log.user_name,
      createdAt: log.created_at
    };
  }
  
  // مقداردهی اولیه موجودی برای محصول جدید
  static async init(productId, stockQuantity = 0) {
    if (inventory.has(productId)) {
      throw new Error('این محصول قبلاً موجودی دارد');
    }
    
    const newInventory = {
      product_id: productId,
      stock_quantity: stockQuantity,
      reserved_stock: 0,
      updated_at: new Date().toISOString()
    };
    
    inventory.set(productId, newInventory);
    
    // ثبت لاگ اولیه
    await this.addLog({
      product_id: productId,
      change_type: 'increase',
      quantity: stockQuantity,
      old_stock: 0,
      new_stock: stockQuantity,
      reason: 'initial_creation'
    });
    
    return this.normalize(newInventory);
  }
  
  // دریافت موجودی یک محصول
  static async getByProductId(productId) {
    if (!inventory.has(productId)) {
      return {
        productId,
        stockQuantity: 0,
        reservedStock: 0,
        availableStock: 0,
        updatedAt: new Date().toISOString()
      };
    }
    
    return this.normalize(inventory.get(productId));
  }
  
  // دریافت موجودی چند محصول همزمان
  static async getMultiple(productIds) {
    const results = [];
    for (const id of productIds) {
      results.push(await this.getByProductId(parseInt(id)));
    }
    return results;
  }
  
  // دریافت همه موجودی‌ها
  static async getAll(filters = {}) {
    const results = [];
    
    for (const [productId, inv] of inventory) {
      results.push(this.normalize(inv));
    }
    
    // اضافه کردن محصولاتی که موجودی ندارند (موجودی صفر)
    // اینجا فعلاً فقط محصولات دارای موجودی را برمی‌گرداند
    
    // فیلتر محصولات با موجودی کم
    if (filters.low_stock === 'true') {
      const threshold = filters.threshold || 50;
      return results.filter(r => r.availableStock < threshold);
    }
    
    // مرتب‌سازی بر اساس موجودی قابل فروش
    results.sort((a, b) => a.availableStock - b.availableStock);
    
    return results;
  }
  
  // به‌روزرسانی موجودی (افزایش یا کاهش)
  static async updateStock(productId, quantity, reason, userId = null) {
    if (!inventory.has(productId)) {
      await this.init(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const oldStock = inv.stock_quantity;
    const newStock = oldStock + quantity;
    
    if (newStock < 0) {
      throw new Error(`موجودی کافی نیست. موجودی فعلی: ${oldStock}`);
    }
    
    inv.stock_quantity = newStock;
    inv.updated_at = new Date().toISOString();
    
    const changeType = quantity > 0 ? 'increase' : 'decrease';
    
    await this.addLog({
      product_id: productId,
      change_type: changeType,
      quantity: Math.abs(quantity),
      old_stock: oldStock,
      new_stock: newStock,
      reason: reason || 'manual',
      user_id: userId
    });
    
    return this.normalize(inv);
  }
  
  // رزرو موجودی (برای پیش‌فاکتورها)
  static async reserveStock(productId, quantity, quoteId, userId = null) {
    if (!inventory.has(productId)) {
      await this.init(productId, 0);
    }
    
    const inv = inventory.get(productId);
    const available = inv.stock_quantity - inv.reserved_stock;
    
    if (available < quantity) {
      throw new Error(`موجودی قابل فروش کافی نیست. موجودی: ${inv.stock_quantity}, رزرو شده: ${inv.reserved_stock}, قابل فروش: ${available}`);
    }
    
    const oldReserved = inv.reserved_stock;
    inv.reserved_stock += quantity;
    inv.updated_at = new Date().toISOString();
    
    await this.addLog({
      product_id: productId,
      change_type: 'reserve',
      quantity: quantity,
      old_stock: inv.stock_quantity,
      new_stock: inv.stock_quantity,
      reserved_change: quantity,
      old_reserved: oldReserved,
      new_reserved: inv.reserved_stock,
      reason: `quote_${quoteId}`,
      user_id: userId
    });
    
    return {
      stockQuantity: inv.stock_quantity,
      reservedStock: inv.reserved_stock,
      availableStock: inv.stock_quantity - inv.reserved_stock
    };
  }
  
  // آزادسازی رزرو موجودی
  static async releaseReservation(productId, quantity, quoteId, userId = null) {
    if (!inventory.has(productId)) {
      return {
        stockQuantity: 0,
        reservedStock: 0,
        availableStock: 0
      };
    }
    
    const inv = inventory.get(productId);
    const oldReserved = inv.reserved_stock;
    const newReserved = Math.max(0, inv.reserved_stock - quantity);
    
    inv.reserved_stock = newReserved;
    inv.updated_at = new Date().toISOString();
    
    await this.addLog({
      product_id: productId,
      change_type: 'release',
      quantity: quantity,
      old_stock: inv.stock_quantity,
      new_stock: inv.stock_quantity,
      reserved_change: -quantity,
      old_reserved: oldReserved,
      new_reserved: newReserved,
      reason: `quote_${quoteId}_released`,
      user_id: userId
    });
    
    return {
      stockQuantity: inv.stock_quantity,
      reservedStock: inv.reserved_stock,
      availableStock: inv.stock_quantity - inv.reserved_stock
    };
  }
  
  // بررسی موجودی قابل فروش
  static async checkAvailability(productId, requestedQuantity) {
    const inv = await this.getByProductId(productId);
    const available = inv.availableStock;
    
    return {
      productId,
      stockQuantity: inv.stockQuantity,
      reservedStock: inv.reservedStock,
      availableStock: available,
      requestedQuantity: requestedQuantity,
      isAvailable: available >= requestedQuantity,
      shortage: requestedQuantity > available ? requestedQuantity - available : 0
    };
  }
  
  // آپدیت گروهی موجودی (از روی فایل)
  static async bulkUpdate(items, userId = null) {
    const results = {
      success: [],
      failed: [],
      warnings: []
    };
    
    for (const item of items) {
      try {
        const productId = parseInt(item.productId);
        const newStock = parseInt(item.stockQuantity);
        
        if (isNaN(productId) || isNaN(newStock)) {
          results.failed.push({ productId: item.productId, error: 'productId یا stockQuantity نامعتبر' });
          continue;
        }
        
        if (!inventory.has(productId)) {
          await this.init(productId, 0);
        }
        
        const inv = inventory.get(productId);
        
        // هشدار اگر موجودی جدید کمتر از رزرو شده باشد
        if (newStock < inv.reserved_stock) {
          results.warnings.push({
            productId,
            message: `موجودی جدید (${newStock}) کمتر از موجودی رزرو شده (${inv.reserved_stock}) است.`
          });
        }
        
        const quantityChange = newStock - inv.stock_quantity;
        if (quantityChange !== 0) {
          await this.updateStock(productId, quantityChange, 'bulk_upload', userId);
          results.success.push({
            productId,
            oldStock: inv.stock_quantity - quantityChange,
            newStock: newStock
          });
        }
      } catch (err) {
        results.failed.push({ productId: item.productId, error: err.message });
      }
    }
    
    return results;
  }
  
  // ثبت لاگ موجودی
  static async addLog(logData) {
    const log = {
      id: logIdCounter++,
      product_id: logData.product_id,
      product_name: logData.product_name,
      product_code: logData.product_code,
      change_type: logData.change_type,
      quantity: logData.quantity,
      old_stock: logData.old_stock,
      new_stock: logData.new_stock,
      reserved_change: logData.reserved_change || 0,
      old_reserved: logData.old_reserved,
      new_reserved: logData.new_reserved,
      reason: logData.reason,
      user_id: logData.user_id,
      user_name: logData.user_name,
      created_at: new Date().toISOString()
    };
    
    inventoryLogs.unshift(log);
    
    // نگهداری فقط 2000 لاگ آخر
    if (inventoryLogs.length > 2000) {
      inventoryLogs = inventoryLogs.slice(0, 2000);
    }
    
    return log;
  }
  
  // دریافت لاگ‌های موجودی یک محصول
  static async getLogsByProductId(productId, limit = 50) {
    const logs = inventoryLogs
      .filter(log => log.product_id === productId)
      .slice(0, limit);
    
    return logs.map(log => this.normalizeLog(log));
  }
  
  // دریافت همه لاگ‌ها با فیلتر
  static async getAllLogs(filters = {}) {
    let filtered = [...inventoryLogs];
    
    if (filters.change_type) {
      filtered = filtered.filter(log => log.change_type === filters.change_type);
    }
    
    if (filters.product_id) {
      filtered = filtered.filter(log => log.product_id === parseInt(filters.product_id));
    }
    
    if (filters.from_date) {
      const from = new Date(filters.from_date);
      filtered = filtered.filter(log => new Date(log.created_at) >= from);
    }
    
    if (filters.to_date) {
      const to = new Date(filters.to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.created_at) <= to);
    }
    
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 50;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      logs: paginated.map(log => this.normalizeLog(log)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // آمار موجودی
  static async getStats() {
    let totalStock = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    for (const inv of inventory.values()) {
      totalStock += inv.stock_quantity;
      totalReserved += inv.reserved_stock;
      const available = inv.stock_quantity - inv.reserved_stock;
      totalAvailable += available;
      
      if (available === 0) {
        outOfStockCount++;
      } else if (available < 50) {
        lowStockCount++;
      }
    }
    
    // آمار لاگ‌های اخیر (۷ روز)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = inventoryLogs.filter(log => new Date(log.created_at) >= sevenDaysAgo);
    
    return {
      total_products: inventory.size,
      total_stock: totalStock,
      total_reserved: totalReserved,
      total_available: totalAvailable,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      recent_activity: {
        total_changes: recentLogs.length,
        increases: recentLogs.filter(log => log.change_type === 'increase').length,
        decreases: recentLogs.filter(log => log.change_type === 'decrease').length,
        reserves: recentLogs.filter(log => log.change_type === 'reserve').length,
        releases: recentLogs.filter(log => log.change_type === 'release').length
      }
    };
  }
  
  // دریافت محصولات با موجودی کم (برای هشدار)
  static async getLowStockProducts(threshold = 50, limit = 20) {
    const lowStock = [];
    
    for (const [productId, inv] of inventory) {
      const available = inv.stock_quantity - inv.reserved_stock;
      if (available < threshold) {
        lowStock.push({
          productId,
          stockQuantity: inv.stock_quantity,
          reservedStock: inv.reserved_stock,
          availableStock: available
        });
      }
    }
    
    lowStock.sort((a, b) => a.availableStock - b.availableStock);
    return lowStock.slice(0, limit);
  }
}

export default Inventory;
