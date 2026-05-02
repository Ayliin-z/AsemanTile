// backend/src/utils/constants.js

// ========== نقش‌های کاربری ==========
export const USER_TYPES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  PARTNER: 'partner',
  CUSTOMER: 'customer'
};

// ========== وضعیت‌های پیش‌فاکتور ==========
export const QUOTE_STATUSES = {
  SUBMITTED: 'submitted',
  REVIEWING: 'reviewing',
  ISSUED: 'issued',
  WAITING_CUSTOMER: 'waiting_customer',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
  FINAL_CONFIRMED: 'final_confirmed',
  CANCELLED: 'cancelled'
};

// ========== وضعیت‌های درخواست تماس ==========
export const CONTACT_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  FOLLOWED: 'followed'
};

// ========== انواع تغییر موجودی ==========
export const INVENTORY_CHANGE_TYPES = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  RESERVE: 'reserve',
  RELEASE: 'release'
};

// ========== حالت‌های فروش ==========
export const SALES_MODES = {
  CART: 'cart',
  CONTACT: 'contact'
};

// ========== مجوزها ==========
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

// ========== تگ‌های پیش‌فرض صفحه اصلی ==========
export const DEFAULT_LANDING_TAGS = ['فروش ویژه', 'جدید', 'پرفروش'];

// ========== برندهای پیش‌فرض ==========
export const DEFAULT_BRANDS = [
  'حافظ', 'آسمان', 'چوبینه', 'سرامیک البرز', 
  'اسپانیایی', 'ماربل امپرادور', 'پرسلان نیو کارن'
];

// ========== تگ‌های پیش‌فرض ==========
export const DEFAULT_TAGS = [
  'جدید', 'پرفروش', 'تخفیف‌خورده', 'ویژه', 
  'فروش ویژه', 'فروش امروز'
];

// ========== محدودیت‌ها ==========
export const LIMITS = {
  MAX_PRODUCTS_PER_PAGE: 48,
  MAX_BLOG_POSTS_PER_PAGE: 12,
  MAX_QUOTES_PER_PAGE: 20,
  MAX_CONTACT_REQUESTS_PER_PAGE: 20,
  MAX_INVENTORY_LOGS_PER_PAGE: 50
};

// ========== HTTP status codes ==========
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// ========== پیام‌های خطا ==========
export const ERROR_MESSAGES = {
  NOT_FOUND: 'یافت نشد',
  UNAUTHORIZED: 'احراز هویت نشده است',
  FORBIDDEN: 'شما دسترسی لازم را ندارید',
  INVALID_INPUT: 'ورودی نامعتبر است',
  DUPLICATE: 'مقدار تکراری است',
  SERVER_ERROR: 'خطای داخلی سرور'
};

// ========== پیام‌های موفقیت ==========
export const SUCCESS_MESSAGES = {
  CREATED: 'با موفقیت ایجاد شد',
  UPDATED: 'با موفقیت به‌روزرسانی شد',
  DELETED: 'با موفقیت حذف شد',
  APPROVED: 'با موفقیت تأیید شد'
};

export default {
  USER_TYPES,
  QUOTE_STATUSES,
  CONTACT_STATUSES,
  INVENTORY_CHANGE_TYPES,
  SALES_MODES,
  PERMISSIONS,
  DEFAULT_LANDING_TAGS,
  DEFAULT_BRANDS,
  DEFAULT_TAGS,
  LIMITS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
