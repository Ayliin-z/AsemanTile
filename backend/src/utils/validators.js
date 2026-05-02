// backend/src/utils/validators.js

// ========== اعتبارسنجی محصول ==========
export const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('نام محصول الزامی است');
  }
  
  if (product.price === undefined || isNaN(product.price) || product.price < 0) {
    errors.push('قیمت محصول باید عددی مثبت باشد');
  }
  
  if (product.productcode && product.productcode.length > 50) {
    errors.push('کد محصول نباید بیشتر از ۵۰ کاراکتر باشد');
  }
  
  if (product.stock !== undefined && (isNaN(product.stock) || product.stock < 0)) {
    errors.push('موجودی باید عددی نامنفی باشد');
  }
  
  if (product.discount !== undefined && (isNaN(product.discount) || product.discount < 0 || product.discount > 100)) {
    errors.push('تخفیف باید بین ۰ تا ۱۰۰ باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی کاربر ==========
export const validateUser = (user) => {
  const errors = [];
  
  if (!user.name || user.name.trim() === '') {
    errors.push('نام کاربری الزامی است');
  }
  
  if (!user.mobile || !isValidMobile(user.mobile)) {
    errors.push('شماره موبایل معتبر نیست');
  }
  
  if (user.email && !isValidEmail(user.email)) {
    errors.push('ایمیل معتبر نیست');
  }
  
  if (user.password && user.password.length < 4) {
    errors.push('رمز عبور باید حداقل ۴ کاراکتر باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی پیش‌فاکتور ==========
export const validateQuote = (quote) => {
  const errors = [];
  
  if (!quote.partner_id || isNaN(quote.partner_id)) {
    errors.push('شناسه همکار معتبر نیست');
  }
  
  if (!quote.items || !Array.isArray(quote.items) || quote.items.length === 0) {
    errors.push('حداقل یک محصول باید در پیش‌فاکتور باشد');
  }
  
  if (quote.items) {
    quote.items.forEach((item, index) => {
      if (!item.product_id || isNaN(item.product_id)) {
        errors.push(`محصول ${index + 1}: شناسه محصول معتبر نیست`);
      }
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        errors.push(`محصول ${index + 1}: مقدار باید عددی مثبت باشد`);
      }
      if (!item.price || isNaN(item.price) || item.price < 0) {
        errors.push(`محصول ${index + 1}: قیمت باید عددی نامنفی باشد`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی برند ==========
export const validateBrand = (brand) => {
  const errors = [];
  
  if (!brand.name || brand.name.trim() === '') {
    errors.push('نام برند الزامی است');
  }
  
  if (brand.name && brand.name.length > 100) {
    errors.push('نام برند نباید بیشتر از ۱۰۰ کاراکتر باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی دسته‌بندی ==========
export const validateCategory = (category) => {
  const errors = [];
  
  if (!category.name || category.name.trim() === '') {
    errors.push('نام دسته‌بندی الزامی است');
  }
  
  if (category.slug && !/^[a-z0-9\-]+$/.test(category.slug)) {
    errors.push('slug فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی تگ ==========
export const validateTag = (tag) => {
  const errors = [];
  
  if (!tag.name || tag.name.trim() === '') {
    errors.push('نام تگ الزامی است');
  }
  
  if (tag.name && tag.name.length > 50) {
    errors.push('نام تگ نباید بیشتر از ۵۰ کاراکتر باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی پست وبلاگ ==========
export const validateBlogPost = (post) => {
  const errors = [];
  
  if (!post.title || post.title.trim() === '') {
    errors.push('عنوان پست الزامی است');
  }
  
  if (!post.content || post.content.trim() === '') {
    errors.push('محتوای پست الزامی است');
  }
  
  if (post.title && post.title.length > 200) {
    errors.push('عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی درخواست تماس ==========
export const validateContactRequest = (request) => {
  const errors = [];
  
  if (!request.name || request.name.trim() === '') {
    errors.push('نام الزامی است');
  }
  
  if (!request.mobile || !isValidMobile(request.mobile)) {
    errors.push('شماره موبایل معتبر نیست');
  }
  
  if (request.area_m2 && (isNaN(request.area_m2) || request.area_m2 <= 0)) {
    errors.push('متراژ باید عددی مثبت باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== اعتبارسنجی موجودی ==========
export const validateInventoryUpdate = (data) => {
  const errors = [];
  
  if (data.quantity === undefined || isNaN(data.quantity)) {
    errors.push('مقدار تغییر موجودی باید عددی باشد');
  }
  
  if (data.quantity === 0) {
    errors.push('مقدار تغییر موجودی نباید صفر باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateProduct,
  validateUser,
  validateQuote,
  validateBrand,
  validateCategory,
  validateTag,
  validateBlogPost,
  validateContactRequest,
  validateInventoryUpdate
};
