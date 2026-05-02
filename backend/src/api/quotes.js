// backend/src/api/quotes.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let quotes = [];
let quoteItems = [];
let quoteIdCounter = 1;
let quoteItemIdCounter = 1;

// تابع تولید شماره پیش‌فاکتور
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QF-${year}${month}-${random}`;
};

// ========== GET /api/quotes ==========
// دریافت همه پیش‌فاکتورها (ادمین)
router.get('/', async (req, res) => {
  try {
    const { status, partner_id, from_date, to_date, limit = 50, offset = 0 } = req.query;
    
    let filtered = [...quotes];
    
    if (status) {
      filtered = filtered.filter(q => q.status === status);
    }
    
    if (partner_id) {
      filtered = filtered.filter(q => q.partner_id === parseInt(partner_id));
    }
    
    if (from_date) {
      const from = new Date(from_date);
      filtered = filtered.filter(q => new Date(q.created_at) >= from);
    }
    
    if (to_date) {
      const to = new Date(to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(q => new Date(q.created_at) <= to);
    }
    
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    // آمار وضعیت‌ها
    const stats = {
      submitted: quotes.filter(q => q.status === 'submitted').length,
      reviewing: quotes.filter(q => q.status === 'reviewing').length,
      issued: quotes.filter(q => q.status === 'issued').length,
      preparing: quotes.filter(q => q.status === 'preparing').length,
      completed: quotes.filter(q => q.status === 'completed').length,
      cancelled: quotes.filter(q => q.status === 'cancelled').length,
      total: quotes.length,
      total_amount: quotes.reduce((sum, q) => sum + q.total_amount, 0)
    };
    
    res.json({
      success: true,
      data: paginated,
      stats,
      pagination: {
        total: filtered.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('GET /api/quotes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/quotes/partner/:partnerId ==========
// دریافت پیش‌فاکتورهای یک همکار خاص
router.get('/partner/:partnerId', async (req, res) => {
  try {
    const partnerId = parseInt(req.params.partnerId);
    const { status } = req.query;
    
    let filtered = quotes.filter(q => q.partner_id === partnerId);
    
    if (status) {
      filtered = filtered.filter(q => q.status === status);
    }
    
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // اضافه کردن تعداد آیتم‌ها به هر پیش‌فاکتور
    const result = filtered.map(quote => ({
      ...quote,
      item_count: quoteItems.filter(item => item.quote_id === quote.id).length
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/quotes/partner/:partnerId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/quotes/:id ==========
// دریافت پیش‌فاکتور با ID به همراه آیتم‌ها
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quote = quotes.find(q => q.id === id);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    const items = quoteItems.filter(item => item.quote_id === id);
    
    res.json({ 
      success: true, 
      data: {
        ...quote,
        items
      }
    });
  } catch (error) {
    console.error('GET /api/quotes/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/quotes/number/:quoteNumber ==========
// دریافت پیش‌فاکتور با شماره
router.get('/number/:quoteNumber', async (req, res) => {
  try {
    const { quoteNumber } = req.params;
    const quote = quotes.find(q => q.quote_number === quoteNumber);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    const items = quoteItems.filter(item => item.quote_id === quote.id);
    
    res.json({ 
      success: true, 
      data: {
        ...quote,
        items
      }
    });
  } catch (error) {
    console.error('GET /api/quotes/number/:quoteNumber error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/quotes ==========
// ایجاد پیش‌فاکتور جدید
router.post('/', async (req, res) => {
  try {
    const { partner_id, items, shipping_cost, notes, expires_in_hours = 48 } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    if (!partner_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'اطلاعات همکار و لیست محصولات الزامی است' 
      });
    }
    
    // محاسبه مبلغ کل
    let totalAmount = 0;
    const quoteItemsList = [];
    
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      quoteItemsList.push({
        product_id: item.product_id,
        product_name: item.product_name,
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
      status: 'submitted',
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      notes: notes || null,
      expires_at: expiresAt.toISOString(),
      created_by: userId,
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
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        created_at: new Date().toISOString()
      });
    }
    
    console.log(`📄 پیش‌فاکتور جدید: ${newQuote.quote_number} - مبلغ: ${totalAmount.toLocaleString()} تومان`);
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...newQuote,
        items: quoteItemsList
      },
      message: 'پیش‌فاکتور با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('POST /api/quotes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/quotes/:id ==========
// ویرایش پیش‌فاکتور (فقط در وضعیت submitted یا reviewing)
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { items, shipping_cost, notes } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    if (quoteIndex === -1) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    const quote = quotes[quoteIndex];
    
    // بررسی وضعیت برای ویرایش
    if (quote.status !== 'submitted' && quote.status !== 'reviewing') {
      return res.status(400).json({ 
        success: false, 
        error: 'فقط پیش‌فاکتورهای در انتظار تأیید قابل ویرایش هستند' 
      });
    }
    
    // حذف آیتم‌های قبلی
    const existingItems = quoteItems.filter(item => item.quote_id === id);
    for (const item of existingItems) {
      const index = quoteItems.findIndex(i => i.id === item.id);
      if (index !== -1) quoteItems.splice(index, 1);
    }
    
    // محاسبه مبلغ جدید
    let totalAmount = 0;
    const newItems = [];
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        newItems.push({
          id: quoteItemIdCounter++,
          quote_id: id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          created_at: new Date().toISOString()
        });
      }
    }
    
    const shippingCost = shipping_cost !== undefined ? shipping_cost : quote.shipping_cost;
    totalAmount += shippingCost;
    
    // به‌روزرسانی پیش‌فاکتور
    quotes[quoteIndex] = {
      ...quote,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      notes: notes !== undefined ? notes : quote.notes,
      updated_at: new Date().toISOString()
    };
    
    // اضافه کردن آیتم‌های جدید
    quoteItems.push(...newItems);
    
    res.json({ 
      success: true, 
      data: {
        ...quotes[quoteIndex],
        items: newItems
      },
      message: 'پیش‌فاکتور با موفقیت ویرایش شد'
    });
  } catch (error) {
    console.error('PUT /api/quotes/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/quotes/:id/status ==========
// تغییر وضعیت پیش‌فاکتور
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, note } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    const validStatuses = ['submitted', 'reviewing', 'issued', 'waiting_customer', 'preparing', 'completed', 'final_confirmed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'وضعیت نامعتبر است' 
      });
    }
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    if (quoteIndex === -1) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    const oldStatus = quotes[quoteIndex].status;
    quotes[quoteIndex].status = status;
    quotes[quoteIndex].updated_at = new Date().toISOString();
    
    console.log(`📄 پیش‌فاکتور ${quotes[quoteIndex].quote_number}: ${oldStatus} -> ${status}${note ? ` (${note})` : ''}`);
    
    res.json({ 
      success: true, 
      data: quotes[quoteIndex],
      message: `وضعیت پیش‌فاکتور به "${getStatusLabel(status)}" تغییر یافت`
    });
  } catch (error) {
    console.error('PATCH /api/quotes/:id/status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/quotes/:id/approve ==========
// تأیید و صدور پیش‌فاکتور
router.post('/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    if (quoteIndex === -1) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    if (quotes[quoteIndex].status !== 'submitted' && quotes[quoteIndex].status !== 'reviewing') {
      return res.status(400).json({ 
        success: false, 
        error: 'فقط پیش‌فاکتورهای در انتظار تأیید قابل تأیید هستند' 
      });
    }
    
    quotes[quoteIndex].status = 'issued';
    quotes[quoteIndex].updated_at = new Date().toISOString();
    
    console.log(`✅ پیش‌فاکتور ${quotes[quoteIndex].quote_number} تأیید و صادر شد`);
    
    res.json({ 
      success: true, 
      data: quotes[quoteIndex],
      message: 'پیش‌فاکتور با موفقیت تأیید و صادر شد'
    });
  } catch (error) {
    console.error('POST /api/quotes/:id/approve error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/quotes/:id/cancel ==========
// لغو پیش‌فاکتور
router.post('/:id/cancel', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    if (quoteIndex === -1) {
      return res.status(404).json({ success: false, error: 'پیش‌فاکتور یافت نشد' });
    }
    
    if (quotes[quoteIndex].status === 'completed' || quotes[quoteIndex].status === 'final_confirmed') {
      return res.status(400).json({ 
        success: false, 
        error: 'پیش‌فاکتورهای تکمیل شده قابل لغو نیستند' 
      });
    }
    
    quotes[quoteIndex].status = 'cancelled';
    quotes[quoteIndex].updated_at = new Date().toISOString();
    
    console.log(`❌ پیش‌فاکتور ${quotes[quoteIndex].quote_number} لغو شد${reason ? `: ${reason}` : ''}`);
    
    res.json({ 
      success: true, 
      data: quotes[quoteIndex],
      message: 'پیش‌فاکتور با موفقیت لغو شد'
    });
  } catch (error) {
    console.error('POST /api/quotes/:id/cancel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/quotes/stats/summary ==========
// خلاصه آمار پیش‌فاکتورها (برای داشبورد)
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const todayQuotes = quotes.filter(q => new Date(q.created_at) >= today);
    const thisMonthQuotes = quotes.filter(q => new Date(q.created_at) >= thisMonth);
    
    const summary = {
      total: quotes.length,
      total_amount: quotes.reduce((sum, q) => sum + q.total_amount, 0),
      today: {
        count: todayQuotes.length,
        amount: todayQuotes.reduce((sum, q) => sum + q.total_amount, 0)
      },
      this_month: {
        count: thisMonthQuotes.length,
        amount: thisMonthQuotes.reduce((sum, q) => sum + q.total_amount, 0)
      },
      by_status: {
        submitted: quotes.filter(q => q.status === 'submitted').length,
        reviewing: quotes.filter(q => q.status === 'reviewing').length,
        issued: quotes.filter(q => q.status === 'issued').length,
        preparing: quotes.filter(q => q.status === 'preparing').length,
        completed: quotes.filter(q => q.status === 'completed').length,
        cancelled: quotes.filter(q => q.status === 'cancelled').length
      }
    };
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('GET /api/quotes/stats/summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/quotes/stats/daily ==========
// آمار روزانه پیش‌فاکتورها (برای نمودار)
router.get('/stats/daily', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);
    
    const recentQuotes = quotes.filter(q => new Date(q.created_at) >= startDate);
    
    const dailyStats = {};
    
    for (let i = 0; i < daysNum; i++) {
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
    
    const result = Object.values(dailyStats);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/quotes/stats/daily error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// تابع کمکی برای تبدیل وضعیت به فارسی
const getStatusLabel = (status) => {
  const statusMap = {
    'submitted': 'ثبت شده',
    'reviewing': 'در حال بررسی',
    'issued': 'صادر شده',
    'waiting_customer': 'در انتظار مشتری',
    'preparing': 'در حال آماده‌سازی',
    'completed': 'تکمیل شده',
    'final_confirmed': 'تأیید نهایی',
    'cancelled': 'لغو شده'
  };
  return statusMap[status] || status;
};

export default router;
