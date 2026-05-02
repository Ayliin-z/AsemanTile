// backend/src/middleware/validation.js

// ========== اعتبارسنجی محصول ==========
export const validateProduct = (req, res, next) => {
  const { name, price, productcode } = req.body;
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('نام محصول الزامی است');
  }
  
  if (!price || isNaN(price) || price <= 0) {
    errors.push('قیمت محصول باید عددی مثبت باشد');
  }
  
  if (productcode && productcode.length > 50) {
    errors.push('کد محصول نباید بیشتر از ۵۰ کاراکتر باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی کاربر ==========
export const validateUser = (req, res, next) => {
  const { name, mobile, email, password } = req.body;
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('نام کاربری الزامی است');
  }
  
  if (!mobile || mobile.length < 10) {
    errors.push('شماره موبایل معتبر نیست');
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('ایمیل معتبر نیست');
  }
  
  if (password && password.length < 4) {
    errors.push('رمز عبور باید حداقل ۴ کاراکتر باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی پیش‌فاکتور ==========
export const validateQuote = (req, res, next) => {
  const { partner_id, items } = req.body;
  const errors = [];
  
  if (!partner_id || isNaN(partner_id)) {
    errors.push('شناسه همکار معتبر نیست');
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('حداقل یک محصول باید در پیش‌فاکتور باشد');
  }
  
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id || isNaN(item.product_id)) {
        errors.push(`محصول ${i + 1}: شناسه محصول معتبر نیست`);
      }
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        errors.push(`محصول ${i + 1}: مقدار باید عددی مثبت باشد`);
      }
      if (!item.price || isNaN(item.price) || item.price <= 0) {
        errors.push(`محصول ${i + 1}: قیمت باید عددی مثبت باشد`);
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی درخواست تماس ==========
export const validateContactRequest = (req, res, next) => {
  const { name, mobile } = req.body;
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('نام الزامی است');
  }
  
  if (!mobile) {
    errors.push('شماره موبایل الزامی است');
  } else {
    const mobileStr = mobile.toString();
    const normalized = mobileStr.startsWith('0') ? mobileStr.substring(1) : mobileStr;
    if (normalized.length < 10 || normalized.length > 11 || isNaN(normalized)) {
      errors.push('شماره موبایل معتبر نیست');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی موجودی ==========
export const validateInventory = (req, res, next) => {
  const { quantity } = req.body;
  const errors = [];
  
  if (quantity === undefined || isNaN(quantity)) {
    errors.push('مقدار تغییر موجودی باید عددی باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی برند ==========
export const validateBrand = (req, res, next) => {
  const { name } = req.body;
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('نام برند الزامی است');
  }
  
  if (name && name.length > 100) {
    errors.push('نام برند نباید بیشتر از ۱۰۰ کاراکتر باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

// ========== اعتبارسنجی دسته‌بندی ==========
export const validateCategory = (req, res, next) => {
  const { name, slug } = req.body;
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('نام دسته‌بندی الزامی است');
  }
  
  if (slug && !/^[a-z0-9\-]+$/.test(slug)) {
    errors.push('slug فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

export default {
  validateProduct,
  validateUser,
  validateQuote,
  validateContactRequest,
  validateInventory,
  validateBrand,
  validateCategory
};
