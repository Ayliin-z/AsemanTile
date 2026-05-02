// backend/src/models/Partner.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let partners = [
  {
    id: 1,
    user_id: 10,
    user_name: 'احمد کریمی',
    user_mobile: '9123456789',
    user_email: 'ahmad@partner.com',
    company_name: 'شرکت ساختمانی کریمی',
    national_id: '1234567890',
    economic_code: '12345678',
    city: 'شیراز',
    address: 'بلوار پاسداران، کوچه ۶۰',
    postal_code: '7198765432',
    phone: '07132345678',
    credit_limit: 50000000,
    used_credit: 12500000,
    remaining_credit: 37500000,
    discount_rate: 15,
    is_approved: true,
    approved_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'همکار فعال و خوش‌حساب',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: 11,
    user_name: 'سارا محمدی',
    user_mobile: '9123456788',
    user_email: 'sara@partner.com',
    company_name: 'طراحی و دکوراسیون سارا',
    national_id: '1234567891',
    economic_code: '12345679',
    city: 'تهران',
    address: 'خیابان ولیعصر، بالاتر از میدان تجریش',
    postal_code: '1987654321',
    phone: '02122345678',
    credit_limit: 30000000,
    used_credit: 5000000,
    remaining_credit: 25000000,
    discount_rate: 12,
    is_approved: true,
    approved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 12,
    user_name: 'رضا نادری',
    user_mobile: '9123456787',
    user_email: 'reza@partner.com',
    company_name: 'ساخت و ساز نادری',
    national_id: '1234567892',
    economic_code: '12345680',
    city: 'اصفهان',
    address: 'خیابان چهارباغ، کوچه صفا',
    postal_code: '8165432198',
    phone: '03132345678',
    credit_limit: 0,
    used_credit: 0,
    remaining_credit: 0,
    discount_rate: 10,
    is_approved: false,
    approved_at: null,
    notes: 'در انتظار بررسی مدارک',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextId = 4;

// ========== کلاس Partner ==========
class Partner {
  // نرمالایز کردن اطلاعات همکار
  static normalize(partner) {
    return {
      id: partner.id,
      userId: partner.user_id,
      userName: partner.user_name,
      userMobile: partner.user_mobile,
      userEmail: partner.user_email,
      companyName: partner.company_name,
      nationalId: partner.national_id,
      economicCode: partner.economic_code,
      city: partner.city,
      address: partner.address,
      postalCode: partner.postal_code,
      phone: partner.phone,
      creditLimit: partner.credit_limit,
      usedCredit: partner.used_credit,
      remainingCredit: partner.remaining_credit,
      discountRate: partner.discount_rate,
      isApproved: partner.is_approved,
      approvedAt: partner.approved_at,
      notes: partner.notes,
      createdAt: partner.created_at,
      updatedAt: partner.updated_at
    };
  }
  
  // دریافت همه همکاران
  static async findAll(filters = {}) {
    let filtered = [...partners];
    
    // فیلتر بر اساس وضعیت تأیید
    if (filters.status === 'approved') {
      filtered = filtered.filter(p => p.is_approved === true);
    } else if (filters.status === 'pending') {
      filtered = filtered.filter(p => p.is_approved === false);
    }
    
    // فیلتر بر اساس شهر
    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }
    
    // جستجو
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.company_name?.toLowerCase().includes(searchLower) ||
        p.user_name?.toLowerCase().includes(searchLower) ||
        p.user_mobile?.includes(filters.search) ||
        p.user_email?.toLowerCase().includes(searchLower)
      );
    }
    
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // صفحه‌بندی
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      partners: paginated.map(p => this.normalize(p)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // دریافت همکار با ID
  static async findById(id) {
    const partner = partners.find(p => p.id === id);
    if (!partner) return null;
    
    return this.normalize(partner);
  }
  
  // دریافت همکار با user_id
  static async findByUserId(userId) {
    const partner = partners.find(p => p.user_id === userId);
    if (!partner) return null;
    
    return this.normalize(partner);
  }
  
  // دریافت همکاران در انتظار تأیید
  static async getPending() {
    const pending = partners.filter(p => p.is_approved === false);
    pending.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return pending.map(p => this.normalize(p));
  }
  
  // دریافت همکاران تأیید شده
  static async getApproved() {
    const approved = partners.filter(p => p.is_approved === true);
    approved.sort((a, b) => a.company_name.localeCompare(b.company_name));
    return approved.map(p => this.normalize(p));
  }
  
  // ایجاد همکار جدید
  static async create(partnerData) {
    const {
      user_id, user_name, user_mobile, user_email,
      company_name, national_id, economic_code,
      city, address, postal_code, phone,
      credit_limit, discount_rate, notes
    } = partnerData;
    
    if (!user_id || !company_name) {
      throw new Error('user_id و نام شرکت الزامی است');
    }
    
    // بررسی وجود همکار تکراری برای این کاربر
    const existing = partners.find(p => p.user_id === user_id);
    if (existing) {
      throw new Error('این کاربر قبلاً به عنوان همکار ثبت شده است');
    }
    
    const newPartner = {
      id: nextId++,
      user_id: parseInt(user_id),
      user_name: user_name || '',
      user_mobile: user_mobile || '',
      user_email: user_email || '',
      company_name: company_name.trim(),
      national_id: national_id || null,
      economic_code: economic_code || null,
      city: city || null,
      address: address || null,
      postal_code: postal_code || null,
      phone: phone || null,
      credit_limit: credit_limit || 0,
      used_credit: 0,
      remaining_credit: credit_limit || 0,
      discount_rate: discount_rate || 0,
      is_approved: false,
      approved_at: null,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    partners.push(newPartner);
    return this.normalize(newPartner);
  }
  
  // تأیید همکار
  static async approve(id, approvedBy = null) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    if (partners[index].is_approved) {
      throw new Error('همکار قبلاً تأیید شده است');
    }
    
    partners[index].is_approved = true;
    partners[index].approved_at = new Date().toISOString();
    partners[index].updated_at = new Date().toISOString();
    partners[index].remaining_credit = partners[index].credit_limit - partners[index].used_credit;
    
    return this.normalize(partners[index]);
  }
  
  // رد درخواست همکاری
  static async reject(id) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    if (partners[index].is_approved) {
      throw new Error('همکار قبلاً تأیید شده و قابل رد نیست');
    }
    
    partners.splice(index, 1);
    return true;
  }
  
  // به‌روزرسانی اطلاعات همکار
  static async update(id, updates) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    const fields = ['company_name', 'national_id', 'economic_code', 'city', 'address', 
                    'postal_code', 'phone', 'notes'];
    for (const field of fields) {
      if (updates[field] !== undefined) {
        partners[index][field] = updates[field] || null;
      }
    }
    
    if (updates.discount_rate !== undefined) {
      partners[index].discount_rate = updates.discount_rate;
    }
    
    partners[index].updated_at = new Date().toISOString();
    
    return this.normalize(partners[index]);
  }
  
  // به‌روزرسانی سقف اعتبار
  static async updateCreditLimit(id, newCreditLimit) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    partners[index].credit_limit = newCreditLimit;
    partners[index].remaining_credit = newCreditLimit - partners[index].used_credit;
    partners[index].updated_at = new Date().toISOString();
    
    return this.normalize(partners[index]);
  }
  
  // کاهش اعتبار (وقتی پیش‌فاکتور ثبت می‌شود)
  static async deductCredit(id, amount) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    const newUsedCredit = partners[index].used_credit + amount;
    if (newUsedCredit > partners[index].credit_limit) {
      throw new Error('اعتبار کافی نیست');
    }
    
    partners[index].used_credit = newUsedCredit;
    partners[index].remaining_credit = partners[index].credit_limit - newUsedCredit;
    partners[index].updated_at = new Date().toISOString();
    
    return {
      used_credit: partners[index].used_credit,
      remaining_credit: partners[index].remaining_credit
    };
  }
  
  // افزایش اعتبار (در صورت تسویه یا لغو)
  static async addCredit(id, amount) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    const newUsedCredit = Math.max(0, partners[index].used_credit - amount);
    partners[index].used_credit = newUsedCredit;
    partners[index].remaining_credit = partners[index].credit_limit - newUsedCredit;
    partners[index].updated_at = new Date().toISOString();
    
    return {
      used_credit: partners[index].used_credit,
      remaining_credit: partners[index].remaining_credit
    };
  }
  
  // حذف همکار
  static async delete(id) {
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('همکار یافت نشد');
    }
    
    partners.splice(index, 1);
    return true;
  }
  
  // آمار همکاران
  static async getStats() {
    const total = partners.length;
    const approved = partners.filter(p => p.is_approved).length;
    const pending = partners.filter(p => !p.is_approved).length;
    
    const totalCredit = partners.reduce((sum, p) => sum + p.credit_limit, 0);
    const totalUsed = partners.reduce((sum, p) => sum + p.used_credit, 0);
    const totalRemaining = partners.reduce((sum, p) => sum + p.remaining_credit, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPartners = partners.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
    
    return {
      total,
      approved,
      pending,
      new_partners_last_30_days: newPartners,
      credit: {
        total_limit: totalCredit,
        total_used: totalUsed,
        total_remaining: totalRemaining
      }
    };
  }
  
  // دریافت شهرهای فعال همکاران
  static async getActiveCities() {
    const cities = [...new Set(partners.filter(p => p.is_approved && p.city).map(p => p.city))];
    return cities.sort();
  }
}

export default Partner;
