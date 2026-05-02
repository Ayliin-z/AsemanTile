// backend/src/api/categories.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let categories = [
  { 
    id: 1, 
    name: 'کاشی', 
    slug: 'kashi', 
    parent_id: null, 
    image: '/images/categories/kashi.jpg', 
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'سرامیک', 
    slug: 'ceramic', 
    parent_id: null, 
    image: '/images/categories/ceramic.jpg', 
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  { 
    id: 3, 
    name: 'موزاییک', 
    slug: 'mosaic', 
    parent_id: null, 
    image: '/images/categories/mosaic.jpg', 
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  { 
    id: 4, 
    name: 'کاشی دیواری', 
    slug: 'wall-tile', 
    parent_id: 1, 
    image: null, 
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  { 
    id: 5, 
    name: 'کاشی کف', 
    slug: 'floor-tile', 
    parent_id: 1, 
    image: null, 
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  { 
    id: 6, 
    name: 'سرامیک کف', 
    slug: 'floor-ceramic', 
    parent_id: 2, 
    image: null, 
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  { 
    id: 7, 
    name: 'سرامیک دیوار', 
    slug: 'wall-ceramic', 
    parent_id: 2, 
    image: null, 
    sort_order: 2,
    created_at: new Date().toISOString()
  }
];

// ========== توابع کمکی ==========

// ساخت اسلاگ از نام
const generateSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ساخت ساختار درختی
const buildCategoryTree = (categoriesList, parentId = null) => {
  return categoriesList
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categoriesList, cat.id)
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
};

// ========== GET /api/categories ==========
// دریافت همه دسته‌بندی‌ها (به صورت درختی یا تخت)
router.get('/', async (req, res) => {
  try {
    const { flat } = req.query;
    
    if (flat === 'true') {
      // برگرداندن لیست تخت (بدون ساختار درختی)
      const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
      return res.json({ success: true, data: sorted });
    }
    
    // برگرداندن ساختار درختی
    const tree = buildCategoryTree(categories);
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/categories/:id ==========
// دریافت یک دسته‌بندی با ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const category = categories.find(c => c.id === id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'دسته‌بندی یافت نشد' });
    }
    
    // دریافت زیرمجموعه‌ها
    const children = categories.filter(c => c.parent_id === id);
    
    res.json({ 
      success: true, 
      data: {
        ...category,
        children
      }
    });
  } catch (error) {
    console.error('GET /api/categories/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/categories/slug/:slug ==========
// دریافت دسته‌بندی با slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = categories.find(c => c.slug === slug);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'دسته‌بندی یافت نشد' });
    }
    
    // دریافت زیرمجموعه‌ها
    const children = categories.filter(c => c.parent_id === category.id);
    
    // دریافت دسته والد
    let parent = null;
    if (category.parent_id) {
      parent = categories.find(c => c.id === category.parent_id);
    }
    
    res.json({ 
      success: true, 
      data: {
        ...category,
        children,
        parent
      }
    });
  } catch (error) {
    console.error('GET /api/categories/slug/:slug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/categories ==========
// ایجاد دسته‌بندی جدید
router.post('/', async (req, res) => {
  try {
    const { name, slug, parent_id, image, sort_order } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'نام دسته‌بندی الزامی است' });
    }
    
    // تولید slug اگر داده نشده
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(name);
    }
    
    // بررسی یکتایی slug
    const existingSlug = categories.find(c => c.slug === finalSlug);
    if (existingSlug) {
      return res.status(409).json({ success: false, error: 'این slug قبلاً استفاده شده است' });
    }
    
    // بررسی وجود والد (اگر مشخص شده)
    if (parent_id) {
      const parent = categories.find(c => c.id === parent_id);
      if (!parent) {
        return res.status(400).json({ success: false, error: 'دسته والد یافت نشد' });
      }
    }
    
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCategory = {
      id: newId,
      name: name.trim(),
      slug: finalSlug,
      parent_id: parent_id || null,
      image: image || null,
      sort_order: sort_order !== undefined ? sort_order : 0,
      created_at: new Date().toISOString()
    };
    
    categories.push(newCategory);
    
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/categories/:id ==========
// به‌روزرسانی دسته‌بندی
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, parent_id, image, sort_order } = req.body;
    
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, error: 'دسته‌بندی یافت نشد' });
    }
    
    // بررسی اینکه والد خودش نباشد
    if (parent_id === id) {
      return res.status(400).json({ success: false, error: 'دسته نمی‌تواند والد خودش باشد' });
    }
    
    // بررسی وجود والد (اگر مشخص شده)
    if (parent_id) {
      const parent = categories.find(c => c.id === parent_id);
      if (!parent) {
        return res.status(400).json({ success: false, error: 'دسته والد یافت نشد' });
      }
    }
    
    // به‌روزرسانی نام
    if (name && name.trim() !== '') {
      categories[categoryIndex].name = name.trim();
    }
    
    // به‌روزرسانی slug
    if (slug && slug.trim() !== '') {
      const existingSlug = categories.find(c => c.slug === slug && c.id !== id);
      if (existingSlug) {
        return res.status(409).json({ success: false, error: 'این slug قبلاً استفاده شده است' });
      }
      categories[categoryIndex].slug = slug.trim();
    }
    
    // به‌روزرسانی سایر فیلدها
    if (parent_id !== undefined) {
      categories[categoryIndex].parent_id = parent_id || null;
    }
    if (image !== undefined) {
      categories[categoryIndex].image = image;
    }
    if (sort_order !== undefined) {
      categories[categoryIndex].sort_order = sort_order;
    }
    
    categories[categoryIndex].updated_at = new Date().toISOString();
    
    res.json({ success: true, data: categories[categoryIndex] });
  } catch (error) {
    console.error('PUT /api/categories/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DELETE /api/categories/:id ==========
// حذف دسته‌بندی
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // بررسی وجود زیرمجموعه
    const hasChildren = categories.some(c => c.parent_id === id);
    if (hasChildren) {
      return res.status(400).json({ 
        success: false, 
        error: 'این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا جابه‌جا کنید.' 
      });
    }
    
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, error: 'دسته‌بندی یافت نشد' });
    }
    
    categories.splice(categoryIndex, 1);
    
    res.json({ success: true, message: 'دسته‌بندی با موفقیت حذف شد' });
  } catch (error) {
    console.error('DELETE /api/categories/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/categories/reorder ==========
// تغییر ترتیب دسته‌بندی‌ها
router.patch('/reorder', async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 1, sort_order: 0 }, ...]
    
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ 
        success: false, 
        error: 'آرایه‌ای از ترتیب‌ها ارسال کنید' 
      });
    }
    
    for (const item of orders) {
      const category = categories.find(c => c.id === item.id);
      if (category) {
        category.sort_order = item.sort_order;
      }
    }
    
    res.json({ success: true, message: 'ترتیب با موفقیت به‌روزرسانی شد' });
  } catch (error) {
    console.error('PATCH /api/categories/reorder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/categories/parents ==========
// دریافت دسته‌بندی‌های والد (برای منوی اصلی)
router.get('/parents/list', async (req, res) => {
  try {
    const parents = categories.filter(c => !c.parent_id);
    parents.sort((a, b) => a.sort_order - b.sort_order);
    
    res.json({ success: true, data: parents });
  } catch (error) {
    console.error('GET /api/categories/parents error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/categories/:id/children ==========
// دریافت زیرمجموعه‌های یک دسته
router.get('/:id/children', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const category = categories.find(c => c.id === id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'دسته‌بندی یافت نشد' });
    }
    
    const children = categories.filter(c => c.parent_id === id);
    children.sort((a, b) => a.sort_order - b.sort_order);
    
    res.json({ success: true, data: children });
  } catch (error) {
    console.error('GET /api/categories/:id/children error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
