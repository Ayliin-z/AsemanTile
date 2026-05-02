const API_URL = 'http://localhost:5003/api/product-templates';

export const getProductTemplates = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('خطا در دریافت قالب‌ها');
    return await res.json();
  } catch (error) {
    console.error('getProductTemplates error:', error);
    return [];
  }
};

export const getTemplateBySize = async (size) => {
  try {
    const res = await fetch(`${API_URL}/size/${encodeURIComponent(size)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
};

export const getTemplateByGlaze = async (glazeType) => {
  try {
    const res = await fetch(`${API_URL}/glaze/${encodeURIComponent(glazeType)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
};

export const addProductTemplate = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در افزودن قالب');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const updateProductTemplate = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در به‌روزرسانی قالب');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deleteProductTemplate = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف قالب');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

// تابع تولید توضیحات خودکار محصول
export const generateProductDescription = (product, templates) => {
  let fullDescription = '';
  
  // پیدا کردن قالب بر اساس سایز
  if (product.size) {
    const sizeTemplate = templates.find(t => t.size === product.size);
    if (sizeTemplate) {
      fullDescription += `<h2>${sizeTemplate.title}</h2>`;
      fullDescription += `<p>${sizeTemplate.description}</p>`;
      if (sizeTemplate.usage_guide) {
        fullDescription += `<h3>📍 راهنمای کاربرد</h3><p>${sizeTemplate.usage_guide}</p>`;
      }
    }
  }
  
  // پیدا کردن قالب بر اساس نوع لعاب
  if (product.glaze) {
    const glazeTemplate = templates.find(t => t.glaze_type === product.glaze);
    if (glazeTemplate) {
      fullDescription += `<h2>${glazeTemplate.title}</h2>`;
      fullDescription += `<p>${glazeTemplate.description}</p>`;
      if (glazeTemplate.usage_guide) {
        fullDescription += `<h3>📍 مناسب برای</h3><p>${glazeTemplate.usage_guide}</p>`;
      }
      if (glazeTemplate.maintenance) {
        fullDescription += `<h3>🧼 نحوه نگهداری</h3><p>${glazeTemplate.maintenance}</p>`;
      }
    }
  }
  
  // افزودن توضیحات اختصاصی محصول اگر وجود داشته باشد
  if (product.description) {
    fullDescription += `<h2>🏷️ مشخصات فنی</h2><p>${product.description}</p>`;
  }
  
  return fullDescription;
};
