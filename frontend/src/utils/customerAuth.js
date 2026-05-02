// src/utils/customerAuth.js
const CUSTOMER_AUTH_KEY = 'aseman_customer_auth';
const CUSTOMERS_STORAGE_KEY = 'aseman_customers';
const OTP_STORAGE_KEY = 'aseman_otp_codes';

// ========== OTP Helpers (محلی - بعداً به API متصل می‌شود) ==========

// تولید کد 6 رقمی تصادفی
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ذخیره کد OTP در localStorage (موقت)
const saveOtpCode = (mobile, code) => {
  const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
  otps[mobile] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 دقیقه اعتبار
    attempts: 0,
    createdAt: Date.now(),
  };
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  return true;
};

// دریافت کد OTP ذخیره شده
const getOtpCode = (mobile) => {
  const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
  const record = otps[mobile];
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    // منقضی شده
    delete otps[mobile];
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
    return null;
  }
  return record;
};

// حذف کد OTP بعد از تأیید موفق
const deleteOtpCode = (mobile) => {
  const otps = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
  delete otps[mobile];
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
};

// ========== مدیریت کاربران ==========

// دریافت لیست کاربران
export const getCustomers = () => {
  const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// ذخیره کاربران
const saveCustomers = (customers) => {
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

// پیدا کردن کاربر با موبایل
export const findCustomerByMobile = (mobile) => {
  const customers = getCustomers();
  return customers.find(c => c.mobile === mobile);
};

// پیدا کردن کاربر با ایمیل
export const findCustomerByEmail = (email) => {
  const customers = getCustomers();
  return customers.find(c => c.email === email);
};

// ========== OTP Service (شبیه‌سازی - بعداً به SMS panel متصل می‌شود) ==========

/**
 * ارسال کد OTP به شماره موبایل
 * در مرحله اول: کد در کنسول و alert نمایش داده می‌شود
 * بعداً: اتصال به سامانه پیامکی
 */
export const sendOtp = async (mobile) => {
  // اعتبارسنجی شماره موبایل
  if (!mobile || mobile.length < 10) {
    return { success: false, error: 'شماره موبایل معتبر نیست.' };
  }

  // نرمالایز شماره (حذف صفر اول اگر لازم باشد)
  let normalizedMobile = mobile;
  if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
    normalizedMobile = normalizedMobile.substring(1);
  }

  const code = generateOtpCode();
  saveOtpCode(normalizedMobile, code);

  // ===== در مرحله اول: نمایش در کنسول و alert برای تست =====
  console.log(`📱 OTP برای ${normalizedMobile}: ${code}`);
  alert(`کد تایید شما: ${code}\n(در نسخه نهایی از طریق پیامک ارسال می‌شود)`);
  // =======================================================

  // بعداً: ارسال پیامک واقعی
  // await fetch('/api/send-sms', { method: 'POST', body: JSON.stringify({ mobile, code }) });

  return { success: true, message: 'کد تایید ارسال شد.' };
};

/**
 * تأیید کد OTP و ورود/ثبت‌نام خودکار
 */
export const verifyOtpAndLogin = async (mobile, code, name = null) => {
  // اعتبارسنجی
  if (!mobile || !code) {
    return { success: false, error: 'شماره موبایل و کد تایید الزامی است.' };
  }

  let normalizedMobile = mobile;
  if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
    normalizedMobile = normalizedMobile.substring(1);
  }

  // بررسی کد OTP
  const otpRecord = getOtpCode(normalizedMobile);
  if (!otpRecord) {
    return { success: false, error: 'کد تایید منقضی شده است. دوباره درخواست کنید.' };
  }

  if (otpRecord.attempts >= 3) {
    deleteOtpCode(normalizedMobile);
    return { success: false, error: 'تعداد دفعات اشتباه بیش از حد مجاز. دوباره درخواست کنید.' };
  }

  if (otpRecord.code !== code) {
    otpRecord.attempts++;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({
      ...JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}'),
      [normalizedMobile]: otpRecord,
    }));
    return { success: false, error: `کد تایید اشتباه است. ${3 - otpRecord.attempts} تلاش باقی مانده.` };
  }

  // کد درست است - حذف از localStorage
  deleteOtpCode(normalizedMobile);

  // بررسی وجود کاربر
  let customer = findCustomerByMobile(normalizedMobile);

  if (!customer) {
    // ثبت‌نام خودکار کاربر جدید (نقش default: customer)
    const newId = getCustomers().length > 0 ? Math.max(...getCustomers().map(c => c.id)) + 1 : 1;
    customer = {
      id: newId,
      mobile: normalizedMobile,
      name: name || '',
      email: `${normalizedMobile}@temp.aseman.com`,
      role: 'customer',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    const customers = getCustomers();
    customers.push(customer);
    saveCustomers(customers);
  }

  // بررسی وضعیت کاربر
  if (customer.status === 'pending') {
    return { success: false, error: 'حساب شما هنوز تأیید نشده است. لطفاً منتظر بمانید.' };
  }
  if (customer.status === 'blocked') {
    return { success: false, error: 'حساب شما مسدود شده است. با پشتیبانی تماس بگیرید.' };
  }

  // ذخیره اطلاعات در session (login)
  const { password, ...safeCustomer } = customer;
  localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(safeCustomer));

  return { success: true, customer: safeCustomer };
};

