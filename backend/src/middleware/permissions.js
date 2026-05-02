// backend/src/middleware/permissions.js

// ========== تعریف مجوزها ==========
export const PERMISSIONS = {
  // محصولات
  VIEW_PRODUCTS: 'view_products',
  ADD_PRODUCT: 'add_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  BULK_DISCOUNT: 'bulk_discount',
  
  // مدیریت
  MANAGE_BRANDS: 'manage_brands',
  MANAGE_TAGS: 'manage_tags',
  MANAGE_PARTNERS: 'manage_partners',
  MANAGE_EMPLOYEES: 'manage_employees',
  
  // داده‌ها
  IMPORT_EXPORT: 'import_export',
  RESET_DATA: 'reset_data',
  
  // تنظیمات
  EDIT_SALES_MODE: 'edit_sales_mode',
  EDIT_LANDING_TAGS: 'edit_landing_tags',
  
  // مشاهده
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ORDERS: 'view_orders',
  VIEW_REPORTS: 'view_reports'
};

// ========== نقش‌ها و مجوزهای پیش‌فرض ==========
const rolePermissions = {
  admin: Object.values(PERMISSIONS), // ادمین همه مجوزها را دارد
  
  employee: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.BULK_DISCOUNT,
    PERMISSIONS.MANAGE_BRANDS,
    PERMISSIONS.MANAGE_TAGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.IMPORT_EXPORT,
    PERMISSIONS.EDIT_SALES_MODE,
    PERMISSIONS.EDIT_LANDING_TAGS
  ],
  
  partner: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS
  ],
  
  customer: [
    PERMISSIONS.VIEW_PRODUCTS
  ]
};

// ========== بررسی دسترسی بر اساس مجوز ==========
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'احراز هویت نشده است'
      });
    }
    
    const userRole = req.user.type;
    const userPermissions = rolePermissions[userRole] || [];
    
    // ادمین همیشه دسترسی دارد
    if (userRole === 'admin') {
      return next();
    }
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `شما دسترسی "${permission}" را ندارید`
      });
    }
    
    next();
  };
};

// ========== بررسی چندین مجوز (نیاز به همه) ==========
export const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'احراز هویت نشده است'
      });
    }
    
    const userRole = req.user.type;
    
    // ادمین همه چیز را دارد
    if (userRole === 'admin') {
      return next();
    }
    
    const userPermissions = rolePermissions[userRole] || [];
    
    for (const permission of permissions) {
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: `شما دسترسی "${permission}" را ندارید`
        });
      }
    }
    
    next();
  };
};

// ========== بررسی یکی از مجوزها (نیاز به حداقل یکی) ==========
export const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'احراز هویت نشده است'
      });
    }
    
    const userRole = req.user.type;
    
    // ادمین همه چیز را دارد
    if (userRole === 'admin') {
      return next();
    }
    
    const userPermissions = rolePermissions[userRole] || [];
    
    for (const permission of permissions) {
      if (userPermissions.includes(permission)) {
        return next();
      }
    }
    
    return res.status(403).json({
      success: false,
      error: `شما حداقل یکی از دسترسی‌های ${permissions.join(' یا ')} را ندارید`
    });
  };
};

// ========== دریافت مجوزهای کاربر جاری ==========
export const getUserPermissions = (req) => {
  if (!req.user) return [];
  
  const userRole = req.user.type;
  return rolePermissions[userRole] || [];
};

// ========== بررسی دسترسی در کد (برای استفاده در کنترلرها) ==========
export const hasPermission = (req, permission) => {
  if (!req.user) return false;
  if (req.user.type === 'admin') return true;
  
  const userPermissions = rolePermissions[req.user.type] || [];
  return userPermissions.includes(permission);
};

export default {
  PERMISSIONS,
  checkPermission,
  checkAllPermissions,
  checkAnyPermission,
  getUserPermissions,
  hasPermission
};
