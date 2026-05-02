// backend/src/models/Quote.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let quotes = [];
let quoteItems = [];
let quoteIdCounter = 1;
let quoteItemIdCounter = 1;

// تابع تولید شماره پیش‌فاکتور
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QF-${year}${month}${day}-${random}`;
};

// ========== کلاس Quote ==========
class Quote {
  // نرمالایز کردن پیش‌فاکتور
  static normalize(quote) {
    return {
      id: quote.id,
      quoteNumber: quote.quote_number,
      partnerId: quote.partner_id,
      partnerName: quote.partner_name,
      partnerCompany: quote.partner_company,
      status: quote.status,
      shippingCost: quote.shipping_cost,
      totalAmount: quote.total_amount,
      notes: quote.notes,
      expiresAt: quote.expires_at,
      createdBy: quote.created_by,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at
    };
  }
  
  // نرمالایز کردن آیتم پیش‌فاکتور
  static normalizeItem(item) {
    return {
      id: item.id,
      quoteId: item.quote_id,
      productId: item.product_id,
      productName: item.product_name,
      productCode: item.product_code,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      createdAt: item.created_at
    };
  }
  
  // دریافت همه پیش‌فاکتورها
  static async findAll(filters = {}) {
    let filtered = [...quotes];
    
    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }
    
    if (filters.partner_id) {
      filtered = filtered.filter(q => q.partner_id === parseInt(filters.partner_id));
    }
    
    if (filters.from_date) {
      const from = new Date(filters.from_date);
      filtered = filtered.filter(q => new Date(q.created_at) >= from);
    }
    
    if (filters.to_date) {
      const to = new Date(filters.to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(q => new Date(q.created_at) <= to);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(q =>
        q.quote_number.toLowerCase().includes(searchLower) ||
        (q.partner_name && q.partner_name.toLowerCase().includes(searchLower)) ||
        (q.partner_company && q.partner_company.toLowerCase().includes(searchLower))
      );
    }
    
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    // اضافه کردن تعداد آیتم‌ها به هر پیش‌فاکتور
    const result = paginated.map(quote => ({
      ...this.normalize(quote),
      itemCount: quoteItems.filter(item => item.quote_id === quote.id).length
    }));
    
    return {
      quotes: result,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // دریافت پیش‌فاکتور با ID به همراه آیتم‌ها
  static async findById(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return null;
    
    const items = quoteItems
      .filter(item => item.quote_id === id)
      .map(item => this.normalizeItem(item));
    
    return {
      ...this.normalize(quote),
      items
    };
  }
  
  // دریافت پیش‌فاکتور با شماره
  static async findByNumber(quoteNumber) {
    const quote = quotes.find(q => q.quote_number === quoteNumber);
    if (!quote) return null;
    
    const items = quoteItems
      .filter(item => item.quote_id === quote.id)
      .map(item => this.normalizeItem(item));
    
    return {
      ...this.normalize(quote),
      items
    };
  }
  
  // دریافت پیش‌فاکتورهای یک همکار
  static async findByPartnerId(partnerId, status = null) {
    let filtered = quotes.filter(q => q.partner_id === parseInt(partnerId));
    
    if (status) {
      filtered = filtered.filter(q => q.status === status);
    }
    
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return filtered.map(quote => ({
      ...this.normalize(quote),
      itemCount: quoteItems.filter(item => item.quote_id === quote.id).length
    }));
  }
  
  // ایجاد پیش‌فاکتور جدید
  static async create(quoteData) {
    const {
      partner_id,
      partner_name,
      partner_company,
      items,
      shipping_cost,
      notes,
      expires_in_hours = 48,
      created_by
    } = quoteData;
    
    if (!partner_id || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('اطلاعات همکار و لیست محصولات الزامی است');
    }
    
    // محاسبه مبلغ کل
    let totalAmount = 0;
    const quoteItemsList = [];
    
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        throw new Error('اطلاعات محصول نامعتبر است');
      }
      
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      quoteItemsList.push({
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      });
    }
    
    // اضافه کردن هزینه حمل
    const shippingCost = shipping_cost || 0;
    totalAmount += shippingCost;
    
    // تاریخ انقضا
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours);
    
    const newQuote = {
      id: quoteIdCounter++,
      quote_number: generateQuoteNumber(),
      partner_id: parseInt(partner_id),
      partner_name: partner_name || null,
      partner_company: partner_company || null,
      status: 'submitted',
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      notes: notes || null,
      expires_at: expiresAt.toISOString(),
      created_by: created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    
    // ذخیره آیتم‌های پیش‌فاکتور
    for (const item of quoteItemsList) {
      quoteItems.push({
        id: quoteItemIdCounter++,
        quote_id: newQuote.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        created_at: new Date().toISOString()
      });
    }
    
    return {
      ...this.normalize(newQuote),
      items: quoteItemsList
    };
  }
  
  // ویرایش پیش‌فاکتور (فقط در وضعیت submitted یا reviewing)
  static async update(id, updates, userId = null) {
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('پیش‌فاکتور یافت نشد');
    }
    
    const quote = quotes[index];
    
    if (quote.status !== 'submitted' && quote.status !== 'reviewing') {
      throw new Error('فقط پیش‌فاکتورهای در انتظار تأیید قابل ویرایش هستند');
    }
    
    // حذف آیتم‌های قبلی
    const oldItems = quoteItems.filter(item => item.quote_id === id);
    for (const item of oldItems) {
      const itemIndex = quoteItems.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) quoteItems.splice(itemIndex, 1);
    }
    
    // محاسبه مبلغ جدید
    let totalAmount = 0;
    const newItems = [];
    
    if (updates.items && Array.isArray(updates.items)) {
      for (const item of updates.items) {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        newItems.push({
          id: quoteItemIdCounter++,
          quote_id: id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_code: item.product_code,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          created_at: new Date().toISOString()
        });
      }
    }
    
    const shippingCost = updates.shipping_cost !== undefined ? updates.shipping_cost : quote.shipping_cost;
    totalAmount += shippingCost;
    
    // به‌روزرسانی پیش‌فاکتور
    quotes[index] = {
      ...quote,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      notes: updates.notes !== undefined ? updates.notes : quote.notes,
      updated_at: new Date().toISOString()
    };
    
    // اضافه کردن آیتم‌های جدید
    quoteItems.push(...newItems);
    
    return {
      ...this.normalize(quotes[index]),
      items: newItems
    };
  }
  
  // تغییر وضعیت پیش‌فاکتور
  static async changeStatus(id, newStatus, userId = null, note = null) {
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('پیش‌فاکتور یافت نشد');
    }
    
    const validStatuses = ['submitted', 'reviewing', 'issued', 'waiting_customer', 'preparing', 'completed', 'final_confirmed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('وضعیت نامعتبر است');
    }
    
    const oldStatus = quotes[index].status;
    quotes[index].status = newStatus;
    quotes[index].updated_at = new Date().toISOString();
    
    // لاگ تغییر وضعیت
    console.log(`[QUOTE] ${quotes[index].quote_number}: ${oldStatus} -> ${newStatus}${note ? ` (${note})` : ''}`);
    
    return {
      oldStatus,
      newStatus,
      quote: this.normalize(quotes[index])
    };
  }
  
  // تأیید و صدور پیش‌فاکتور
  static async approve(id, userId = null) {
    return await this.changeStatus(id, 'issued', userId, 'approved by admin');
  }
  
  // لغو پیش‌فاکتور
  static async cancel(id, userId = null, reason = null) {
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('پیش‌فاکتور یافت نشد');
    }
    
    if (quotes[index].status === 'completed' || quotes[index].status === 'final_confirmed') {
      throw new Error('پیش‌فاکتورهای تکمیل شده قابل لغو نیستند');
    }
    
    quotes[index].status = 'cancelled';
    quotes[index].updated_at = new Date().toISOString();
    
    console.log(`[QUOTE] ${quotes[index].quote_number}: CANCELLED${reason ? ` (${reason})` : ''}`);
    
    return this.normalize(quotes[index]);
  }
  
  // دریافت پیش‌فاکتورهای منقضی شده
  static async getExpiredQuotes() {
    const now = new Date();
    return quotes.filter(q => 
      new Date(q.expires_at) < now && 
      !['completed', 'final_confirmed', 'cancelled'].includes(q.status)
    );
  }
  
  // آزادسازی خودکار پیش‌فاکتورهای منقضی شده
  static async releaseExpiredQuotes(userId = null) {
    const expired = await this.getExpiredQuotes();
    let releasedCount = 0;
    
    for (const quote of expired) {
      await this.cancel(quote.id, userId, 'automatic expiration');
      releasedCount++;
    }
    
    return { releasedCount };
  }
  
  // آمار پیش‌فاکتورها
  static async getStats(partnerId = null) {
    let filtered = [...quotes];
    
    if (partnerId) {
      filtered = filtered.filter(q => q.partner_id === parseInt(partnerId));
    }
    
    const stats = {
      total: filtered.length,
      total_amount: filtered.reduce((sum, q) => sum + q.total_amount, 0),
      by_status: {
        submitted: filtered.filter(q => q.status === 'submitted').length,
        reviewing: filtered.filter(q => q.status === 'reviewing').length,
        issued: filtered.filter(q => q.status === 'issued').length,
        waiting_customer: filtered.filter(q => q.status === 'waiting_customer').length,
        preparing: filtered.filter(q => q.status === 'preparing').length,
        completed: filtered.filter(q => q.status === 'completed').length,
        final_confirmed: filtered.filter(q => q.status === 'final_confirmed').length,
        cancelled: filtered.filter(q => q.status === 'cancelled').length
      }
    };
    
    // پیش‌فاکتورهای این ماه
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthQuotes = filtered.filter(q => new Date(q.created_at) >= thisMonth);
    stats.this_month = {
      count: thisMonthQuotes.length,
      amount: thisMonthQuotes.reduce((sum, q) => sum + q.total_amount, 0)
    };
    
    return stats;
  }
  
  // آمار روزانه برای نمودار
  static async getDailyStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const recentQuotes = quotes.filter(q => new Date(q.created_at) >= startDate);
    
    const dailyStats = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toLocaleDateString('fa-IR');
      dailyStats[dateKey] = {
        date: dateKey,
        count: 0,
        amount: 0
      };
    }
    
    for (const quote of recentQuotes) {
      const dateKey = new Date(quote.created_at).toLocaleDateString('fa-IR');
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].count++;
        dailyStats[dateKey].amount += quote.total_amount;
      }
    }
    
    return Object.values(dailyStats);
  }
}

export default Quote;
