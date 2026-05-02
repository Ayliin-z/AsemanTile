// backend/src/utils/helpers.js

// ========== نرمالایز کردن شماره موبایل ==========
export const normalizeMobile = (mobile) => {
  if (!mobile) return null;
  
  let normalized = mobile.toString().trim();
  
  // حذف صفر اول اگر با 0 شروع شده باشد
  if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = normalized.substring(1);
  }
  
  // حذف +98 اگر وجود داشته باشد
  if (normalized.startsWith('98') && normalized.length === 12) {
    normalized = normalized.substring(2);
  }
  
  // حذف + اگر وجود داشته باشد
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }
  
  // فقط اعداد
  normalized = normalized.replace(/\D/g, '');
  
  // بررسی نهایی: باید 10 رقم باشد
  if (normalized.length !== 10) return null;
  
  return normalized;
};

// ========== اعتبارسنجی شماره موبایل ==========
export const isValidMobile = (mobile) => {
  const normalized = normalizeMobile(mobile);
  return normalized !== null;
};

// ========== نرمالایز کردن ایمیل ==========
export const normalizeEmail = (email) => {
  if (!email) return null;
  return email.trim().toLowerCase();
};

// ========== اعتبارسنجی ایمیل ==========
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ========== تولید اسلاگ از متن ==========
export const generateSlug = (text, maxLength = 100) => {
  if (!text) return '';
  
  let slug = text
    .trim()
    .toLowerCase()
    // تبدیل حروف فارسی به انگلیسی ساده
    .replace(/[\u0621-\u0629\u064B-\u065F]/g, '')
    // جایگزینی فاصله با خط تیره
    .replace(/\s+/g, '-')
    // حذف کاراکترهای غیرمجاز
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-z0-9-]/g, '')
    // حذف خط تیره‌های تکراری
    .replace(/-+/g, '-')
    // حذف خط تیره از ابتدا و انتها
    .replace(/^-|-$/g, '');
  
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-$/, '');
  }
  
  return slug;
};

// ========== فرمت کردن قیمت ==========
export const formatPrice = (price, withTomans = true) => {
  if (price === undefined || price === null) return '۰';
  
  const formatted = new Intl.NumberFormat('fa-IR').format(price);
  return withTomans ? `${formatted} تومان` : formatted;
};

// ========== فرمت کردن تاریخ ==========
export const formatDate = (date, format = 'jalali') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (format === 'jalali') {
    // برگرداندن تاریخ شمسی ساده (برای استفاده فعلی)
    return d.toLocaleDateString('fa-IR');
  }
  
  // فرمت یونیکس
  return d.toISOString().split('T')[0];
};

// ========== فرمت کردن تاریخ با ساعت ==========
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR') + ' - ' + d.toLocaleTimeString('fa-IR');
};

// ========== محاسبه تاریخ انقضا ==========
export const calculateExpiryDate = (hours = 48) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

// ========== بررسی خالی بودن آبجکت ==========
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

// ========== کپی عمیق ==========
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// ========== حذف کلیدهای خالی از آبجکت ==========
export const removeEmptyKeys = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
};

// ========== استخراج اعداد از متن ==========
export const extractNumbers = (text) => {
  const matches = text.match(/\d+/g);
  if (!matches) return [];
  return matches.map(Number);
};

// ========== کوتاه کردن متن ==========
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

// ========== حذف تگ‌های HTML ==========
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

// ========== تولید کد تصادفی ==========
export const generateRandomCode = (length = 6, type = 'number') => {
  let chars = '0123456789';
  if (type === 'string') {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  } else if (type === 'hex') {
    chars = '0123456789abcdef';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ========== سفر کردن گروهی ==========
export const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

// ========== حذف موارد تکراری از آرایه ==========
export const uniqueArray = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ========== سفر بر اساس کلید ==========
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export default {
  normalizeMobile,
  isValidMobile,
  normalizeEmail,
  isValidEmail,
  generateSlug,
  formatPrice,
  formatDate,
  formatDateTime,
  calculateExpiryDate,
  isEmptyObject,
  deepClone,
  removeEmptyKeys,
  extractNumbers,
  truncateText,
  stripHtml,
  generateRandomCode,
  chunkArray,
  uniqueArray,
  groupBy
};
