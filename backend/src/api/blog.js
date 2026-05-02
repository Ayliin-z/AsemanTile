import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

// ========== GET /api/blog ==========
// دریافت لیست پست‌ها (با فیلترهای اختیاری)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, is_published, tag, search } = req.query;
    const filters = {};
    if (is_published !== undefined) filters.is_published = is_published;
    if (tag) filters.tag = tag;
    if (search) filters.search = search;
    filters.page = parseInt(page);
    filters.limit = parseInt(limit);
    
    const result = await Blog.findAll(filters);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست‌ها' });
  }
});

// ========== GET /api/blog/published ==========
// دریافت پست‌های منتشر شده (برای صفحه وبلاگ عمومی)
router.get('/published', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Blog.getPublishedPosts(parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست‌های منتشر شده' });
  }
});

// ========== GET /api/blog/homepage ==========
// دریافت پست‌های صفحه اصلی (نمایش در لندینگ)
router.get('/homepage', async (req, res) => {
  try {
    // پست‌های منتشر شده را بگیر و سه تای اول را برگردان
    const { posts } = await Blog.getPublishedPosts(1, 3);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست‌های صفحه اصلی' });
  }
});

// ========== GET /api/blog/most-viewed ==========
// پست‌های پربازدید
router.get('/most-viewed', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const posts = await Blog.getMostViewed(parseInt(limit));
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست‌های پربازدید' });
  }
});

// ========== GET /api/blog/tags ==========
// دریافت لیست تگ‌ها
router.get('/tags', async (req, res) => {
  try {
    const tags = await Blog.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت تگ‌ها' });
  }
});

// ========== GET /api/blog/stats ==========
// آمار وبلاگ (برای پنل ادمین)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Blog.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// ========== GET /api/blog/:id ==========
// دریافت یک پست با ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await Blog.findById(id);
    if (!post) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست' });
  }
});

// ========== GET /api/blog/slug/:slug ==========
// دریافت پست با اسلاگ (برای صفحه عمومی وبلاگ - نمایش مطلب)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Blog.findBySlug(slug);
    if (!post) return res.status(404).json({ error: 'پست یافت نشد' });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست' });
  }
});

// ========== GET /api/blog/:id/related ==========
// پست‌های مرتبط با یک پست
router.get('/:id/related', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { limit = 3 } = req.query;
    const related = await Blog.getRelatedPosts(id, parseInt(limit));
    res.json(related);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در دریافت پست‌های مرتبط' });
  }
});

// ========== POST /api/blog ==========
// ایجاد پست جدید (فقط مدیر/کارمند دارای مجوز)
router.post('/', async (req, res) => {
  try {
    const postData = req.body;
    // در آینده userId را از توکن دریافت کنید - فعلاً از req.body یا یک مقدار پیش‌فرض
    const userId = req.body.created_by || 1;
    const newPost = await Blog.create(postData, userId);
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'خطا در ایجاد پست' });
  }
});

// ========== PUT /api/blog/:id ==========
// به‌روزرسانی پست
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const userId = req.body.created_by || 1;
    const updatedPost = await Blog.update(id, updates, userId);
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'خطا در به‌روزرسانی پست' });
  }
});

// ========== PATCH /api/blog/:id/toggle-publish ==========
// انتشار/عدم انتشار پست
router.patch('/:id/toggle-publish', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedPost = await Blog.togglePublish(id);
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'خطا در تغییر وضعیت انتشار' });
  }
});

// ========== DELETE /api/blog/:id ==========
// حذف پست
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Blog.delete(id);
    res.json({ message: 'پست با موفقیت حذف شد' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'خطا در حذف پست' });
  }
});

export default router;
