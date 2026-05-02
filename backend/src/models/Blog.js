// backend/src/models/Blog.js

// ========== ذخیره‌سازی موقت در حافظه ==========
let blogPosts = [
  {
    id: 1,
    title: 'بهترین سرامیک برای کف چیه؟',
    slug: 'best-ceramic-for-floor',
    excerpt: 'انتخاب بهترین رنگ سرامیک کف پذیرایی یکی از مهم‌ترین تصمیماتی است که در دکوراسیون داخلی تأثیر زیادی دارد. در این مقاله به بررسی کامل انواع سرامیک مناسب برای کف می‌پردازیم.',
    content: `
      <h2>بهترین سرامیک برای کف</h2>
      <p>انتخاب سرامیک مناسب برای کف یکی از مهم‌ترین تصمیمات در دکوراسیون داخلی است. سرامیک کف باید علاوه بر زیبایی، مقاومت بالایی در برابر رفت و آمد، لکه و رطوبت داشته باشد.</p>
      
      <h3>۱. سرامیک پرسلان</h3>
      <p>پرسلان یکی از مقاوم‌ترین انواع سرامیک است که برای فضاهای پررفتوآمد مانند پذیرایی، راهرو و آشپزخانه مناسب می‌باشد. این نوع سرامیک جذب آب بسیار پایینی دارد و در برابر لک شدن مقاوم است.</p>
      
      <h3>۲. سرامیک لعاب دار</h3>
      <p>سرامیک‌های لعاب دار دارای یک لایه محافظ هستند که آنها را در برابر رطوبت و لکه مقاوم می‌کند. این نوع سرامیک برای حمام و سرویس بهداشتی بسیار مناسب است.</p>
      
      <h3>۳. سرامیک طرح چوب</h3>
      <p>اگر به دنبال ظاهری گرم و طبیعی هستید، سرامیک‌های طرح چوب انتخاب عالی‌ای هستند. این سرامیک‌ها زیبایی چوب را با دوام سرامیک ترکیب می‌کنند.</p>
      
      <h2>نکات مهم در انتخاب سرامیک کف</h2>
      <ul>
        <li><strong>ضریب اصطکاک:</strong> برای جلوگیری از لغزندگی، سرامیک‌هایی با ضریب اصطکاک بالا انتخاب کنید.</li>
        <li><strong>رنگ و طرح:</strong> رنگ‌های روشن فضا را بزرگتر نشان می‌دهند، رنگ‌های ترماه更适合 فضاهای لوکس.</li>
        <li><strong>اندازه:</strong> سرامیک‌های بزرگ (>60cm) فضا را بزرگتر نشان می‌دهند.</li>
        <li><strong>مقاومت در برابر لکه:</strong> برای فضاهایی مانند آشپزخانه حتماً سرامیک ضد لکه انتخاب کنید.</li>
      </ul>
      
      <h2>نتیجه‌گیری</h2>
      <p>بهترین سرامیک برای کف بستگی به نیاز شما و فضای مورد نظر دارد. برای فضاهای پررفتوآمد پرسلان، برای فضاهای مرطوب سرامیک لعاب دار و برای دکوراسیون مدرن سرامیک طرح چوب گزینه‌های مناسبی هستند.</p>
    `,
    image: '/images/blog/ceramic-floor.jpg',
    meta_title: 'بهترین سرامیک برای کف - راهنمای کامل انتخاب سرامیک مناسب',
    meta_description: 'راهنمای کامل انتخاب بهترین سرامیک برای کف منزل و محل کار. مقایسه انواع سرامیک کف و نکات مهم در خرید',
    tags: ['سرامیک', 'کف', 'راهنما'],
    views: 1250,
    is_published: true,
    created_by: 1,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'کاشی و سرامیک چه تفاوت هایی با هم دارند؟',
    slug: 'difference-between-tile-and-ceramic',
    excerpt: 'اگه بخوام خیلی خلاصه کنم، باید بگم که کاشی و سرامیک هر دو برای کف و دیوار استفاده میشن، اما تفاوت‌های مهمی در جذب آب، مقاومت و کاربرد دارند. در این مقاله این تفاوت‌ها را بررسی می‌کنیم.',
    content: `
      <h2>تفاوت کاشی و سرامیک</h2>
      <p>بسیاری از مردم کاشی و سرامیک را یکسان می‌دانند، اما این دو محصول تفاوت‌های اساسی با هم دارند. در این مقاله به بررسی کامل این تفاوت‌ها می‌پردازیم.</p>
      
      <h3>تفاوت در جذب آب</h3>
      <p>کاشی‌ها معمولاً جذب آب بیشتری دارند (بین ۱۰ تا ۲۰ درصد) در حالی که سرامیک‌ها جذب آب کمتری دارند (کمتر از ۵ درصد). به همین دلیل سرامیک برای فضاهای مرطوب مانند حمام و سرویس بهداشتی مناسب‌تر است.</p>
      
      <h3>تفاوت در مقاومت</h3>
      <p>سرامیک‌ها به دلیل فرایند پخت در دمای بالاتر، مقاومت بیشتری نسبت به کاشی دارند و برای فضاهای پررفتوآمد مناسب‌تر هستند.</p>
      
      <h3>تفاوت در کاربرد</h3>
      <ul>
        <li><strong>کاشی:</strong> بیشتر برای دیوار و فضاهای کم تردد</li>
        <li><strong>سرامیک:</strong> مناسب برای کف و فضاهای پررفتوآمد</li>
      </ul>
      
      <h2>جدول مقایسه کاشی و سرامیک</h2>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <tr><th>ویژگی</th><th>کاشی</th><th>سرامیک</th></tr>
        <tr><td>جذب آب</td><td>۱۰-۲۰٪</td><td>&lt;۵٪</td></tr>
        <tr><td>دمای پخت</td><td>۸۰۰-۱۰۰۰ درجه</td><td>۱۲۰۰-۱۳۰۰ درجه</td></tr>
        <tr><td>مقاومت</td><td>متوسط</td><td>بالا</td></tr>
        <tr><td>مناسب برای</td><td>دیوار</td><td>کف و دیوار</td></tr>
      </table>
      
      <h2>نتیجه‌گیری</h2>
      <p>انتخاب بین کاشی و سرامیک به نیاز شما بستگی دارد. اگر به دنبال محصولی با مقاومت بالا و مناسب برای کف هستید، سرامیک انتخاب بهتری است. اما اگر برای دیوار و فضاهای کم تردد نیاز دارید، کاشی گزینه مناسب‌تری است.</p>
    `,
    image: '/images/blog/tile-vs-ceramic.jpg',
    meta_title: 'تفاوت کاشی و سرامیک - راهنمای کامل انتخاب',
    meta_description: 'تفاوت کاشی و سرامیک در جذب آب، مقاومت و کاربرد. راهنمای جامع برای انتخاب بهترین گزینه برای پروژه شما',
    tags: ['کاشی', 'سرامیک', 'مقایسه', 'راهنما'],
    views: 890,
    is_published: true,
    created_by: 1,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'بهترین رنگ سرامیک کف پذیرایی چیه؟',
    slug: 'best-color-for-living-room-floor',
    excerpt: 'بهترین رنگ سرامیک کف پذیرایی چیه؟ انتخاب بهترین رنگ سرامیک کف پذیرایی می‌تواند تأثیر زیادی در زیبایی و حس فضا داشته باشد. در این مقاله بهترین رنگ‌ها را معرفی می‌کنیم.',
    content: `
      <h2>بهترین رنگ سرامیک کف پذیرایی</h2>
      <p>انتخاب رنگ مناسب برای کف پذیرایی یکی از مهم‌ترین تصمیمات در دکوراسیون داخلی است. رنگ کف می‌تواند فضا را کوچک یا بزرگ نشان دهد، حس گرما یا خنکی منتقل کند و با سایر عناصر دکوراسیون هماهنگ شود.</p>
      
      <h3>۱. رنگ کرم و بژ (محبوب‌ترین)</h3>
      <p>رنگ‌های کرم و بژ به دلیل طبیعت خنثی و هماهنگی با几乎所有 سبک‌های دکوراسیون، محبوب‌ترین انتخاب برای کف پذیرایی هستند. این رنگ‌ها فضا را روشن و دلباز نشان می‌دهند.</p>
      
      <h3>۲. رنگ طوسی (مدرن و شیک)</h3>
      <p>رنگ طوسی برای دکوراسیون مدرن و مینیمال بسیار مناسب است. این رنگ با مبلمان روشن و تیره هر دو هماهنگ می‌شود و حس شیکی به فضا می‌دهد.</p>
      
      <h3>۳. رنگ سفید (روشن و مدرن)</h3>
      <p>سرامیک سفید فضا را بسیار روشن و بزرگ نشان می‌دهد. این رنگ برای فضاهای کوچک و کم نور بسیار مناسب است، اما نگهداری آن نسبت به رنگ‌های دیگر سخت‌تر است.</p>
      
      <h3>۴. رنگ قهوه‌ای (گرم و صمیمی)</h3>
      <p>رنگ‌های قهوه‌ای و چوبی حس گرما و صمیمیت را به فضا منتقل می‌کنند. این رنگ‌ها برای سبک‌های کلاسیک و روستیک非常适合 هستند.</p>
      
      <h2>نکات مهم در انتخاب رنگ</h2>
      <ul>
        <li><strong>نور فضا:</strong> فضاهای کم نور به رنگ‌های روشن نیاز دارند</li>
        <li><strong>اندازه فضا:</strong> رنگ‌های روشن فضا را بزرگتر نشان می‌دهند</li>
        <li><strong>سبک دکوراسیون:</strong> رنگ کف باید با مبلمان و دیوارها هماهنگ باشد</li>
        <li><strong>کثیفی:</strong> رنگ‌های روشن لکه را بیشتر نشان می‌دهند</li>
      </ul>
      
      <h2>جمع‌بندی</h2>
      <p>بهترین رنگ برای سرامیک کف پذیرایی بستگی به سلیقه شما، نور فضا و سبک دکوراسیون دارد. رنگ‌های کرم و بژ مطمئن‌ترین انتخاب هستند، در حالی که رنگ‌های طوسی و قهوه‌ای برای سبک‌های مدرن و کلاسیک مناسب‌اند.</p>
    `,
    image: '/images/blog/living-room-ceramic.jpg',
    meta_title: 'بهترین رنگ سرامیک کف پذیرایی - راهنمای کامل انتخاب رنگ',
    meta_description: 'انتخاب بهترین رنگ سرامیک کف پذیرایی با توجه به نور، اندازه فضا و سبک دکوراسیون. معرفی محبوب‌ترین رنگ‌ها با عکس',
    tags: ['سرامیک', 'رنگ', 'پذیرایی', 'دکوراسیون'],
    views: 2100,
    is_published: true,
    created_by: 1,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextId = 4;

// ========== توابع کمکی ==========
const generateSlug = (title) => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ========== کلاس Blog ==========
class Blog {
  // نرمالایز کردن پست وبلاگ
  static normalize(post) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || null,
      metaTitle: post.meta_title || post.title,
      metaDescription: post.meta_description || post.excerpt,
      tags: Array.isArray(post.tags) ? post.tags : [],
      views: post.views || 0,
      isPublished: post.is_published,
      createdBy: post.created_by,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    };
  }
  
  // دریافت همه پست‌ها
  static async findAll(filters = {}) {
    let filtered = [...blogPosts];
    
    if (filters.is_published === 'true') {
      filtered = filtered.filter(p => p.is_published === true);
    } else if (filters.is_published === 'false') {
      filtered = filtered.filter(p => p.is_published === false);
    }
    
    if (filters.tag) {
      filtered = filtered.filter(p => p.tags && p.tags.includes(filters.tag));
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(searchLower)) ||
        (p.content && p.content.toLowerCase().includes(searchLower))
      );
    }
    
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      posts: paginated.map(p => this.normalize(p)),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }
  
  // دریافت پست‌های منتشر شده (برای صفحه وبلاگ)
  static async getPublishedPosts(page = 1, limit = 10) {
    return await this.findAll({ is_published: 'true', page, limit });
  }
  
  // دریافت پست با ID
  static async findById(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return null;
    
    // افزایش بازدید
    if (post.is_published) {
      post.views = (post.views || 0) + 1;
    }
    
    return this.normalize(post);
  }
  
  // دریافت پست با slug
  static async findBySlug(slug) {
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return null;
    
    // افزایش بازدید
    if (post.is_published) {
      post.views = (post.views || 0) + 1;
    }
    
    return this.normalize(post);
  }
  
  // دریافت پست‌های مرتبط (بر اساس تگ‌ها)
  static async getRelatedPosts(postId, limit = 3) {
    const currentPost = blogPosts.find(p => p.id === postId);
    if (!currentPost) return [];
    
    const related = blogPosts.filter(p =>
      p.id !== postId &&
      p.is_published === true &&
      p.tags && currentPost.tags &&
      p.tags.some(tag => currentPost.tags.includes(tag))
    );
    
    related.sort((a, b) => (b.views || 0) - (a.views || 0));
    return related.slice(0, limit).map(p => this.normalize(p));
  }
  
  // دریافت پست‌های پربازدید
  static async getMostViewed(limit = 5) {
    const published = blogPosts.filter(p => p.is_published === true);
    published.sort((a, b) => (b.views || 0) - (a.views || 0));
    return published.slice(0, limit).map(p => this.normalize(p));
  }
  
  // ایجاد پست جدید
  static async create(postData, userId) {
    const { title, slug, excerpt, content, image, meta_title, meta_description, tags, is_published } = postData;
    
    if (!title || !content) {
      throw new Error('عنوان و محتوای پست الزامی است');
    }
    
    // تولید slug اگر داده نشده
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug(title);
    }
    
    // بررسی یکتایی slug
    const existing = blogPosts.find(p => p.slug === finalSlug);
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }
    
    const newPost = {
      id: nextId++,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
      content: content,
      image: image || null,
      meta_title: meta_title || title,
      meta_description: meta_description || (excerpt || content.substring(0, 160).replace(/<[^>]*>/g, '')),
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      is_published: is_published !== undefined ? is_published : true,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    blogPosts.unshift(newPost);
    return this.normalize(newPost);
  }
  
  // به‌روزرسانی پست
  static async update(id, updates, userId) {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('پست یافت نشد');
    }
    
    // به‌روزرسانی slug (اگر عنوان تغییر کرده باشد)
    if (updates.title && updates.title !== blogPosts[index].title) {
      let newSlug = generateSlug(updates.title);
      const existing = blogPosts.find(p => p.slug === newSlug && p.id !== id);
      if (existing) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      blogPosts[index].slug = newSlug;
    }
    
    // به‌روزرسانی فیلدها
    const fields = ['title', 'excerpt', 'content', 'image', 'meta_title', 'meta_description', 'tags', 'is_published'];
    for (const field of fields) {
      if (updates[field] !== undefined) {
        blogPosts[index][field] = updates[field];
      }
    }
    
    // اگر خلاصه تعریف نشده بود، از محتوا تولید کن
    if (!updates.excerpt && updates.content) {
      blogPosts[index].excerpt = updates.content.substring(0, 200).replace(/<[^>]*>/g, '');
    }
    
    blogPosts[index].updated_at = new Date().toISOString();
    
    return this.normalize(blogPosts[index]);
  }
  
  // انتشار/عدم انتشار پست
  static async togglePublish(id) {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('پست یافت نشد');
    }
    
    blogPosts[index].is_published = !blogPosts[index].is_published;
    blogPosts[index].updated_at = new Date().toISOString();
    
    return this.normalize(blogPosts[index]);
  }
  
  // حذف پست
  static async delete(id) {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('پست یافت نشد');
    }
    
    blogPosts.splice(index, 1);
    return true;
  }
  
  // آمار وبلاگ
  static async getStats() {
    const published = blogPosts.filter(p => p.is_published === true);
    const totalViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPosts = blogPosts.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
    
    return {
      total: blogPosts.length,
      published: published.length,
      draft: blogPosts.filter(p => !p.is_published).length,
      total_views: totalViews,
      average_views: blogPosts.length > 0 ? Math.round(totalViews / blogPosts.length) : 0,
      posts_this_month: recentPosts.length,
      most_viewed: (await this.getMostViewed(1))[0] || null
    };
  }
  
  // دریافت همه تگ‌های استفاده شده
  static async getAllTags() {
    const allTags = new Set();
    for (const post of blogPosts) {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag));
      }
    }
    return Array.from(allTags).sort();
  }
  
  // آمار بازدید روزانه (برای نمودار)
  static async getDailyViews(days = 30) {
    // در نسخه واقعی، باید بازدیدهای روزانه ذخیره شود
    // فعلاً یک mock برمی‌گردانیم
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyStats.push({
        date: date.toLocaleDateString('fa-IR'),
        views: Math.floor(Math.random() * 100) + 20
      });
    }
    return dailyStats;
  }
}

export default Blog;
