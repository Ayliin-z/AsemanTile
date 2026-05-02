// backend/src/middleware/rateLimiter.js

// ========== ذخیره‌سازی درخواست‌ها (در حافظه) ==========
const requestCounts = new Map(); // key: ip, value: { count, resetTime }

// پاک کردن خودکار رکوردهای قدیمی هر ساعت
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// ========== محدودکننده عمومی ==========
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,  // 1 دقیقه پیش‌فرض
    maxRequests = 100,       // حداکثر 100 درخواست
    message = 'درخواست太多了، لطفاً کمی صبر کنید'
  } = options;
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const data = requestCounts.get(ip);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }
    
    if (data.count >= maxRequests) {
      const waitTime = Math.ceil((data.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `${message}. ${waitTime} ثانیه دیگر تلاش کنید`
      });
    }
    
    data.count++;
    next();
  };
};

// ========== محدودکننده مخصوص لاگین (سخت‌گیرانه‌تر) ==========
export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  maxRequests: 5,            // حداکثر 5 بار تلاش
  message: 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. ۱۵ دقیقه دیگر تلاش کنید'
});

// ========== محدودکننده مخصوص OTP ==========
export const otpRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,  // 5 دقیقه
  maxRequests: 3,            // حداکثر 3 بار
  message: 'درخواست کد تایید بیش از حد مجاز است. ۵ دقیقه دیگر تلاش کنید'
});

// ========== محدودکننده مخصوص API‌های سنگین ==========
export const heavyApiLimiter = rateLimiter({
  windowMs: 60 * 1000,       // 1 دقیقه
  maxRequests: 20,           // حداکثر 20 درخواست
  message: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً آهسته‌تر درخواست دهید'
});

// ========== محدودکننده مخصوص import/export (خیلی سنگین) ==========
export const bulkOperationLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,   // 5 دقیقه
  maxRequests: 3,             // حداکثر 3 بار
  message: 'عملیات سنگین بیش از حد مجاز است. ۵ دقیقه دیگر تلاش کنید'
});

export default {
  rateLimiter,
  loginRateLimiter,
  otpRateLimiter,
  heavyApiLimiter,
  bulkOperationLimiter
};
