// backend/src/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aseman_super_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d'; // 7 روز

// ========== تولید توکن ==========
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ========== تأیید توکن ==========
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// ========== دریافت کاربر از توکن ==========
export const getUserFromToken = (token) => {
  const result = verifyToken(token);
  if (result.valid) {
    return result.decoded;
  }
  return null;
};

// ========== دیکود توکن بدون تأیید (فقط برای خواندن) ==========
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

// ========== بررسی انقضای توکن ==========
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // تبدیل به میلی‌ثانیه
  return Date.now() >= expirationTime;
};

// ========== دریافت زمان انقضای توکن ==========
export const getTokenExpiry = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
};

// ========== رفرش توکن (ساده) ==========
export const refreshToken = (oldToken) => {
  const user = getUserFromToken(oldToken);
  if (!user) return null;
  
  // حذف فیلدهای زمانی قدیمی
  const { iat, exp, ...cleanUser } = user;
  return generateToken(cleanUser);
};

export default {
  generateToken,
  verifyToken,
  getUserFromToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  refreshToken
};
