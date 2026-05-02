import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../utils/blog';
import './BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const data = await getBlogPosts(); // همه پست‌ها
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadPosts();
  }, []);

  if (loading) return <div className="loading">در حال بارگذاری...</div>;
  if (!posts.length) return <div className="no-posts">هیچ مقاله‌ای یافت نشد.</div>;

  return (
    <div className="blog-page">
      <div className="container">
        <h1>وبلاگ</h1>
        <div className="blog-grid">
          {posts.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
              {post.image && <img src={post.image} alt={post.title} />}
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span>{new Date(post.created_at).toLocaleDateString('fa-IR')}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
