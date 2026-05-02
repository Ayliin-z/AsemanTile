// backend/src/api/contact.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let contactRequests = [
  {
    id: 1,
    name: 'احمد رضایی',
    mobile: '9123456789',
    city: 'شیراز',
    area_m2: 120,
    message: 'برای پروژه ساختمانی نیاز به مشاوره دارم',
    status: 'contacted',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'سارا محمدی',
    mobile: '9123456788',
    city: 'تهران',
    area_m2: 85,
    message: 'اطلاعات قیمت کاشی های جدید میخوام',
    status: 'new',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'علی کریمی',
    mobile: '9123456787',
    city: 'اصفهان',
    area_m2: 200,
    message: 'برای یک پروژه بزرگ به کاشی نیاز دارم',
    status: 'followed',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextId = 4;

// ========== POST /api/contact ==========
// ایجاد درخواست تماس جدید (بدون نیاز به احراز هویت)
router.post('/', async (req, res) => {
  try {
    const { name, mobile, city, area_m2, message } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ 
        success: false, 
        error: 'نام و شماره موبایل الزامی است' 
      });
    }
    
    // اعتبارسنجی شماره موبایل
    let normalizedMobile = mobile.toString();
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }
    
    if (normalizedMobile.length < 10 || normalizedMobile.length > 11) {
      return res.status(400).json({ 
        success: false, 
        error: 'شماره موبایل معتبر نیست' 
      });
    }
    
    // اعتبارسنجی متراژ (اختیاری)
    let normalizedArea = null;
    if (area_m2) {
      normalizedArea = parseInt(area_m2);
      if (isNaN(normalizedArea) || normalizedArea <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'متراژ باید عددی مثبت باشد' 
        });
      }
    }
    
    const newRequest = {
      id: nextId++,
      name: name.trim(),
      mobile: normalizedMobile,
      city: city?.trim() || null,
      area_m2: normalizedArea,
      message: message?.trim() || null,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    contactRequests.unshift(newRequest); // اضافه کردن به اول لیست
    
    console.log(`📞 درخواست تماس جدید از ${name} - موبایل: ${normalizedMobile}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'درخواست شما با موفقیت ثبت شد. کارشناسان ما به زودی با شما تماس می‌گیرند.',
      data: {
        id: newRequest.id,
        status: newRequest.status
      }
    });
  } catch (error) {
    console.error('POST /api/contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/contact ==========
// دریافت همه درخواست‌های تماس (ادمین/کارمند)
router.get('/', async (req, res) => {
  try {
    const { status, from_date, to_date, limit, offset } = req.query;
    
    let filtered = [...contactRequests];
    
    // فیلتر بر اساس وضعیت
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    
    // فیلتر بر اساس بازه تاریخ
    if (from_date) {
      const from = new Date(from_date);
      filtered = filtered.filter(r => new Date(r.created_at) >= from);
    }
    
    if (to_date) {
      const to = new Date(to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.created_at) <= to);
    }
    
    // مرتب‌سازی بر اساس جدیدترین
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // صفحه‌بندی
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    
    // آمار وضعیت‌ها
    const stats = {
      new: contactRequests.filter(r => r.status === 'new').length,
      contacted: contactRequests.filter(r => r.status === 'contacted').length,
      followed: contactRequests.filter(r => r.status === 'followed').length,
      total: contactRequests.length
    };
    
    res.json({ 
      success: true, 
      data: paginated,
      stats: stats,
      pagination: {
        total: filtered.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < filtered.length
      }
    });
  } catch (error) {
    console.error('GET /api/contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/contact/:id ==========
// دریافت یک درخواست تماس
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const request = contactRequests.find(r => r.id === id);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'درخواست یافت نشد' });
    }
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('GET /api/contact/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/contact/:id/status ==========
// تغییر وضعیت درخواست تماس
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['new', 'contacted', 'followed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'وضعیت نامعتبر است. وضعیت‌های مجاز: new, contacted, followed' 
      });
    }
    
    const request = contactRequests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'درخواست یافت نشد' });
    }
    
    request.status = status;
    request.updated_at = new Date().toISOString();
    
    console.log(`📞 درخواست ${id}: وضعیت تغییر به ${status}`);
    
    res.json({ 
      success: true, 
      message: `وضعیت درخواست به "${status === 'new' ? 'جدید' : status === 'contacted' ? 'تماس گرفته شده' : 'پیگیری شده'}" تغییر یافت`,
      data: request
    });
  } catch (error) {
    console.error('PATCH /api/contact/:id/status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/contact/:id/note ==========
// افزودن یادداشت به درخواست تماس
router.post('/:id/note', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { note } = req.body;
    
    if (!note || note.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'متن یادداشت الزامی است' 
      });
    }
    
    const request = contactRequests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'درخواست یافت نشد' });
    }
    
    // اضافه کردن یادداشت (اگر فیلد notes نداریم، می‌تونیم جداگانه ذخیره کنیم)
    if (!request.notes) {
      request.notes = [];
    }
    
    request.notes.push({
      text: note.trim(),
      created_at: new Date().toISOString()
    });
    
    request.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'یادداشت با موفقیت اضافه شد',
      data: { notes: request.notes }
    });
  } catch (error) {
    console.error('POST /api/contact/:id/note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DELETE /api/contact/:id ==========
// حذف درخواست تماس (ادمین)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = contactRequests.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'درخواست یافت نشد' });
    }
    
    contactRequests.splice(index, 1);
    
    res.json({ success: true, message: 'درخواست با موفقیت حذف شد' });
  } catch (error) {
    console.error('DELETE /api/contact/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/contact/stats/daily ==========
// آمار روزانه درخواست‌های تماس (برای داشبورد)
router.get('/stats/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);
    
    // محاسبه تاریخ شروع
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);
    
    // فیلتر کردن درخواست‌های ۷ روز اخیر
    const recentRequests = contactRequests.filter(r => new Date(r.created_at) >= startDate);
    
    // گروه‌بندی بر اساس روز
    const dailyStats = {};
    
    recentRequests.forEach(request => {
      const date = new Date(request.created_at).toLocaleDateString('fa-IR');
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          total: 0,
          new: 0,
          contacted: 0,
          followed: 0
        };
      }
      
      dailyStats[date].total++;
      dailyStats[date][request.status]++;
    });
    
    const result = Object.values(dailyStats).sort((a, b) => {
      // تبدیل تاریخ فارسی به عدد برای مقایسه
      const [yearA, monthA, dayA] = a.date.split('/');
      const [yearB, monthB, dayB] = b.date.split('/');
      return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/contact/stats/daily error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/contact/stats/summary ==========
// خلاصه آمار درخواست‌ها (برای داشبورد)
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = contactRequests.filter(r => new Date(r.created_at) >= today);
    
    const summary = {
      total: contactRequests.length,
      today: todayRequests.length,
      new: contactRequests.filter(r => r.status === 'new').length,
      contacted: contactRequests.filter(r => r.status === 'contacted').length,
      followed: contactRequests.filter(r => r.status === 'followed').length,
      last_week: contactRequests.filter(r => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(r.created_at) >= weekAgo;
      }).length
    };
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('GET /api/contact/stats/summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/contact/export/csv ==========
// خروجی CSV از درخواست‌ها
router.get('/export/csv', async (req, res) => {
  try {
    const { status } = req.query;
    
    let filtered = [...contactRequests];
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    
    // آماده‌سازی داده برای CSV
    const headers = ['شناسه', 'نام', 'شماره موبایل', 'شهر', 'متراژ', 'پیام', 'وضعیت', 'تاریخ ثبت'];
    
    const rows = filtered.map(r => [
      r.id,
      r.name,
      r.mobile,
      r.city || '',
      r.area_m2 || '',
      r.message || '',
      r.status === 'new' ? 'جدید' : r.status === 'contacted' ? 'تماس گرفته شده' : 'پیگیری شده',
      new Date(r.created_at).toLocaleDateString('fa-IR')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=contact_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    console.error('GET /api/contact/export/csv error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
