// backend/src/middleware/errorHandler.js

// ========== مدیریت خطاهای عمومی ==========
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // خطای اعتبارسنجی
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      details: err.details
    });
  }
  
  // خطای JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'توکن نامعتبر است'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'توکن منقضی شده است'
    });
  }
  
  // خطای دیتابیس
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'رکورد تکراری در دیتابیس'
    });
  }
  
  // خطای پیش‌فرض
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'خطای داخلی سرور'
  });
};

// ========== مدیریت خطای 404 (مسیر پیدا نشد) ==========
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `مسیر ${req.method} ${req.url} یافت نشد`
  });
};

// ========== مدیریت خطای اعتبارسنجی (برای express-validator) ==========
export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'خطای اعتبارسنجی',
      details: errors.array()
    });
  }
  next();
};

// ========== کلاس خطای سفارشی ==========
export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export default {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  AppError
};
