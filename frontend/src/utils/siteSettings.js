// src/utils/siteSettings.js
const SETTINGS_KEY = 'aseman_site_settings';

const defaultSettings = {
  salesMode: 'cart',           // 'cart' یا 'contact'
  landingTags: ['فروش ویژه', 'جدید', 'پرفروش']  // برای صفحه اصلی
};

// دریافت تنظیمات
export const getSiteSettings = async () => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultSettings;
    }
  }
  return defaultSettings;
};

// ذخیره تنظیمات (عمومی)
export const saveSiteSettings = async (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return true;
};

// تغییر حالت فروش
export const setSalesMode = async (mode) => {
  const settings = await getSiteSettings();
  settings.salesMode = mode;
  return saveSiteSettings(settings);
};

// ذخیره تگ‌های صفحه اصلی
export const setLandingTags = async (tags) => {
  const settings = await getSiteSettings();
  settings.landingTags = tags;
  return saveSiteSettings(settings);
};
