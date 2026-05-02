// backend/src/models/Category.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let categories = [
  { 
    id: 1, 
    name: 'کاشی', 
    slug: 'kashi', 
    parent_id: null, 
    image: '/images/categories/kashi.jpg', 
    sort_order: 1,
    description: 'انواع کاشی برای دیوار و کف',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'سرامیک', 
    slug: 'ceramic', 
    parent_id: null, 
    image: '/images/categories/ceramic.jpg', 
    sort_order: 2,
    description: 'انواع سرامیک برای کف و دیوار',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 3, 
    name: 'موزاییک', 
    slug: 'mosaic', 
    parent_id: null, 
    image: '/images/categories/mosaic.jpg', 
    sort_order: 3,
    description: 'انواع موزاییک برای فضاهای خاص',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 4, 
    name: 'کاشی دیواری', 
    slug: 'wall-tile', 
    parent_id: 1, 
    image: null, 
    sort_order: 1,
    description: 'کاشی مخصوص دیوار',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 5, 
    name: 'کاشی کف', 
    slug: 'floor-tile', 
    parent_id: 1, 
    image: null, 
    sort_order: 2,
    description: 'کاشی مخصوص کف با مقاومت بالا',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 6, 
    name: 'سرامیک کف', 
    slug: 'floor-ceramic', 
    parent_id: 2, 
    image: null, 
    sort_order: 1,
    description: 'سرامیک مخصوص کف',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 7, 
    name: 'سرامیک دیوار', 
    slug: 'wall-ceramic', 
    parent_id: 2, 
    image: null, 
    sort_order: 2,
    description: 'سرامیک مخصوص دیوار',
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

// ========== کلاس Category ==========
class Category {
  // نرمالایز کردن دسته‌بندی
  static normalize(category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      image: category.image || null,
      sort_order: category.sort_order,
      description: category.description || null,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }
  
  // ساخت ساختار درختی
  static buildTree(parentId = null) {
    const filtered = categories.filter(c => c.parent_id === parentId);
    return filtered
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => ({
        ...this.normalize(cat),
        children: this.buildTree(cat.id)
      }));
  }
  
  // دریافت همه دسته‌بندی‌ها (تخت)
  static async findAll(flat = true) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    
    if (flat) {
      return sorted.map(c => this.normalize(c));
    }
    
    return this.buildTree();
  }
  
  // دریافت دسته‌بندی با ID
  static async findById(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return null;
    
    // دریافت زیرمجموعه‌ها
    const children = categories.filter(c => c.parent_id === id);
    const parent = category.parent_id ? categories.find(c => c.id === category.parent_id) : null;
    
    return {
      ...this.normalize(category),
      children: children.map(c => this.normalize(c)),
      parent: parent ? this.normalize(parent) : null
    };
  }
  
  // دریافت دسته‌بندی با slug
  static async findBySlug(slug) {
    const category = categories.find(c => c.slug === slug);
    if (!category) return null;
    
    const children = categories.filter(c => c.parent_id === category.id);
    const parent = category.parent_id ? categories.find(c => c.id === category.parent_id) : null;
    
    return {
      ...this.normalize(category),
      children: children.map(c => this.normalize(c)),
      parent: parent ? this.normalize(parent) : null
    };
  }
  
  // دریافت دسته‌بندی‌های والد (برای منوی اصلی)
  static async getParents() {
    const parents = categories.filter(c => !c.parent_id);
    return parents
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => this.normalize(c));
  }
  
  // دریافت زیرمجموعه‌های یک دسته
  static async getChildren(parentId) {
    const children = categories.filter(c => c.parent_id === parentId);
    return children
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => this.normalize(c));
  }
  
  // ایجاد دسته‌بندی جدید
  static async create(categoryData) {
    const { name, slug, parent_id, image, sort_order, description } = categoryData;
    
    if (!name || name.trim() === '') {
      throw new Error('نام دسته‌بندی الزامی است');
    }
    
    // تولید slug اگر داده نشده
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(name);
    }
    
    // بررسی یکتایی slug
    const existing = categories.find(c => c.slug === finalSlug);
    if (existing) {
      throw new Error('این slug قبلاً استفاده شده است');
    }
    
    // بررسی وجود والد (اگر مشخص شده)
    if (parent_id) {
      const parent = categories.find(c => c.id === parent_id);
      if (!parent) {
        throw new Error('دسته والد یافت نشد');
      }
    }
    
    const newCategory = {
      id: nextId++,
      name: name.trim(),
      slug: finalSlug,
      parent_id: parent_id || null,
      image: image || null,
      sort_order: sort_order !== undefined ? sort_order : 0,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    categories.push(newCategory);
    return this.normalize(newCategory);
  }
  
  // به‌روزرسانی دسته‌بندی
  static async update(id, updates) {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('دسته‌بندی یافت نشد');
    }
    
    // بررسی اینکه والد خودش نباشد
    if (updates.parent_id === id) {
      throw new Error('دسته نمی‌تواند والد خودش باشد');
    }
    
    // بررسی وجود والد (اگر مشخص شده)
    if (updates.parent_id) {
      const parent = categories.find(c => c.id === updates.parent_id);
      if (!parent) {
        throw new Error('دسته والد یافت نشد');
      }
    }
    
    // به‌روزرسانی نام
    if (updates.name && updates.name.trim() !== '') {
      categories[index].name = updates.name.trim();
    }
    
    // به‌روزرسانی slug
    if (updates.slug && updates.slug.trim() !== '') {
      const existing = categories.find(c => c.slug === updates.slug && c.id !== id);
      if (existing) {
        throw new Error('این slug قبلاً استفاده شده است');
      }
      categories[index].slug = updates.slug.trim();
    }
    
    // به‌روزرسانی سایر فیلدها
    if (updates.parent_id !== undefined) {
      categories[index].parent_id = updates.parent_id || null;
    }
    if (updates.image !== undefined) {
      categories[index].image = updates.image;
    }
    if (updates.sort_order !== undefined) {
      categories[index].sort_order = updates.sort_order;
    }
    if (updates.description !== undefined) {
      categories[index].description = updates.description;
    }
    
    categories[index].updated_at = new Date().toISOString();
    
    return this.normalize(categories[index]);
  }
  
  // حذف دسته‌بندی
  static async delete(id) {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('دسته‌بندی یافت نشد');
    }
    
    // بررسی وجود زیرمجموعه
    const hasChildren = categories.some(c => c.parent_id === id);
    if (hasChildren) {
      throw new Error('این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا جابه‌جا کنید');
    }
    
    categories.splice(index, 1);
    return true;
  }
  
  // تغییر ترتیب دسته‌بندی‌ها
  static async reorder(orders) {
    for (const item of orders) {
      const category = categories.find(c => c.id === item.id);
      if (category) {
        category.sort_order = item.sort_order;
        category.updated_at = new Date().toISOString();
      }
    }
    return true;
  }
  
  // دریافت مسیر کامل یک دسته (برای breadcrumb)
  static async getPath(categoryId) {
    const path = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories.find(c => c.id === currentId);
      if (!category) break;
      
      path.unshift(this.normalize(category));
      currentId = category.parent_id;
    }
    
    return path;
  }
  
  // آمار دسته‌بندی‌ها
  static async getStats() {
    const parents = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => c.parent_id);
    
    return {
      total: categories.length,
      parent_categories: parents.length,
      child_categories: children.length,
      max_depth: this.getMaxDepth()
    };
  }
  
  // محاسبه حداکثر عمق
  static getMaxDepth() {
    let maxDepth = 0;
    
    const calculateDepth = (parentId, depth) => {
      const children = categories.filter(c => c.parent_id === parentId);
      if (children.length === 0) {
        maxDepth = Math.max(maxDepth, depth);
      } else {
        for (const child of children) {
          calculateDepth(child.id, depth + 1);
        }
      }
    };
    
    calculateDepth(null, 0);
    return maxDepth;
  }
}

export default Category;
