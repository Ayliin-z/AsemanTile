// backend/src/models/Brand.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let brands = [
  { 
    id: 1, 
    name: 'حافظ', 
    slug: 'hafez',
    enabled: true, 
    logo: '/images/brands/hafez.png',
    website: 'https://hafez.com',
    description: 'برند معتبر کاشی و سرامیک حافظ',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'آسمان', 
    slug: 'aseman',
    enabled: true, 
    logo: '/images/brands/aseman.png',
    website: 'https://aseman.com',
    description: 'برند اختصاصی آسمان',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 3, 
    name: 'چوبینه', 
    slug: 'choobineh',
    enabled: true, 
    logo: '/images/brands/choobineh.png',
    website: null,
    description: 'برند تخصصی طرح چوب',
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 4, 
    name: 'سرامیک البرز', 
    slug: 'alborz-ceramic',
    enabled: false, 
    logo: null,
    website: null,
    description: null,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 5, 
    name: 'اسپانیایی', 
    slug: 'spanish',
    enabled: true, 
    logo: '/images/brands/spanish.png',
    website: null,
    description: 'محصولات با طرح اسپانیایی',
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 6, 
    name: 'ماربل امپرادور', 
    slug: 'marble-emperador',
    enabled: true, 
    logo: null,
    website: null,
    description: 'طرح مرمر امپرادور',
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 7, 
    name: 'پرسلان نیو کارن', 
    slug: 'porcelain-new-carn',
    enabled: false, 
    logo: null,
    website: null,
    description: 'پرسلان با کیفیت بالا',
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextId = 8;

// ========== توابع کمکی ==========
const generateSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ========== کلاس Brand ==========
class Brand {
  // نرمالایز کردن برند
  static normalize(brand) {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      enabled: brand.enabled,
      logo: brand.logo || null,
      website: brand.website || null,
      description: brand.description || null,
      sort_order: brand.sort_order,
      createdAt: brand.created_at,
      updatedAt: brand.updated_at
    };
  }
  
  // دریافت همه برندها
  static async findAll(filters = {}) {
    let filtered = [...brands];
    
    if (filters.enabled_only === 'true') {
      filtered = filtered.filter(b => b.enabled === true);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        (b.description && b.description.toLowerCase().includes(searchLower))
      );
    }
    
    // مرتب‌سازی بر اساس sort_order
    filtered.sort((a, b) => a.sort_order - b.sort_order);
    
    return filtered.map(b => this.normalize(b));
  }
  
  // دریافت برندهای فعال (فقط نام‌ها)
  static async getEnabledNames() {
    const enabledBrands = brands.filter(b => b.enabled === true);
    enabledBrands.sort((a, b) => a.sort_order - b.sort_order);
    return enabledBrands.map(b => b.name);
  }
  
  // دریافت برند با ID
  static async findById(id) {
    const brand = brands.find(b => b.id === id);
    if (!brand) return null;
    
    return this.normalize(brand);
  }
  
  // دریافت برند با slug
  static async findBySlug(slug) {
    const brand = brands.find(b => b.slug === slug);
    if (!brand) return null;
    
    return this.normalize(brand);
  }
  
  // دریافت برند با نام
  static async findByName(name) {
    const brand = brands.find(b => b.name === name);
    if (!brand) return null;
    
    return this.normalize(brand);
  }
  
  // ایجاد برند جدید
  static async create(brandData) {
    const { name, slug, enabled, logo, website, description, sort_order } = brandData;
    
    if (!name || name.trim() === '') {
      throw new Error('نام برند الزامی است');
    }
    
    const trimmedName = name.trim();
    
    // بررسی وجود برند تکراری
    const existing = brands.find(b => b.name === trimmedName);
    if (existing) {
      throw new Error('این برند قبلاً وجود دارد');
    }
    
    // تولید slug اگر داده نشده
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(trimmedName);
    }
    
    // بررسی یکتایی slug
    const existingSlug = brands.find(b => b.slug === finalSlug);
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }
    
    const newBrand = {
      id: nextId++,
      name: trimmedName,
      slug: finalSlug,
      enabled: enabled !== undefined ? enabled : true,
      logo: logo || null,
      website: website || null,
      description: description || null,
      sort_order: sort_order !== undefined ? sort_order : brands.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    brands.push(newBrand);
    return this.normalize(newBrand);
  }
  
  // به‌روزرسانی برند
  static async update(id, updates) {
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('برند یافت نشد');
    }
    
    // بررسی نام تکراری (اگر نام تغییر کرده)
    if (updates.name && updates.name.trim() !== '') {
      const trimmedName = updates.name.trim();
      const duplicate = brands.find(b => b.name === trimmedName && b.id !== id);
      if (duplicate) {
        throw new Error('این نام قبلاً وجود دارد');
      }
      brands[index].name = trimmedName;
      
      // به‌روزرسانی slug هم اگر نام تغییر کرده
      if (!updates.slug) {
        brands[index].slug = generateSlug(trimmedName);
      }
    }
    
    // به‌روزرسانی slug
    if (updates.slug && updates.slug.trim() !== '') {
      const duplicate = brands.find(b => b.slug === updates.slug && b.id !== id);
      if (duplicate) {
        throw new Error('این slug قبلاً استفاده شده است');
      }
      brands[index].slug = updates.slug.trim();
    }
    
    // به‌روزرسانی سایر فیلدها
    if (updates.enabled !== undefined) {
      brands[index].enabled = updates.enabled;
    }
    if (updates.logo !== undefined) {
      brands[index].logo = updates.logo;
    }
    if (updates.website !== undefined) {
      brands[index].website = updates.website;
    }
    if (updates.description !== undefined) {
      brands[index].description = updates.description;
    }
    if (updates.sort_order !== undefined) {
      brands[index].sort_order = updates.sort_order;
    }
    
    brands[index].updated_at = new Date().toISOString();
    
    return this.normalize(brands[index]);
  }
  
  // تغییر وضعیت فعال/غیرفعال
  static async toggleEnabled(id) {
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('برند یافت نشد');
    }
    
    brands[index].enabled = !brands[index].enabled;
    brands[index].updated_at = new Date().toISOString();
    
    return this.normalize(brands[index]);
  }
  
  // حذف برند
  static async delete(id) {
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('برند یافت نشد');
    }
    
    brands.splice(index, 1);
    return true;
  }
  
  // تغییر ترتیب برندها
  static async reorder(orders) {
    for (const item of orders) {
      const brand = brands.find(b => b.id === item.id);
      if (brand) {
        brand.sort_order = item.sort_order;
        brand.updated_at = new Date().toISOString();
      }
    }
    return true;
  }
  
  // اطمینان از وجود برند (در صورت نبود، ایجاد می‌کند)
  static async ensureExists(brandName) {
    if (!brandName || brandName.trim() === '') return null;
    
    const trimmedName = brandName.trim();
    let brand = brands.find(b => b.name === trimmedName);
    
    if (!brand) {
      brand = await this.create({ name: trimmedName, enabled: false });
    }
    
    return this.normalize(brand);
  }
  
  // آمار برندها
  static async getStats() {
    return {
      total: brands.length,
      enabled: brands.filter(b => b.enabled).length,
      disabled: brands.filter(b => !b.enabled).length,
      with_logo: brands.filter(b => b.logo).length
    };
  }
}

export default Brand;
