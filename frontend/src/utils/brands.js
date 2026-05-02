const STORAGE_KEY = 'aseman_brands_v1'

const defaultBrands = [
  'حافظ', 'آسمان', 'چوبینه', 'سرامیک البرز', 
  'اسپانیایی', 'ماربل امپرادور', 'پرسلان نیو کارن'
]

export const getBrands = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  const initial = defaultBrands.map(name => ({ name, enabled: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const getEnabledBrands = () => {
  const all = getBrands()
  return all.filter(b => b.enabled).map(b => b.name)
}

export const addBrand = (brandName) => {
  const brands = getBrands()
  const trimmed = brandName.trim()
  if (!trimmed) return { success: false, error: 'نام برند نمی تواند خالی باشد.' }
  if (brands.find(b => b.name === trimmed)) {
    return { success: false, error: 'این برند قبلاً وجود دارد.' }
  }
  const updated = [...brands, { name: trimmed, enabled: true }]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return { success: true, brands: updated }
}

export const updateBrand = (oldName, newName) => {
  const brands = getBrands()
  const trimmedNew = newName.trim()
  if (!trimmedNew) return { success: false, error: 'نام برند نمی تواند خالی باشد.' }
  const index = brands.findIndex(b => b.name === oldName)
  if (index === -1) return { success: false, error: 'برند یافت نشد.' }
  if (brands.find(b => b.name === trimmedNew && b.name !== oldName)) {
    return { success: false, error: 'این نام قبلاً وجود دارد.' }
  }
  brands[index].name = trimmedNew
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands))
  return { success: true, brands }
}

export const toggleBrandEnabled = (brandName, enabled) => {
  const brands = getBrands()
  const brand = brands.find(b => b.name === brandName)
  if (!brand) return { success: false, error: 'برند یافت نشد.' }
  brand.enabled = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands))
  return { success: true, brands }
}

export const deleteBrand = (brandName) => {
  const brands = getBrands()
  const filtered = brands.filter(b => b.name !== brandName)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return { success: true, brands: filtered }
}

export const ensureBrandExists = (brandName) => {
  if (!brandName || brandName.trim() === '') return
  const brands = getBrands()
  const trimmed = brandName.trim()
  if (!brands.find(b => b.name === trimmed)) {
    const updated = [...brands, { name: trimmed, enabled: true }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
}
