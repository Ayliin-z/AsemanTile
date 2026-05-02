// frontend/src/pages/BlogPostPage.jsx
import { useParams, Link } from 'react-router-dom'
import { getBlogPostBySlug } from '../utils/blog'
import { useState, useEffect } from 'react'
import './BlogPostPage.css'

const BlogPostPage = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => {
    const found = getBlogPostBySlug(slug)
    setPost(found)
  }, [slug])

  if (!post) {
    return (
      <div className="not-found">
        <h2>مقاله یافت نشد</h2>
        <Link to="/blog">بازگشت به وبلاگ</Link>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        <Link to="/blog" className="back-link">← بازگشت به وبلاگ</Link>
        <article className="post-content">
          <header className="post-header">
            {post.image && <img src={post.image} alt={post.title} className="post-feature-image" />}
            <h1>{post.title}</h1>
          </header>
          <div className="post-meta">
            <span className="date">{new Date(post.date).toLocaleDateString('fa-IR')}</span>
            <span className="comments">{post.comments} دیدگاه</span>
          </div>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </div>
  )
}

export default BlogPostPage
