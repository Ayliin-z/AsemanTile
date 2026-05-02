// backend/src/api/partners.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let partners = [
  {
    id: 1,
    user_id: 10,
    user_name: 'احمد کریمی',
    user_mobile: '9123456789',
    user_email: 'ahmad@partner.com',
    company_name: 'شرکت ساختمانی کریمی',
    city: 'شیراز',
    address: 'بلوار پاسداران، کوچه ۶۰',
    credit_limit: 50000000,
    is_approved: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: 11,
    user_name: 'سارا محمدی',
    user_mobile: '9123456788',
    user_email: 'sara@partner.com',
    company_name: 'طراحی و دکوراسیون سارا',
    city: 'تهران',
    address: 'خیابان ولیعصر',
    credit_limit: 30000000,
    is_approved: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 12,
    user_name: 'رضا نادری',
    user_mobile: '9123456787',
    user_email: 'reza@partner.com',
    company_name: 'ساخت و ساز نادری',
    city: 'اصفهان',
    address: 'خیابان چهارباغ',
    credit_limit: 0,
    is_approved: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextId = 4;

// ========== GET /api/partners ==========
// دریافت همه همکاران (ادمین)
router.get('/', async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;
    
    let filtered = [...partners];
    
    // فیلتر بر اساس وضعیت تأیید
    if (status === 'approved') {
      filtered = filtered.filter(p => p.is_approved === true);
    } else if (status === 'pending') {
      filtered = filtered.filter(p => p.is_approved === false);
    }
    
    // جستجو بر اساس نام شرکت، نام کاربر یا موبایل
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.company_name?.toLowerCase().includes(searchLower) ||
        p.user_name?.toLowerCase().includes(searchLower) ||
        p.user_mobile?.includes(search)
      );
    }
    
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // صفحه‌بندی
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    
    // آمار کلی
    const stats = {
      total: partners.length,
      approved: partners.filter(p => p.is_approved === true).length,
      pending: partners.filter(p => p.is_approved === false).length
    };
    
    res.json({ 
      success: true, 
      data: paginated,
      stats: stats,
      pagination: {
        total: filtered.length,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    console.error('GET /api/partners error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/pending ==========
// دریافت همکاران در انتظار تأیید
router.get('/pending', async (req, res) => {
  try {
    const pending = partners.filter(p => p.is_approved === false);
    pending.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('GET /api/partners/pending error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/approved ==========
// دریافت همکاران تأیید شده (برای انتخاب در فرانت)
router.get('/approved', async (req, res) => {
  try {
    const approved = partners.filter(p => p.is_approved === true);
    approved.sort((a, b) => a.company_name.localeCompare(b.company_name));
    
    res.json({ success: true, data: approved });
  } catch (error) {
    console.error('GET /api/partners/approved error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/:id ==========
// دریافت اطلاعات یک همکار
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const partner = partners.find(p => p.id === id);
    
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    // آمار پیش‌فاکتورهای همکار (mock - بعداً به quotes متصل می‌شود)
    const quoteStats = {
      total_quotes: 0,
      submitted: 0,
      reviewing: 0,
      issued: 0,
      completed: 0,
      cancelled: 0,
      total_amount: 0
    };
    
    res.json({ 
      success: true, 
      data: partner,
      quote_stats: quoteStats
    });
  } catch (error) {
    console.error('GET /api/partners/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/user/:userId ==========
// دریافت اطلاعات همکار با user_id
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const partner = partners.find(p => p.user_id === userId);
    
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    res.json({ success: true, data: partner });
  } catch (error) {
    console.error('GET /api/partners/user/:userId error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/partners ==========
// ایجاد همکار جدید (با user_id موجود)
router.post('/', async (req, res) => {
  try {
    const { user_id, company_name, city, address, credit_limit } = req.body;
    
    if (!user_id || !company_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id و نام شرکت الزامی است' 
      });
    }
    
    // بررسی وجود همکار تکراری برای این کاربر
    const existing = partners.find(p => p.user_id === user_id);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'این کاربر قبلاً به عنوان همکار ثبت شده است' 
      });
    }
    
    const newPartner = {
      id: nextId++,
      user_id: parseInt(user_id),
      user_name: req.body.user_name || '',
      user_mobile: req.body.user_mobile || '',
      user_email: req.body.user_email || '',
      company_name: company_name.trim(),
      city: city || null,
      address: address || null,
      credit_limit: credit_limit || 0,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    partners.push(newPartner);
    
    res.status(201).json({ 
      success: true, 
      data: newPartner,
      message: 'درخواست همکاری ثبت شد. منتظر تأیید مدیریت باشید.'
    });
  } catch (error) {
    console.error('POST /api/partners error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/partners/:id/approve ==========
// تأیید همکار
router.put('/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const partner = partners.find(p => p.id === id);
    
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    if (partner.is_approved) {
      return res.status(400).json({ success: false, error: 'همکار قبلاً تأیید شده است' });
    }
    
    partner.is_approved = true;
    partner.updated_at = new Date().toISOString();
    
    console.log(`✅ همکار ${partner.company_name} (ID: ${id}) تأیید شد`);
    
    res.json({ 
      success: true, 
      message: 'همکار با موفقیت تأیید شد',
      data: partner
    });
  } catch (error) {
    console.error('PUT /api/partners/:id/approve error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/partners/:id/reject ==========
// رد درخواست همکاری (حذف)
router.put('/:id/reject', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = partners.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    const partner = partners[index];
    if (partner.is_approved) {
      return res.status(400).json({ success: false, error: 'همکار قبلاً تأیید شده و قابل حذف نیست' });
    }
    
    partners.splice(index, 1);
    
    console.log(`❌ درخواست همکاری ${partner.company_name} (ID: ${id}) رد شد`);
    
    res.json({ 
      success: true, 
      message: 'درخواست همکاری رد شد' 
    });
  } catch (error) {
    console.error('PUT /api/partners/:id/reject error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/partners/:id ==========
// به‌روزرسانی اطلاعات همکار
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { company_name, city, address, credit_limit, is_approved } = req.body;
    
    const partner = partners.find(p => p.id === id);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    if (company_name) partner.company_name = company_name.trim();
    if (city !== undefined) partner.city = city || null;
    if (address !== undefined) partner.address = address || null;
    if (credit_limit !== undefined) partner.credit_limit = credit_limit;
    if (is_approved !== undefined) partner.is_approved = is_approved;
    
    partner.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      data: partner,
      message: 'اطلاعات همکار با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('PUT /api/partners/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DELETE /api/partners/:id ==========
// حذف همکار (ادمین)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = partners.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    const partner = partners[index];
    partners.splice(index, 1);
    
    console.log(`🗑️ همکار ${partner.company_name} (ID: ${id}) حذف شد`);
    
    res.json({ success: true, message: 'همکار با موفقیت حذف شد' });
  } catch (error) {
    console.error('DELETE /api/partners/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/:id/quotes ==========
// دریافت پیش‌فاکتورهای یک همکار (mock - بعداً کامل می‌شود)
router.get('/:id/quotes', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, limit, offset } = req.query;
    
    const partner = partners.find(p => p.id === id);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    // Mock داده - در آینده از دیتابیس واقعی می‌آید
    const mockQuotes = [];
    
    res.json({ success: true, data: mockQuotes });
  } catch (error) {
    console.error('GET /api/partners/:id/quotes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/partners/stats/summary ==========
// خلاصه آمار همکاران (برای داشبورد)
router.get('/stats/summary', async (req, res) => {
  try {
    const total = partners.length;
    const approved = partners.filter(p => p.is_approved).length;
    const pending = partners.filter(p => !p.is_approved).length;
    
    // همکاران جدید در 30 روز اخیر
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newPartners = partners.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
    
    // کل اعتبار همکاران (credit_limit مجموع)
    const totalCredit = partners.reduce((sum, p) => sum + (p.credit_limit || 0), 0);
    
    res.json({
      success: true,
      data: {
        total,
        approved,
        pending,
        new_partners_last_30_days: newPartners,
        total_credit_limit: totalCredit
      }
    });
  } catch (error) {
    console.error('GET /api/partners/stats/summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/partners/:id/credit ==========
// تغییر سقف اعتبار همکار
router.patch('/:id/credit', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { credit_limit } = req.body;
    
    if (credit_limit === undefined || isNaN(credit_limit)) {
      return res.status(400).json({ 
        success: false, 
        error: 'مقدار اعتبار معتبر نیست' 
      });
    }
    
    const partner = partners.find(p => p.id === id);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'همکار یافت نشد' });
    }
    
    partner.credit_limit = parseInt(credit_limit);
    partner.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      data: partner,
      message: 'سقف اعتبار با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('PATCH /api/partners/:id/credit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
