// backend/src/models/Tag.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let tags = [
  { id: 1, name: 'جدید', slug: 'new', is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'پرفروش', slug: 'bestseller', is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'تخفیف‌خورده', slug: 'discounted', is_active: true, created_at: new Date().toISOString() },
  { id: 4, name: 'ویژه', slug: 'special', is_active: true, created_at: new Date().toISOString() },
  { id: 5, name: 'فروش ویژه', slug: 'hot-sale', is_active: true, created_at: new Date().toISOString() },
  { id: 6, name: 'فروش امروز', slug: 'today-sale', is_active: false, created_at: new Date().toISOString() }
];

let nextId = 7;

// ========== توابع کمکی ==========
const generateSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ========== کلاس Tag ==========
class Tag {
  // نرمالایز کردن تگ
  static normalize(tag) {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      is_active: tag.is_active,
      createdAt: tag.created_at
    };
  }
  
  // دریافت همه تگ‌ها
  static async findAll(filters = {}) {
    let filtered = [...tags];
    
    if (filters.active_only === 'true') {
      filtered = filtered.filter(t => t.is_active === true);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(searchLower));
    }
    
    // مرتب‌سازی بر اساس نام
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    return filtered.map(t => this.normalize(t));
  }
  
  // دریافت تگ‌های فعال (فقط نام‌ها)
  static async getActiveNames() {
    const activeTags = tags.filter(t => t.is_active === true);
    activeTags.sort((a, b) => a.name.localeCompare(b.name));
    return activeTags.map(t => t.name);
  }
  
  // دریافت تگ با ID
  static async findById(id) {
    const tag = tags.find(t => t.id === id);
    if (!tag) return null;
    
    return this.normalize(tag);
  }
  
  // دریافت تگ با نام
  static async findByName(name) {
    const tag = tags.find(t => t.name === name);
    if (!tag) return null;
    
    return this.normalize(tag);
  }
  
  // دریافت تگ با slug
  static async findBySlug(slug) {
    const tag = tags.find(t => t.slug === slug);
    if (!tag) return null;
    
    return this.normalize(tag);
  }
  
  // ایجاد تگ جدید
  static async create(tagData) {
    const { name, is_active } = tagData;
    
    if (!name || name.trim() === '') {
      throw new Error('نام تگ الزامی است');
    }
    
    const trimmedName = name.trim();
    
    // بررسی وجود تگ تکراری
    const existing = tags.find(t => t.name === trimmedName);
    if (existing) {
      throw new Error('این تگ قبلاً وجود دارد');
    }
    
    const newTag = {
      id: nextId++,
      name: trimmedName,
      slug: generateSlug(trimmedName),
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString()
    };
    
    tags.push(newTag);
    return this.normalize(newTag);
  }
  
  // به‌روزرسانی تگ
  static async update(id, updates) {
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('تگ یافت نشد');
    }
    
    // بررسی نام تکراری (اگر نام تغییر کرده)
    if (updates.name && updates.name.trim() !== '') {
      const trimmedName = updates.name.trim();
      const duplicate = tags.find(t => t.name === trimmedName && t.id !== id);
      if (duplicate) {
        throw new Error('این نام قبلاً وجود دارد');
      }
      tags[index].name = trimmedName;
      tags[index].slug = generateSlug(trimmedName);
    }
    
    // به‌روزرسانی وضعیت فعال/غیرفعال
    if (updates.is_active !== undefined) {
      tags[index].is_active = updates.is_active;
    }
    
    return this.normalize(tags[index]);
  }
  
  // تغییر وضعیت فعال/غیرفعال
  static async toggleActive(id) {
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('تگ یافت نشد');
    }
    
    tags[index].is_active = !tags[index].is_active;
    return this.normalize(tags[index]);
  }
  
  // حذف تگ
  static async delete(id) {
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('تگ یافت نشد');
    }
    
    tags.splice(index, 1);
    return true;
  }
  
  // اطمینان از وجود تگ (در صورت نبود، ایجاد می‌کند)
  static async ensureExists(tagName) {
    if (!tagName || tagName.trim() === '') return null;
    
    const trimmedName = tagName.trim();
    let tag = tags.find(t => t.name === trimmedName);
    
    if (!tag) {
      tag = await this.create({ name: trimmedName, is_active: true });
    }
    
    return this.normalize(tag);
  }
  
  // اطمینان از وجود چند تگ همزمان
  static async ensureMultipleExists(tagNames) {
    if (!Array.isArray(tagNames)) return [];
    
    const results = [];
    for (const name of tagNames) {
      if (name && name.trim()) {
        const tag = await this.ensureExists(name);
        if (tag) results.push(tag.name);
      }
    }
    return results;
  }
  
  // آمار تگ‌ها
  static async getStats() {
    return {
      total: tags.length,
      active: tags.filter(t => t.is_active).length,
      inactive: tags.filter(t => !t.is_active).length
    };
  }
  
  // دریافت تگ‌های پرکاربرد (بیشترین استفاده در محصولات)
  // این متد بعداً با اتصال به محصولات کامل می‌شود
  static async getPopularTags(limit = 10) {
    // فعلاً همه تگ‌های فعال را برمی‌گرداند
    const activeTags = tags.filter(t => t.is_active);
    activeTags.sort((a, b) => a.name.localeCompare(b.name));
    return activeTags.slice(0, limit).map(t => this.normalize(t));
  }
}

export default Tag;
