// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aseman_super_secret_key_change_in_production';

// ========== بررسی وجود توکن و احراز هویت ==========
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'توکن احراز هویت ارائه نشده است'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'توکن نامعتبر است'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'توکن منقضی شده است. لطفاً دوباره وارد شوید'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// ========== بررسی نقش ادمین ==========
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده است'
    });
  }
  
  if (req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'دسترسی محدود: نیاز به دسترسی ادمین'
    });
  }
  
  next();
};

// ========== بررسی نقش همکار یا ادمین ==========
export const requirePartnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده است'
    });
  }
  
  if (req.user.type !== 'admin' && req.user.type !== 'partner') {
    return res.status(403).json({
      success: false,
      error: 'دسترسی محدود: نیاز به دسترسی همکار یا ادمین'
    });
  }
  
  next();
};

// ========== بررسی نقش کارمند یا ادمین ==========
export const requireEmployeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده است'
    });
  }
  
  if (req.user.type !== 'admin' && req.user.type !== 'employee') {
    return res.status(403).json({
      success: false,
      error: 'دسترسی محدود: نیاز به دسترسی کارمند یا ادمین'
    });
  }
  
  next();
};

// ========== بررسی نقش مشتری (کاربر عادی) ==========
export const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده است'
    });
  }
  
  if (req.user.type !== 'admin' && req.user.type !== 'customer') {
    return res.status(403).json({
      success: false,
      error: 'دسترسی محدود: نیاز به ورود به حساب کاربری'
    });
  }
  
  next();
};

// ========== بررسی هر کاربر وارد شده (هر نقشی) ==========
export const requireAnyUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده است. لطفاً وارد شوید'
    });
  }
  
  next();
};

// ========== گارد ترکیبی: بررسی چند نقش ==========
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'احراز هویت نشده است'
      });
    }
    
    if (!allowedRoles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        error: `دسترسی محدود: نیاز به دسترسی ${allowedRoles.join(' یا ')}`
      });
    }
    
    next();
  };
};

// ========== دریافت userId از توکن (برای لاگ‌ها) ==========
export const getUserId = (req) => {
  return req.user?.id || null;
};

// ========== آپشنال: بررسی توکن (اگر توکن هست استفاده کن، اگر نه ادامه بده) ==========
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // توکن نامعتبر است، اما چون optional هست خطا نمی‌دهیم
    // فقط req.user را undefined می‌گذاریم
  }
  
  next();
};

export default {
  authenticate,
  requireAdmin,
  requirePartnerOrAdmin,
  requireEmployeeOrAdmin,
  requireCustomer,
  requireAnyUser,
  requireRoles,
  getUserId,
  optionalAuth
};