// ========== ثبت‌نام همکار (با اطلاعات تکمیلی) ==========

/**
 * ثبت‌نام درخواست همکاری (نیاز به تأیید ادمین)
 */
export const registerPartner = async (data) => {
  const { mobile, name, email, companyName, city, address } = data;

  if (!mobile) {
    return { success: false, error: 'شماره موبایل الزامی است.' };
  }

  let normalizedMobile = mobile;
  if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
    normalizedMobile = normalizedMobile.substring(1);
  }

  // بررسی وجود کاربر قبلی
  let existing = findCustomerByMobile(normalizedMobile);
  if (existing && existing.role === 'partner') {
    return { success: false, error: 'این شماره موبایل قبلاً به عنوان همکار ثبت شده است.' };
  }
  if (existing && existing.status === 'approved') {
    return { success: false, error: 'این شماره موبایل قبلاً ثبت شده است.' };
  }

  const customers = getCustomers();
  let customer = existing;

  if (!customer) {
    // کاربر جدید
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    customer = {
      id: newId,
      mobile: normalizedMobile,
      name: name || '',
      email: email || `${normalizedMobile}@temp.aseman.com`,
      role: 'partner',
      status: 'pending',
      createdAt: new Date().toISOString(),
      // اطلاعات تکمیلی همکار
      companyName: companyName || '',
      city: city || '',
      address: address || '',
    };
    customers.push(customer);
  } else {
    // به‌روزرسانی کاربر موجود به همکار (pending)
    customer.role = 'partner';
    customer.status = 'pending';
    customer.companyName = companyName || '';
    customer.city = city || '';
    customer.address = address || '';
    const index = customers.findIndex(c => c.id === customer.id);
    if (index !== -1) customers[index] = customer;
  }

  saveCustomers(customers);
  return { success: true, message: 'درخواست همکاری ثبت شد. پس از تأیید مدیریت می‌توانید وارد شوید.' };
};

// ========== متدهای قدیمی (سازگاری با کد فعلی) ==========

// ثبت‌نام (روش قدیمی - برای سازگاری)
export const registerCustomer = (customerData) => {
  const customers = getCustomers();
  if (customers.find(c => c.email === customerData.email)) {
    return { success: false, error: 'این ایمیل قبلاً ثبت شده است.' };
  }
  if (customerData.mobile && customers.find(c => c.mobile === customerData.mobile)) {
    return { success: false, error: 'این شماره موبایل قبلاً ثبت شده است.' };
  }

  const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
  const newCustomer = {
    
    id: newId,
    mobile: customerData.mobile || '',
    name: customerData.firstName ? `${customerData.firstName} ${customerData.lastName}` : '',
    email: customerData.email,
    password: customerData.password,
    role: customerData.role || 'customer',
    status: customerData.role === 'partner' ? 'pending' : 'approved',
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return { success: true, customer: newCustomer };
};

// ورود (روش قدیمی - با رمز عبور)
export const loginCustomer = (email, password) => {
  const customers = getCustomers();
  const customer = customers.find(c => c.email === email && c.password === password);
  if (!customer) {
    return { success: false, error: 'ایمیل یا رمز عبور اشتباه است.' };
  }
  if (customer.status === 'pending') {
    return { success: false, error: 'حساب شما هنوز تأیید نشده است. لطفاً منتظر بمانید.' };
  }
  const { password: _, ...safeCustomer } = customer;
  localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(safeCustomer));
  return { success: true, customer: safeCustomer };
};

// خروج
export const logoutCustomer = () => {
  localStorage.removeItem(CUSTOMER_AUTH_KEY);
};

// بررسی وضعیت ورود
export const isCustomerAuthenticated = () => {
  return localStorage.getItem(CUSTOMER_AUTH_KEY) !== null;
};

// دریافت اطلاعات کاربر جاری
export const getCurrentCustomer = () => {
  const stored = localStorage.getItem(CUSTOMER_AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
};

// دریافت نقش کاربر جاری
export const getCurrentRole = () => {
  const cust = getCurrentCustomer();
  return cust?.role || null;
};

// دریافت نقش کاربر جاری (برای مهمان)
export const getCurrentUserRole = () => {
  const cust = getCurrentCustomer();
  if (!cust) return 'guest';
  return cust.role;
};

// به‌روزرسانی کاربر
export const updateCustomer = (id, updates) => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates };
    saveCustomers(customers);
    const current = getCurrentCustomer();
    if (current && current.id === id) {
      const { password, ...safeCustomer } = customers[index];
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(safeCustomer));
    }
    return { success: true, customer: customers[index] };
  }
  return { success: false, error: 'کاربر یافت نشد.' };
};

// دریافت درخواست‌های همکار در انتظار تأیید
export const getPendingPartners = () => {
  const customers = getCustomers();
  return customers.filter(c => c.role === 'partner' && c.status === 'pending');
};

// تأیید همکار
export const approvePartner = (id) => {
  return updateCustomer(id, { status: 'approved' });
};

// رد درخواست همکار
export const rejectPartner = (id) => {
  const customers = getCustomers();
  const filtered = customers.filter(c => !(c.id === id && c.role === 'partner' && c.status === 'pending'));
  saveCustomers(filtered);
  
  // اگر کاربر جاری همان بود، logout کن
  const current = getCurrentCustomer();
  if (current && current.id === id) {
    logoutCustomer();
  }
  return { success: true };
};
