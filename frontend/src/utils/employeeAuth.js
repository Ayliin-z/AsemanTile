// frontend/src/utils/employeeAuth.js
const API_URL = 'http://localhost:5003/api/employees';

// دریافت لیست کارمندان
export const getEmployees = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('خطا در دریافت کارمندان');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('getEmployees error:', error);
    return [];
  }
};

// دریافت کارمند با ID
export const getEmployeeById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getEmployeeById error:', error);
    return null;
  }
};

// ایجاد کارمند جدید
export const createEmployee = async (employeeData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'خطا در ایجاد کارمند');
    }
    const data = await res.json();
    return { success: true, employee: data };
  } catch (error) {
    console.error('createEmployee error:', error);
    return { success: false, error: error.message };
  }
};

// به‌روزرسانی کارمند
export const updateEmployee = async (id, updates) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'خطا در به‌روزرسانی کارمند');
    }
    const data = await res.json();
    return { success: true, employee: data };
  } catch (error) {
    console.error('updateEmployee error:', error);
    return { success: false, error: error.message };
  }
};

// حذف کارمند
export const deleteEmployee = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'خطا در حذف کارمند');
    }
    return { success: true };
  } catch (error) {
    console.error('deleteEmployee error:', error);
    return { success: false, error: error.message };
  }
};

// ورود کارمند
export const loginEmployee = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ایمیل یا رمز عبور اشتباه است');
    }
    const employee = await res.json();
    localStorage.setItem('aseman_employee_auth', JSON.stringify(employee));
    return { success: true, employee };
  } catch (error) {
    console.error('loginEmployee error:', error);
    return { success: false, error: error.message };
  }
};

// خروج کارمند
export const logoutEmployee = () => {
  localStorage.removeItem('aseman_employee_auth');
};

// بررسی وضعیت ورود کارمند
export const isEmployeeAuthenticated = () => {
  return localStorage.getItem('aseman_employee_auth') !== null;
};

// دریافت اطلاعات کارمند جاری
export const getCurrentEmployee = () => {
  const stored = localStorage.getItem('aseman_employee_auth');
  return stored ? JSON.parse(stored) : null;
};

// دریافت دسترسی‌های کارمند جاری
export const getCurrentEmployeePermissions = () => {
  const emp = getCurrentEmployee();
  return emp?.permissions || [];
};

// بررسی دسترسی خاص
export const hasPermission = (permissionKey) => {
  const permissions = getCurrentEmployeePermissions();
  return permissions.includes(permissionKey);
};
