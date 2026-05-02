// backend/src/models/Product.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let products = [
  {
    id: 1,
    productcode: 'KSH-001',
    grade: 'A',
    name: 'کاشی طرح سنگ تراورتن',
    price: 185000,
    partnerprice: 148000,
    discount: 15,
    stock: 450,
    description: 'کاشی با کیفیت بالا با طرح سنگ طبیعی تراورتن',
    manufacturer: 'حافظ',
    glazetype: 'براق',
    suitablefor: 'کف و دیوار',
    category: 'کاشی',
    size: '60*60',
    glaze: 'براق',
    color: 'کرم',
    images: ['/images/products/kashi-travertin-1.jpg'],
    fulldescription: '<h2>کاشی طرح سنگ تراورتن</h2><p>مناسب برای دکوراسیون داخلی</p>',
    tags: ['جدید', 'پرفروش'],
    audience: 'all',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    productcode: 'SRM-002',
    grade: 'A',
    name: 'سرامیک طرح چوب',
    price: 220000,
    partnerprice: 176000,
    discount: 10,
    stock: 320,
    description: 'سرامیک طرح چوب طبیعی برای دکوراسیون مدرن',
    manufacturer: 'آسمان',
    glazetype: 'مات',
    suitablefor: 'کف',
    category: 'سرامیک',
    size: '120*20',
    glaze: 'مات',
    color: 'قهوه‌ای',
    images: ['/images/products/ceramic-wood-1.jpg'],
    fulldescription: '<h2>سرامیک طرح چوب</h2><p>ضدخش و مقاوم در برابر رطوبت</p>',
    tags: ['پرفروش', 'فروش ویژه'],
    audience: 'all',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    productcode: 'MS-003',
    grade: 'B',
    name: 'موزاییک شیشه‌ای',
    price: 350000,
    partnerprice: 280000,
    discount: 0,
    stock: 120,
    description: 'موزاییک شیشه‌ای لاجوردی برای سرویس بهداشتی',
    manufacturer: 'چوبینه',
    glazetype: 'شیشه‌ای',
    suitablefor: 'دیوار',
    category: 'موزاییک',
    size: '30*30',
    glaze: 'براق',
    color: 'آبی',
    images: ['/images/products/mosaic-glass-1.jpg'],
    fulldescription: '<h2>موزاییک شیشه‌ای</h2><p>مناسب برای کاشی کاری سرویس بهداشتی</p>',
    tags: ['جدید'],
    audience: 'customers',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    productcode: 'PRL-004',
    grade: 'A',
    name: 'پرسلان فوق براق',
    price: 420000,
    partnerprice: 336000,
    discount: 20,
    stock: 85,
    description: 'پرسلان فوق براق طرح مرمر',
    manufacturer: 'پرسلان نیو کارن',
    glazetype: 'فوق براق',
    suitablefor: 'کف',
    category: 'سرامیک',
    size: '80*80',
    glaze: 'پولیش',
    color: 'سفید',
    images: ['/images/products/porcelain-marble-1.jpg'],
    fulldescription: '<h2>پرسلان فوق براق</h2><p>مناسب برای فضاهای لوکس</p>',
    tags: ['فروش ویژه', 'فروش امروز'],
    audience: 'all',
    views: 0,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    productcode: 'KSH-005',
    grade: 'A',
    name: 'کاشی سه بعدی',
    price: 295000,
    partnerprice: 236000,
    discount: 5,
    stock: 200,
    description: 'کاشی سه بعدی با طرح مدرن',
    manufacturer: 'اسپانیایی',
    glazetype: 'براق',
    suitablefor: 'دیوار',
    category: 'کاشی',
    size: '40*40',
    glaze: 'براق',
    color: 'طوسی',
    images: ['/images/products/kashi-3d-1.jpg'],
    fulldescription: '<h2>کاشی سه بعدی</h2><p>ایجاد عمق و زیبایی در فضا</p>',
    tags: ['جدید', 'فروش ویژه'],
    audience: 'all',
    views: 0,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextId = 6;

// ========== کلاس Product ==========
class Product {
  // نرمالایز کردن محصول برای خروجی
  static normalize(product) {
    return {
      id: product.id,
      productCode: product.productcode,
      grade: product.grade,
      name: product.name,
      price: Number(product.price),
      partnerPrice: Number(product.partnerprice),
      discount: Number(product.discount),
      stock: Number(product.stock),
      description: product.description || '',
      manufacturer: product.manufacturer || '',
      glazeType: product.glazetype || '',
      suitableFor: product.suitablefor || '',
      category: product.category || '',
      size: product.size || '',
      glaze: product.glaze || '',
      color: product.color || '',
      images: Array.isArray(product.images) ? product.images : [],
      fullDescription: product.fulldescription || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      audience: product.audience || 'all',
      views: product.views || 0,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }
  
  // دریافت همه محصولات
  static async findAll(filters = {}) {
    let filtered = [...products];
    
    // فیلتر بر اساس دسته‌بندی
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    // فیلتر بر اساس شرکت سازنده
    if (filters.manufacturer) {
      filtered = filtered.filter(p => p.manufacturer === filters.manufacturer);
    }
    
    // فیلتر بر اساس تگ
    if (filters.tag) {
      filtered = filtered.filter(p => p.tags && p.tags.includes(filters.tag));
    }
    
    // فیلتر بر اساس مخاطب
    if (filters.audience) {
      filtered = filtered.filter(p => p.audience === filters.audience || p.audience === 'all');
    }
    
    // فیلتر بر اساس محدوده قیمت
    if (filters.min_price) {
      filtered = filtered.filter(p => p.price >= filters.min_price);
    }
    if (filters.max_price) {
      filtered = filtered.filter(p => p.price <= filters.max_price);
    }
    
    // جستجو
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.productcode.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    
    // مرتب‌سازی
    if (filters.sort_by) {
      const sortField = filters.sort_by;
      const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
      
      filtered.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (sortField === 'price') {
          valA = Number(valA);
          valB = Number(valB);
        } else if (sortField === 'name') {
          return valA.localeCompare(valB) * sortOrder;
        }
        
        if (valA < valB) return -1 * sortOrder;
        if (valA > valB) return 1 * sortOrder;
        return 0;
      });
    }
    
    // صفحه‌بندی
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      products: paginated.map(p => this.normalize(p)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // دریافت محصول با ID
  static async findById(id) {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    
    // افزایش بازدید
    product.views = (product.views || 0) + 1;
    
    return this.normalize(product);
  }
  
  // دریافت محصول با کد
  static async findByCode(productcode) {
    const product = products.find(p => p.productcode === productcode);
    if (!product) return null;
    
    return this.normalize(product);
  }
  
  // دریافت محصولات با دسته‌بندی
  static async findByCategory(category, limit = 10) {
    const filtered = products.filter(p => p.category === category);
    return filtered.slice(0, limit).map(p => this.normalize(p));
  }
  
  // دریافت محصولات با تگ
  static async findByTag(tag, limit = 10) {
    const filtered = products.filter(p => p.tags && p.tags.includes(tag));
    return filtered.slice(0, limit).map(p => this.normalize(p));
  }
  
  // دریافت محصولات تخفیف‌دار
  static async getDiscountedProducts(limit = 10) {
    const filtered = products.filter(p => p.discount > 0);
    filtered.sort((a, b) => b.discount - a.discount);
    return filtered.slice(0, limit).map(p => this.normalize(p));
  }
  
  // دریافت محصولات جدید
  static async getNewProducts(limit = 10) {
    const filtered = [...products];
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return filtered.slice(0, limit).map(p => this.normalize(p));
  }
  
  // دریافت محصولات پرفروش
  static async getBestSellers(limit = 10) {
    // بر اساس views یا در آینده بر اساس فروش واقعی
    const filtered = [...products];
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    return filtered.slice(0, limit).map(p => this.normalize(p));
  }
  
  // ایجاد محصول جدید
  static async create(productData) {
    const { productcode, name, price } = productData;
    
    if (!name || !price) {
      throw new Error('نام و قیمت محصول الزامی است');
    }
    
    // بررسی تکراری نبودن کد
    if (productcode) {
      const existing = products.find(p => p.productcode === productcode);
      if (existing) {
        throw new Error(`کد محصول "${productcode}" قبلاً وجود دارد`);
      }
    }
    
    const newProduct = {
      id: nextId++,
      productcode: productcode || `PRD-${nextId}`,
      grade: productData.grade || '',
      name: productData.name.trim(),
      price: Number(productData.price) || 0,
      partnerprice: Number(productData.partnerPrice || productData.price) || 0,
      discount: Number(productData.discount) || 0,
      stock: Number(productData.stock) || 0,
      description: productData.description || '',
      manufacturer: productData.manufacturer || '',
      glazetype: productData.glazeType || '',
      suitablefor: productData.suitableFor || '',
      category: productData.category || '',
      size: productData.size || '',
      glaze: productData.glaze || '',
      color: productData.color || '',
      images: Array.isArray(productData.images) ? productData.images : [],
      fulldescription: productData.fullDescription || '',
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      audience: productData.audience || 'all',
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    products.push(newProduct);
    return this.normalize(newProduct);
  }
  
  // به‌روزرسانی محصول
  static async update(id, updates) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('محصول یافت نشد');
    }
    
    // بررسی تکراری نبودن کد (اگر تغییر کرده)
    if (updates.productcode && updates.productcode !== products[index].productcode) {
      const existing = products.find(p => p.productcode === updates.productcode && p.id !== id);
      if (existing) {
        throw new Error(`کد محصول "${updates.productcode}" قبلاً وجود دارد`);
      }
      products[index].productcode = updates.productcode;
    }
    
    // به‌روزرسانی فیلدها
    const fields = ['grade', 'name', 'description', 'manufacturer', 'glazetype', 'suitablefor', 
                    'category', 'size', 'glaze', 'color', 'fulldescription', 'audience'];
    for (const field of fields) {
      if (updates[field] !== undefined) {
        products[index][field] = updates[field];
      }
    }
    
    // فیلدهای عددی
    if (updates.price !== undefined) products[index].price = Number(updates.price);
    if (updates.partnerPrice !== undefined) products[index].partnerprice = Number(updates.partnerPrice);
    if (updates.discount !== undefined) products[index].discount = Number(updates.discount);
    if (updates.stock !== undefined) products[index].stock = Number(updates.stock);
    
    // آرایه‌ها
    if (updates.images !== undefined) {
      products[index].images = Array.isArray(updates.images) ? updates.images : [];
    }
    if (updates.tags !== undefined) {
      products[index].tags = Array.isArray(updates.tags) ? updates.tags : [];
    }
    
    products[index].updated_at = new Date().toISOString();
    
    return this.normalize(products[index]);
  }
  
  // حذف محصول
  static async delete(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('محصول یافت نشد');
    }
    
    products.splice(index, 1);
    return true;
  }
  
  // به‌روزرسانی موجودی
  static async updateStock(id, quantity) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('محصول یافت نشد');
    }
    
    const newStock = products[index].stock + quantity;
    if (newStock < 0) {
      throw new Error(`موجودی کافی نیست. موجودی فعلی: ${products[index].stock}`);
    }
    
    products[index].stock = newStock;
    products[index].updated_at = new Date().toISOString();
    
    return {
      product_id: id,
      old_stock: products[index].stock - quantity,
      new_stock: newStock
    };
  }
  
  // اعمال تخفیف گروهی
  static async bulkDiscount(productIds, discountType, value) {
    const results = [];
    
    for (const id of productIds) {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        let newDiscount = products[index].discount;
        
        if (discountType === 'percent') {
          newDiscount = Math.min(100, Math.max(0, value));
        } else if (discountType === 'amount') {
          const newPrice = Math.max(0, products[index].price - value);
          newDiscount = Math.round(((products[index].price - newPrice) / products[index].price) * 100);
          newDiscount = Math.min(100, Math.max(0, newDiscount));
        }
        
        products[index].discount = newDiscount;
        products[index].updated_at = new Date().toISOString();
        
        results.push({
          id,
          old_discount: products[index].discount,
          new_discount: newDiscount
        });
      }
    }
    
    return results;
  }
  
  // دریافت گزینه‌های فیلتر
  static async getFilterOptions() {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const manufacturers = [...new Set(products.map(p => p.manufacturer).filter(Boolean))];
    const sizes = [...new Set(products.map(p => p.size).filter(Boolean))];
    const glazes = [...new Set(products.map(p => p.glaze).filter(Boolean))];
    const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
    const tags = [...new Set(products.flatMap(p => p.tags || []))];
    
    return {
      categories,
      manufacturers,
      sizes,
      glazes,
      colors,
      tags,
      price_range: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price))
      }
    };
  }
  
  // آمار محصولات
  static async getStats() {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
      total: products.length,
      total_stock: totalStock,
      total_value: totalValue,
      discounted: products.filter(p => p.discount > 0).length,
      out_of_stock: products.filter(p => p.stock === 0).length,
      low_stock: products.filter(p => p.stock > 0 && p.stock < 50).length,
      categories: [...new Set(products.map(p => p.category).filter(Boolean))].length,
      manufacturers: [...new Set(products.map(p => p.manufacturer).filter(Boolean))].length
    };
  }
}

export default Product;
