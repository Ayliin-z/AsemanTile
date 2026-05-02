// backend/src/models/User.js
import bcrypt from 'bcrypt';

// ========== ذخیره‌سازی موقت در حافظه ==========
let users = [
  {
    id: 1,
    name: 'مدیر سیستم',
    mobile: '9123456789',
    email: 'admin@aseman.com',
    password_hash: null, // بعداً هش می‌شه
    type: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'علی رضایی',
    mobile: '9123456788',
    email: 'ali@test.com',
    password_hash: null,
    type: 'customer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let nextId = 3;

// ========== هش کردن رمز عبور ==========
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// ========== کلاس User ==========
class User {
  // دریافت همه کاربران
  static async findAll(filters = {}) {
    let filtered = [...users];
    
    if (filters.type) {
      filtered = filtered.filter(u => u.type === filters.type);
    }
    
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(u => u.is_active === filters.is_active);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.mobile.includes(filters.search)
      );
    }
    
    // حذف password_hash از خروجی
    return filtered.map(({ password_hash, ...rest }) => rest);
  }
  
  // دریافت کاربر با ID
  static async findById(id) {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
  
  // دریافت کاربر با ایمیل
  static async findByEmail(email) {
    const user = users.find(u => u.email === email);
    if (!user) return null;
    
    return user;
  }
  
  // دریافت کاربر با موبایل
  static async findByMobile(mobile) {
    let normalizedMobile = mobile.toString();
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }
    
    const user = users.find(u => u.mobile === normalizedMobile);
    if (!user) return null;
    
    return user;
  }
  
  // ایجاد کاربر جدید
  static async create(userData) {
    const { name, mobile, email, password, type = 'customer' } = userData;
    
    // بررسی وجود کاربر تکراری
    const existing = users.find(u => u.email === email || u.mobile === mobile);
    if (existing) {
      throw new Error('این ایمیل یا شماره موبایل قبلاً ثبت شده است');
    }
    
    let normalizedMobile = mobile;
    if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
      normalizedMobile = normalizedMobile.substring(1);
    }
    
    const hashedPassword = password ? await hashPassword(password) : null;
    
    const newUser = {
      id: nextId++,
      name: name.trim(),
      mobile: normalizedMobile,
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      type,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  }
  
  // به‌روزرسانی کاربر
  static async update(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('کاربر یافت نشد');
    }
    
    // بررسی تکراری نبودن ایمیل/موبایل (اگر تغییر کرده)
    if (updates.email) {
      const existing = users.find(u => u.email === updates.email && u.id !== id);
      if (existing) {
        throw new Error('این ایمیل قبلاً ثبت شده است');
      }
      users[index].email = updates.email.toLowerCase().trim();
    }
    
    if (updates.mobile) {
      let normalizedMobile = updates.mobile;
      if (normalizedMobile.startsWith('0') && normalizedMobile.length === 11) {
        normalizedMobile = normalizedMobile.substring(1);
      }
      const existing = users.find(u => u.mobile === normalizedMobile && u.id !== id);
      if (existing) {
        throw new Error('این شماره موبایل قبلاً ثبت شده است');
      }
      users[index].mobile = normalizedMobile;
    }
    
    if (updates.name) users[index].name = updates.name.trim();
    if (updates.type) users[index].type = updates.type;
    if (updates.is_active !== undefined) users[index].is_active = updates.is_active;
    
    if (updates.password) {
      users[index].password_hash = await hashPassword(updates.password);
    }
    
    users[index].updated_at = new Date().toISOString();
    
    const { password_hash, ...safeUser } = users[index];
    return safeUser;
  }
  
  // حذف کاربر
  static async delete(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('کاربر یافت نشد');
    }
    
    users.splice(index, 1);
    return true;
  }
  
  // تأیید رمز عبور
  static async verifyPassword(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) return false;
    if (!user.password_hash) return false;
    
    return await bcrypt.compare(password, user.password_hash);
  }
  
  // تغییر وضعیت فعال/غیرفعال
  static async toggleActive(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('کاربر یافت نشد');
    }
    
    users[index].is_active = !users[index].is_active;
    users[index].updated_at = new Date().toISOString();
    
    const { password_hash, ...safeUser } = users[index];
    return safeUser;
  }
  
  // آمار کاربران
  static async getStats() {
    return {
      total: users.length,
      admin: users.filter(u => u.type === 'admin').length,
      employee: users.filter(u => u.type === 'employee').length,
      customer: users.filter(u => u.type === 'customer').length,
      partner: users.filter(u => u.type === 'partner').length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length
    };
  }
}

export default User;
