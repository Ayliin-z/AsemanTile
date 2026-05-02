// backend/src/api/settings.js
import express from 'express';

const router = express.Router();

// ========== ذخیره‌سازی موقت در حافظه ==========
let siteSettings = {
  // تنظیمات فروش
  sales_mode: 'cart',           // 'cart' یا 'contact'
  
  // تنظیمات صفحه اصلی
  landing_tags: ['فروش ویژه', 'جدید', 'پرفروش'],
  
  // تنظیمات عمومی
  site_name: 'کاشی و سرامیک آسمان',
  site_description: 'فروشگاه تخصصی کاشی و سرامیک',
  site_logo: '/images/logo.png',
  site_favicon: '/favicon.ico',
  
  // اطلاعات تماس
  contact_phone: '07143333333',
  contact_mobile: '0910870698',
  contact_email: 'info@asemantile.com',
  contact_address: 'شیراز، بلوار پاسداران، نبش کوچه ۶۰، طبقه دوم بانک سیه',
  
  // تنظیمات اجتماعی
  social_instagram: 'https://instagram.com/aseman_tile',
  social_telegram: 'https://t.me/aseman_tile',
  social_whatsapp: 'https://wa.me/98910870698',
  
  // تنظیمات SEO
  meta_keywords: 'کاشی, سرامیک, کاشی و سرامیک, فروش کاشی, شیراز',
  meta_description: 'فروشگاه تخصصی کاشی و سرامیک آسمان - ارائه انواع کاشی و سرامیک با بهترین کیفیت و قیمت',
  
  // Feature Toggles
  show_prices: true,
  show_inventory: true,
  allow_partner_register: true,
  maintenance_mode: false,
  enable_quick_order: true,
  
  // تنظیمات پیامکی (برای OTP)
  sms_enabled: false,
  sms_api_key: '',
  sms_sender_number: '',
  
  // تنظیمات مالیات و ارسال
  tax_percent: 9,
  shipping_cost: 500000,
  free_shipping_threshold: 5000000,
  
  // تنظیمات ظاهری
  primary_color: '#13314c',
  secondary_color: '#ffd800',
  accent_color: '#1c7385',
  
  updated_at: new Date().toISOString()
};

