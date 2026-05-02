const API_URL = 'http://localhost:5003/api/blog';

export const getBlogPosts = async (onlyHomepage = false) => {
  try {
    const url = onlyHomepage ? `${API_URL}?homepage=true` : API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error('خطا در دریافت پست‌ها');
    return await res.json();
  } catch (error) {
    console.error('getBlogPosts error:', error);
    return [];
  }
};

export const getBlogPostById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('getBlogPostById error:', error);
    return null;
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_URL}/slug/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('getBlogPostBySlug error:', error);
    return null;
  }
};

export const addBlogPost = async (post) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    return await res.json();
  } catch (error) {
    console.error('addBlogPost error:', error);
    throw error;
  }
};

export const updateBlogPost = async (id, updates) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    return await res.json();
  } catch (error) {
    console.error('updateBlogPost error:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف پست');
    return await res.json();
  } catch (error) {
    console.error('deleteBlogPost error:', error);
    throw error;
  }
};

// تابع جدید: تغییر وضعیت نمایش در صفحه اصلی
export const toggleHomepageDisplay = async (id, show_on_homepage) => {
  try {
    const res = await fetch(`${API_URL}/${id}/toggle-homepage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_on_homepage })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    return await res.json();
  } catch (error) {
    console.error('toggleHomepageDisplay error:', error);
    throw error;
  }
};
