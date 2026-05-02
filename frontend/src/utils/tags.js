const STORAGE_KEY = 'aseman_tags_v1'

const defaultTags = ['جدید', 'پرفروش', 'تخفیف خورده', 'ویژه', 'فروش ویژه', 'فروش امروز']

export const getTags = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  const initial = defaultTags.map(name => ({ name, enabled: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const getEnabledTags = () => {
  const all = getTags()
  return all.filter(t => t.enabled).map(t => t.name)
}

export const addTag = (tagName) => {
  const tags = getTags()
  const trimmed = tagName.trim()
  if (!trimmed) return { success: false, error: 'نام تگ نمی تواند خالی باشد.' }
  if (tags.find(t => t.name === trimmed)) {
    return { success: false, error: 'این تگ قبلاً وجود دارد.' }
  }
  const updated = [...tags, { name: trimmed, enabled: true }]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return { success: true, tags: updated }
}

export const updateTag = (oldName, newName) => {
  const tags = getTags()
  const trimmedNew = newName.trim()
  if (!trimmedNew) return { success: false, error: 'نام تگ نمی تواند خالی باشد.' }
  const index = tags.findIndex(t => t.name === oldName)
  if (index === -1) return { success: false, error: 'تگ یافت نشد.' }
  if (tags.find(t => t.name === trimmedNew && t.name !== oldName)) {
    return { success: false, error: 'این نام قبلاً وجود دارد.' }
  }
  tags[index].name = trimmedNew
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
  return { success: true, tags }
}

export const toggleTagEnabled = (tagName, enabled) => {
  const tags = getTags()
  const tag = tags.find(t => t.name === tagName)
  if (!tag) return { success: false, error: 'تگ یافت نشد.' }
  tag.enabled = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
  return { success: true, tags }
}

export const deleteTag = (tagName) => {
  const tags = getTags()
  const filtered = tags.filter(t => t.name !== tagName)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return { success: true, tags: filtered }
}

export const ensureTagExists = (tagName) => {
  if (!tagName || tagName.trim() === '') return
  const tags = getTags()
  const trimmed = tagName.trim()
  if (!tags.find(t => t.name === trimmed)) {
    const updated = [...tags, { name: trimmed, enabled: true }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }
}