// ========== GET /api/settings ==========
// دریافت همه تنظیمات سایت (فقط ادمین)
router.get('/', async (req, res) => {
  try {
    // حذف اطلاعات حساس برای لاگ
    const safeSettings = { ...siteSettings };
    
    res.json({ 
      success: true, 
      data: safeSettings,
      last_updated: siteSettings.updated_at
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/settings/:key ==========
// دریافت یک تنظیم خاص
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!siteSettings.hasOwnProperty(key)) {
      return res.status(404).json({ 
        success: false, 
        error: 'تنظیمات یافت نشد' 
      });
    }
    
    res.json({ 
      success: true, 
      data: { [key]: siteSettings[key] }
    });
  } catch (error) {
    console.error('GET /api/settings/:key error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PUT /api/settings/:key ==========
// به‌روزرسانی یک تنظیم
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'مقدار تنظیمات الزامی است' 
      });
    }
    
    if (!siteSettings.hasOwnProperty(key)) {
      return res.status(404).json({ 
        success: false, 
        error: 'تنظیمات یافت نشد' 
      });
    }
    
    // اعتبارسنجی بر اساس نوع کلید
    if (key === 'sales_mode' && !['cart', 'contact'].includes(value)) {
      return res.status(400).json({ 
        success: false, 
        error: 'حالت فروش باید cart یا contact باشد' 
      });
    }
    
    if (key === 'landing_tags' && !Array.isArray(value)) {
      return res.status(400).json({ 
        success: false, 
        error: 'تگ‌های صفحه اصلی باید آرایه باشند' 
      });
    }
    
    if (['show_prices', 'show_inventory', 'allow_partner_register', 'maintenance_mode', 'enable_quick_order', 'sms_enabled'].includes(key)) {
      siteSettings[key] = value === true || value === 'true';
    } else if (['tax_percent', 'shipping_cost', 'free_shipping_threshold'].includes(key)) {
      siteSettings[key] = Number(value);
    } else {
      siteSettings[key] = value;
    }
    
    siteSettings.updated_at = new Date().toISOString();
    
    console.log(`⚙️ تنظیمات به‌روزرسانی شد: ${key} = ${JSON.stringify(value)}`);
    
    res.json({ 
      success: true, 
      data: { [key]: siteSettings[key] },
      message: 'تنظیمات با موفقیت ذخیره شد'
    });
  } catch (error) {
    console.error('PUT /api/settings/:key error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/settings/bulk ==========
// به‌روزرسانی چندین تنظیم همزمان
router.post('/bulk', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'تنظیمات را به صورت object ارسال کنید' 
      });
    }
    
    let updatedCount = 0;
    
    for (const [key, value] of Object.entries(settings)) {
      if (siteSettings.hasOwnProperty(key)) {
        // اعتبارسنجی
        if (key === 'sales_mode' && !['cart', 'contact'].includes(value)) {
          continue;
        }
        
        if (['show_prices', 'show_inventory', 'allow_partner_register', 'maintenance_mode', 'enable_quick_order', 'sms_enabled'].includes(key)) {
          siteSettings[key] = value === true || value === 'true';
        } else if (['tax_percent', 'shipping_cost', 'free_shipping_threshold'].includes(key)) {
          siteSettings[key] = Number(value);
        } else {
          siteSettings[key] = value;
        }
        
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      siteSettings.updated_at = new Date().toISOString();
    }
    
    res.json({ 
      success: true, 
      data: siteSettings,
      message: `${updatedCount} تنظیمات با موفقیت ذخیره شد`
    });
  } catch (error) {
    console.error('POST /api/settings/bulk error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/settings/public/public-settings ==========
// دریافت تنظیمات عمومی (بدون نیاز به احراز هویت)
router.get('/public/public-settings', async (req, res) => {
  try {
    const publicKeys = [
      'sales_mode',
      'maintenance_mode',
      'landing_tags',
      'site_name',
      'site_description',
      'contact_phone',
      'contact_mobile',
      'contact_email',
      'contact_address',
      'social_instagram',
      'social_telegram',
      'social_whatsapp'
    ];
    
    const publicSettings = {};
    for (const key of publicKeys) {
      if (siteSettings.hasOwnProperty(key)) {
        publicSettings[key] = siteSettings[key];
      }
    }
    
    res.json({ success: true, data: publicSettings });
  } catch (error) {
    console.error('GET /api/settings/public/public-settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/settings/feature-toggles ==========
// دریافت Feature Toggles (برای پنل ادمین)
router.get('/feature-toggles', async (req, res) => {
  try {
    const toggles = {
      show_prices: siteSettings.show_prices,
      show_inventory: siteSettings.show_inventory,
      allow_partner_register: siteSettings.allow_partner_register,
      maintenance_mode: siteSettings.maintenance_mode,
      enable_quick_order: siteSettings.enable_quick_order,
      sms_enabled: siteSettings.sms_enabled
    };
    
    res.json({ success: true, data: toggles });
  } catch (error) {
    console.error('GET /api/settings/feature-toggles error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== POST /api/settings/reset ==========
// بازنشانی تنظیمات به حالت پیش‌فرض
router.post('/reset', async (req, res) => {
  try {
    // تنظیمات پیش‌فرض
    siteSettings = {
      sales_mode: 'cart',
      landing_tags: ['فروش ویژه', 'جدید', 'پرفروش'],
      site_name: 'کاشی و سرامیک آسمان',
      site_description: 'فروشگاه تخصصی کاشی و سرامیک',
      site_logo: '/images/logo.png',
      site_favicon: '/favicon.ico',
      contact_phone: '07143333333',
      contact_mobile: '0910870698',
      contact_email: 'info@asemantile.com',
      contact_address: 'شیراز، بلوار پاسداران، نبش کوچه ۶۰، طبقه دوم بانک سیه',
      social_instagram: 'https://instagram.com/aseman_tile',
      social_telegram: 'https://t.me/aseman_tile',
      social_whatsapp: 'https://wa.me/98910870698',
      meta_keywords: 'کاشی, سرامیک, کاشی و سرامیک, فروش کاشی, شیراز',
      meta_description: 'فروشگاه تخصصی کاشی و سرامیک آسمان - ارائه انواع کاشی و سرامیک با بهترین کیفیت و قیمت',
      show_prices: true,
      show_inventory: true,
      allow_partner_register: true,
      maintenance_mode: false,
      enable_quick_order: true,
      sms_enabled: false,
      sms_api_key: '',
      sms_sender_number: '',
      tax_percent: 9,
      shipping_cost: 500000,
      free_shipping_threshold: 5000000,
      primary_color: '#13314c',
      secondary_color: '#ffd800',
      accent_color: '#1c7385',
      updated_at: new Date().toISOString()
    };
    
    console.log('🔄 تنظیمات به حالت پیش‌فرض بازنشانی شد');
    
    res.json({ 
      success: true, 
      data: siteSettings,
      message: 'تنظیمات به حالت پیش‌فرض بازنشانی شد'
    });
  } catch (error) {
    console.error('POST /api/settings/reset error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/settings/contact/info ==========
// دریافت اطلاعات تماس (برای صفحه تماس با ما)
router.get('/contact/info', async (req, res) => {
  try {
    const contactInfo = {
      phone: siteSettings.contact_phone,
      mobile: siteSettings.contact_mobile,
      email: siteSettings.contact_email,
      address: siteSettings.contact_address,
      social: {
        instagram: siteSettings.social_instagram,
        telegram: siteSettings.social_telegram,
        whatsapp: siteSettings.social_whatsapp
      }
    };
    
    res.json({ success: true, data: contactInfo });
  } catch (error) {
    console.error('GET /api/settings/contact/info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET /api/settings/shipping/info ==========
// دریافت اطلاعات حمل و نقل و مالیات
router.get('/shipping/info', async (req, res) => {
  try {
    const shippingInfo = {
      tax_percent: siteSettings.tax_percent,
      shipping_cost: siteSettings.shipping_cost,
      free_shipping_threshold: siteSettings.free_shipping_threshold
    };
    
    res.json({ success: true, data: shippingInfo });
  } catch (error) {
    console.error('GET /api/settings/shipping/info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
