// backend/src/api/brands.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let brands = [
  { id: 1, name: 'حافظ', enabled: true, created_at: new Date().toISOString() },
  { id: 2, name: 'آسمان', enabled: true, created_at: new Date().toISOString() },
  { id: 3, name: 'چوبینه', enabled: true, created_at: new Date().toISOString() },
  { id: 4, name: 'سرامیک البرز', enabled: false, created_at: new Date().toISOString() },
  { id: 5, name: 'اسپانیایی', enabled: true, created_at: new Date().toISOString() },
  { id: 6, name: 'ماربل امپرادور', enabled: true, created_at: new Date().toISOString() },
  { id: 7, name: 'پرسلان نیو کارن', enabled: false, created_at: new Date().toISOString() }
];

// ========== GET /api/brands ==========
// دریافت همه برندها
router.get('/', async (req, res) => {
  try {
    const { enabled_only } = req.query;
    
    let result = [...brands];
    
    // فیلتر بر اساس فعال بودن
    if (enabled_only === 'true') {
      result = result.filter(b => b.enabled === true);
    }
    
    // مرتب‌سازی بر اساس نام
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/brands error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/brands/:id ==========
// دریافت یک برند با ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = brands.find(b => b.id === id);
    
    if (!brand) {
      return res.status(404).json({ success: false, error: 'برند یافت نشد' });
    }
    
    res.json({ success: true, data: brand });
  } catch (error) {
    console.error('GET /api/brands/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/brands ==========
// افزودن برند جدید
router.post('/', async (req, res) => {
  try {
    const { name, enabled } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'نام برند الزامی است' });
    }
    
    const trimmedName = name.trim();
    
    // بررسی وجود برند تکراری
    const existing = brands.find(b => b.name === trimmedName);
    if (existing) {
      return res.status(409).json({ success: false, error: 'این برند قبلاً وجود دارد' });
    }
    
    const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
    const newBrand = {
      id: newId,
      name: trimmedName,
      enabled: enabled !== undefined ? enabled : true,
      created_at: new Date().toISOString()
    };
    
    brands.push(newBrand);
    
    res.status(201).json({ success: true, data: newBrand });
  } catch (error) {
    console.error('POST /api/brands error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/brands/:id ==========
// ویرایش برند
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, enabled } = req.body;
    
    const brandIndex = brands.findIndex(b => b.id === id);
    if (brandIndex === -1) {
      return res.status(404).json({ success: false, error: 'برند یافت نشد' });
    }
    
    // بررسی نام تکراری (اگر نام تغییر کرده)
    if (name && name.trim() !== '') {
      const trimmedName = name.trim();
      const duplicate = brands.find(b => b.name === trimmedName && b.id !== id);
      if (duplicate) {
        return res.status(409).json({ success: false, error: 'این نام قبلاً وجود دارد' });
      }
      brands[brandIndex].name = trimmedName;
    }
    
    // به‌روزرسانی وضعیت فعال/غیرفعال
    if (enabled !== undefined) {
      brands[brandIndex].enabled = enabled;
    }
    
    brands[brandIndex].updated_at = new Date().toISOString();
    
    res.json({ success: true, data: brands[brandIndex] });
  } catch (error) {
    console.error('PUT /api/brands/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DELETE /api/brands/:id ==========
// حذف برند
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brandIndex = brands.findIndex(b => b.id === id);
    
    if (brandIndex === -1) {
      return res.status(404).json({ success: false, error: 'برند یافت نشد' });
    }
    
    brands.splice(brandIndex, 1);
    
    res.json({ success: true, message: 'برند با موفقیت حذف شد' });
  } catch (error) {
    console.error('DELETE /api/brands/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PATCH /api/brands/:id/toggle ==========
// تغییر وضعیت فعال/غیرفعال
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = brands.find(b => b.id === id);
    
    if (!brand) {
      return res.status(404).json({ success: false, error: 'برند یافت نشد' });
    }
    
    brand.enabled = !brand.enabled;
    brand.updated_at = new Date().toISOString();
    
    res.json({ success: true, data: brand });
  } catch (error) {
    console.error('PATCH /api/brands/:id/toggle error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/brands/enabled/list ==========
// دریافت لیست نام برندهای فعال (برای استفاده در فرانت)
router.get('/enabled/list', async (req, res) => {
  try {
    const enabledBrands = brands.filter(b => b.enabled === true).map(b => b.name);
    enabledBrands.sort();
    res.json({ success: true, data: enabledBrands });
  } catch (error) {
    console.error('GET /api/brands/enabled/list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
