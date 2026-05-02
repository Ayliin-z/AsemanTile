// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* ستون اول: اطلاعات تماس */}
        <div className="footer-column">
          <h3>اطلاعات تماس</h3>
          <ul>
            <li>📞 تلفن: ۰۷۱۴۳۳۳۳۳۳۳</li>
            <li>✉️ ایمیل: info@asemantile.com</li>
            <li>📱 شماره موبایل: ۰۹۱۰۸۷۰۶۹۸</li>
            <li>📍 شیراز، بلوار پاسداران، نبش کوچه ۶۰، طبقه دوم بانک سیه</li>
          </ul>
        </div>

        {/* ستون دوم: لینک های مفید */}
        <div className="footer-column">
          <h3>لینک های مفید</h3>
          <ul>
            <li><Link to="/about">درباره ما</Link></li>
            <li><Link to="/contact">تماس با ما</Link></li>
            <li><Link to="/blog">وبلاگ</Link></li>
          </ul>
        </div>

        {/* ستون سوم: انواع محصولات */}
        <div className="footer-column">
          <h3>انواع محصولات</h3>
          <ul>
            <li><Link to="/products?category=کاشی">انواع کاشی</Link></li>
            <li><Link to="/products?category=سرامیک">انواع سرامیک</Link></li>
            <li><Link to="/products?category=موزاییک">انواع موزاییک</Link></li>
          </ul>
        </div>
      </div>

      {/* نوار کپی‌رایت */}
      <div className="footer-bottom">
        <p>تمامی حقوق برای کاشی و سرامیک آسمان محفوظ است. © {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default Footer
