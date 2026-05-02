// frontend/src/utils/storage.js
const API_URL = 'http://localhost:5003/api/products';

const normalizeProduct = (p) => ({
  id: p.id,
  productCode: p.productcode || p.sku || p.productCode || '',
  grade: p.grade || '',
  name: p.name || 'بدون نام',
  price: Number(p.price_public) || Number(p.price) || 0,
  partnerPrice: Number(p.price_partner) || Number(p.partnerprice) || Number(p.partnerPrice) || 0,
  discount: Number(p.discount) || 0,
  stock: Number(p.stock_quantity) || Number(p.stock) || 0,
  description: p.description || '',
  manufacturer: p.brand || p.manufacturer || '',
  glazeType: p.glazetype || p.glazeType || '',
  suitableFor: p.suitablefor || p.suitableFor || '',
  category: p.category || '',
  size: p.size || '',
  glaze: p.glaze || '',
  color: p.color || '',
  images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
  fullDescription: p.fulldescription || p.fullDescription || '',
  tags: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []),
  audience: p.audience || 'all'
});

export const getProducts = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('خطا در دریافت محصولات');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map(normalizeProduct);
    }
    return [];
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return normalizeProduct(data.data);
    }
    return null;
  } catch (error) {
    console.error('getProductById error:', error);
    return null;
  }
};

export const getProductByCode = async (productCode) => {
  try {
    const res = await fetch(`${API_URL}/code/${productCode}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return normalizeProduct(data.data);
    }
    return null;
  } catch (error) {
    console.error('getProductByCode error:', error);
    return null;
  }
};

export const addProduct = async (product) => {
  console.log('addProduct called with:', product);
  try {
    const apiProduct = {
      productcode: product.productCode,
      grade: product.grade || '',
      name: product.name,
      price: Number(product.price) || 0,
      partnerprice: Number(product.partnerPrice) || 0,
      discount: Number(product.discount) || 0,
      stock: Number(product.stock) || 0,
      description: product.description || '',
      manufacturer: product.manufacturer || '',
      glazetype: product.glazeType || '',
      suitablefor: product.suitableFor || '',
      category: product.category || '',
      size: product.size || '',
      glaze: product.glaze || '',
      color: product.color || '',
      images: product.images || [],
      fulldescription: product.fullDescription || '',
      tags: product.tags || [],
      audience: product.audience || 'all'
    };
    
    console.log('Sending to API:', apiProduct);
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiProduct),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(errorText);
    }
    
    const data = await res.json();
    console.log('Add product response:', data);
    
    if (data.success && data.data) {
      return normalizeProduct(data.data);
    }
    throw new Error(data.error || 'خطا در افزودن محصول');
  } catch (error) {
    console.error('addProduct fetch error:', error);
    throw error;
  }
};

export const updateProduct = async (id, updates) => {
  console.log('updateProduct called with:', id, updates);
  try {
    const apiUpdates = {};
    if (updates.price !== undefined) apiUpdates.price = updates.price;
    if (updates.partnerPrice !== undefined) apiUpdates.partnerprice = updates.partnerPrice;
    if (updates.stock !== undefined) apiUpdates.stock = updates.stock;
    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.productCode !== undefined) apiUpdates.productcode = updates.productCode;
    if (updates.manufacturer !== undefined) apiUpdates.manufacturer = updates.manufacturer;
    if (updates.description !== undefined) apiUpdates.description = updates.description;
    if (updates.category !== undefined) apiUpdates.category = updates.category;
    if (updates.size !== undefined) apiUpdates.size = updates.size;
    if (updates.color !== undefined) apiUpdates.color = updates.color;
    if (updates.discount !== undefined) apiUpdates.discount = updates.discount;
    if (updates.grade !== undefined) apiUpdates.grade = updates.grade;
    if (updates.glazeType !== undefined) apiUpdates.glazetype = updates.glazeType;
    if (updates.suitableFor !== undefined) apiUpdates.suitablefor = updates.suitableFor;
    if (updates.glaze !== undefined) apiUpdates.glaze = updates.glaze;
    if (updates.images !== undefined) apiUpdates.images = updates.images;
    if (updates.fullDescription !== undefined) apiUpdates.fulldescription = updates.fullDescription;
    if (updates.tags !== undefined) apiUpdates.tags = updates.tags;
    if (updates.audience !== undefined) apiUpdates.audience = updates.audience;
    
    console.log('Sending update to API:', apiUpdates);
    
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiUpdates),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error('خطا در به‌روزرسانی محصول');
    }
    
    const data = await res.json();
    console.log('Update product response:', data);
    
    if (data.success && data.data) {
      return normalizeProduct(data.data);
    }
    throw new Error(data.error || 'خطا در به‌روزرسانی محصول');
  } catch (error) {
    console.error('updateProduct error:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف محصول');
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error('deleteProduct error:', error);
    throw error;
  }
};

export const exportData = async () => {
  const products = await getProducts();
  return JSON.stringify(products, null, 2);
};

export const importData = async (jsonString) => {
  try {
    const products = JSON.parse(jsonString);
    let addedCount = 0, updatedCount = 0;
    
    for (const p of products) {
      const existing = await getProductByCode(p.productCode);
      if (existing) {
        await updateProduct(existing.id, {
          price: p.price,
          partnerPrice: p.partnerPrice,
          stock: p.stock,
          name: p.name,
          manufacturer: p.manufacturer,
          description: p.description
        });
        updatedCount++;
      } else {
        await addProduct(p);
        addedCount++;
      }
    }
    
    return { success: true, added: addedCount, updated: updatedCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const resetToDefault = async () => {
  console.warn('resetToDefault not implemented in backend');
};

export const applyBulkDiscount = async (productIds, discountType, value) => {
  console.warn('applyBulkDiscount not implemented in backend');
};

// تابع جدید برای گرفتن لیست سایزها
export const getAllSizes = async () => {
  const products = await getProducts();
  const sizes = [...new Set(products.map(p => p.size).filter(Boolean))];
  return sizes.sort();
};

// تابع جدید برای گرفتن لیست لعاب‌ها
export const getAllGlazes = async () => {
  const products = await getProducts();
  const glazes = [...new Set(products.map(p => p.glaze).filter(Boolean))];
  return glazes.sort();
};

// تابع جدید برای گرفتن لیست کاربردها
export const getAllUsages = async () => {
  const products = await getProducts();
  const usages = [...new Set(products.map(p => p.suitableFor).filter(Boolean))];
  return usages.sort();
};

// تابع جدید برای گرفتن لیست رنگ‌ها
export const getAllColors = async () => {
  const products = await getProducts();
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
  return colors.sort();
};
