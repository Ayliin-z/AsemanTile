// backend/src/models/Contact.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let contactRequests = [
  {
    id: 1,
    name: 'احمد رضایی',
    mobile: '9123456789',
    city: 'شیراز',
    area_m2: 120,
    message: 'برای پروژه ساختمانی 120 متری نیاز به مشاوره دارم. لطفاً کارشناس با من تماس بگیرد.',
    status: 'contacted',
    notes: 'تماس گرفته شد - مشتری نیاز به کاشی کف 60*60 دارد',
    contacted_by: 'کارشناس فروش - مریم',
    contacted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'سارا محمدی',
    mobile: '9123456788',
    city: 'تهران',
    area_m2: 85,
    message: 'اطلاعات قیمت کاشی های جدید میخوام برای بازسازی آپارتمان',
    status: 'new',
    notes: null,
    contacted_by: null,
    contacted_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'علی کریمی',
    mobile: '9123456787',
    city: 'اصفهان',
    area_m2: 200,
    message: 'برای یک پروژه بزرگ 200 متری به کاشی و سرامیک نیاز دارم. بهترین قیمت رو میخوام.',
    status: 'followed',
    notes: 'پیگیری شد - قیمت‌ها ارسال شد. منتظر جواب مشتری هستیم.',
    contacted_by: 'کارشناس فروش - رضا',
    contacted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    name: 'مریم احمدی',
    mobile: '9123456786',
    city: 'شیراز',
    area_m2: 0,
    message: 'آدرس فروشگاه رو لطفاً بفرستید',
    status: 'contacted',
    notes: 'آدرس فروشگاه ارسال شد',
    contacted_by: 'کارشناس فروش - مریم',
    contacted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextId = 5;

// ========== کلاس Contact ==========
class Contact {
  // نرمالایز کردن درخواست تماس
  static normalize(request) {
    return {
      id: request.id,
      name: request.name,
      mobile: request.mobile,
      city: request.city || null,
      areaM2: request.area_m2 || 0,
      message: request.message || null,
      status: request.status,
      notes: request.notes || null,
      contactedBy: request.contacted_by || null,
      contactedAt: request.contacted_at || null,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    };
  }
  
  // دریافت همه درخواست‌ها
  static async findAll(filters = {}) {
    let filtered = [...contactRequests];
    
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters.city) {
      filtered = filtered.filter(r => r.city === filters.city);
    }
    
    if (filters.from_date) {
      const from = new Date(filters.from_date);
      filtered = filtered.filter(r => new Date(r.created_at) >= from);
    }
    
    if (filters.to_date) {
      const to = new Date(filters.to_date);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.created_at) <= to);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.mobile.includes(filters.search) ||
        (r.city && r.city.toLowerCase().includes(searchLower)) ||
        (r.message && r.message.toLowerCase().includes(searchLower))
      );
    }
    
    // مرتب‌سازی بر اساس جدیدترین
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      requests: paginated.map(r => this.normalize(r)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // دریافت درخواست با ID
  static async findById(id) {
    const request = contactRequests.find(r => r.id === id);
    if (!request) return null;
    
    return this.normalize(request);
  }
  
  // ایجاد درخواست تماس جدید
  static async create(requestData) {
    const { name, mobile, city, area_m2, message } = requestData;
    
    if (!name || !mobile) {
      throw new Error('نام و شماره موبایل الزامی است');
    }
    
    // اعتبارسنجی شماره موبایل
    let normalizedMobile = mobile.toString();
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }
    
    if (normalizedMobile.length < 10 || normalizedMobile.length > 11) {
      throw new Error('شماره موبایل معتبر نیست');
    }
    
    const newRequest = {
      id: nextId++,
      name: name.trim(),
      mobile: normalizedMobile,
      city: city?.trim() || null,
      area_m2: area_m2 ? parseInt(area_m2) : 0,
      message: message?.trim() || null,
      status: 'new',
      notes: null,
      contacted_by: null,
      contacted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    contactRequests.unshift(newRequest);
    
    return this.normalize(newRequest);
  }
  
  // تغییر وضعیت درخواست تماس
  static async updateStatus(id, status, notes = null, contactedBy = null) {
    const index = contactRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('درخواست یافت نشد');
    }
    
    if (!['new', 'contacted', 'followed'].includes(status)) {
      throw new Error('وضعیت نامعتبر است. وضعیت‌های مجاز: new, contacted, followed');
    }
    
    contactRequests[index].status = status;
    
    if (notes) {
      contactRequests[index].notes = notes;
    }
    
    if (status === 'contacted' && !contactRequests[index].contacted_at) {
      contactRequests[index].contacted_at = new Date().toISOString();
      if (contactedBy) {
        contactRequests[index].contacted_by = contactedBy;
      }
    }
    
    contactRequests[index].updated_at = new Date().toISOString();
    
    return this.normalize(contactRequests[index]);
  }
  
  // افزودن یادداشت به درخواست
  static async addNote(id, note, userId = null) {
    const index = contactRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('درخواست یافت نشد');
    }
    
    const timestamp = new Date().toLocaleString('fa-IR');
    const newNote = `[${timestamp}] ${note}`;
    
    if (contactRequests[index].notes) {
      contactRequests[index].notes += `\n${newNote}`;
    } else {
      contactRequests[index].notes = newNote;
    }
    
    contactRequests[index].updated_at = new Date().toISOString();
    
    return this.normalize(contactRequests[index]);
  }
  
  // حذف درخواست تماس
  static async delete(id) {
    const index = contactRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('درخواست یافت نشد');
    }
    
    contactRequests.splice(index, 1);
    return true;
  }
  
  // آمار درخواست‌ها
  static async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    thisWeek.setHours(0, 0, 0, 0);
    
    const todayRequests = contactRequests.filter(r => new Date(r.created_at) >= today);
    const thisWeekRequests = contactRequests.filter(r => new Date(r.created_at) >= thisWeek);
    const thisMonthRequests = contactRequests.filter(r => new Date(r.created_at) >= thisMonth);
    
    return {
      total: contactRequests.length,
      today: todayRequests.length,
      this_week: thisWeekRequests.length,
      this_month: thisMonthRequests.length,
      by_status: {
        new: contactRequests.filter(r => r.status === 'new').length,
        contacted: contactRequests.filter(r => r.status === 'contacted').length,
        followed: contactRequests.filter(r => r.status === 'followed').length
      },
      by_city: this.getCityStats()
    };
  }
  
  // آمار بر اساس شهر
  static getCityStats() {
    const cityCount = {};
    
    for (const request of contactRequests) {
      if (request.city) {
        cityCount[request.city] = (cityCount[request.city] || 0) + 1;
      }
    }
    
    return Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  // آمار روزانه برای نمودار
  static async getDailyStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const recentRequests = contactRequests.filter(r => new Date(r.created_at) >= startDate);
    
    const dailyStats = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toLocaleDateString('fa-IR');
      dailyStats[dateKey] = {
        date: dateKey,
        total: 0,
        new: 0,
        contacted: 0,
        followed: 0
      };
    }
    
    for (const request of recentRequests) {
      const dateKey = new Date(request.created_at).toLocaleDateString('fa-IR');
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].total++;
        dailyStats[dateKey][request.status]++;
      }
    }
    
    return Object.values(dailyStats);
  }
  
  // خروجی CSV از درخواست‌ها
  static async exportToCSV(filters = {}) {
    const { requests } = await this.findAll(filters);
    
    const headers = ['شناسه', 'نام', 'شماره موبایل', 'شهر', 'متراژ', 'پیام', 'وضعیت', 'تاریخ ثبت'];
    
    const rows = requests.map(r => [
      r.id,
      r.name,
      r.mobile,
      r.city || '',
      r.areaM2 || '',
      r.message || '',
      r.status === 'new' ? 'جدید' : r.status === 'contacted' ? 'تماس گرفته شده' : 'پیگیری شده',
      new Date(r.createdAt).toLocaleDateString('fa-IR')
    ]);
    
    return { headers, rows };
  }
}

export default Contact;
