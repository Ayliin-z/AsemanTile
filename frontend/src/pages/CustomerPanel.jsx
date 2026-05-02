// frontend/src/pages/CustomerPanel.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'  // ← Navigate اضافه شد
import { Navigate } from 'react-router-dom'  // ← این خط اضافه شد
import { getCurrentCustomer, logoutCustomer } from '../utils/customerAuth'
import './CustomerPanel.css'

const CustomerPanel = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const customer = getCurrentCustomer()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutCustomer()
    navigate('/login')
  }

  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <div className="customer-profile">
          <div className="avatar">👤</div>
          <h3>{customer.firstName} {customer.lastName}</h3>
          <p>{customer.email}</p>
        </div>
        <nav className="customer-nav">
          <button className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => setActiveMenu('dashboard')}>📊 پیشخوان</button>
          <button className={activeMenu === 'orders' ? 'active' : ''} onClick={() => setActiveMenu('orders')}>📦 سفارش‌ها</button>
          <button className={activeMenu === 'downloads' ? 'active' : ''} onClick={() => setActiveMenu('downloads')}>⬇️ دانلودها</button>
          <button className={activeMenu === 'addresses' ? 'active' : ''} onClick={() => setActiveMenu('addresses')}>📍 آدرس‌ها</button>
          <button className={activeMenu === 'account' ? 'active' : ''} onClick={() => setActiveMenu('account')}>⚙️ جزئیات حساب</button>
          <button onClick={handleLogout} className="logout-btn">🚪 خروج</button>
        </nav>
      </aside>

      <main className="customer-main">
        <header className="customer-header">
          <h1>
            {activeMenu === 'dashboard' && 'پیشخوان'}
            {activeMenu === 'orders' && 'سفارش‌های من'}
            {activeMenu === 'downloads' && 'دانلودها'}
            {activeMenu === 'addresses' && 'آدرس‌های من'}
            {activeMenu === 'account' && 'جزئیات حساب'}
          </h1>
        </header>

        <div className="customer-content">
          {activeMenu === 'dashboard' && (
            <div className="welcome-card">
              <h2>خوش آمدید، {customer.firstName}!</h2>
              <p>جهت دسترسی آسان به لینک‌های پیشخوان می‌توانید از منوی روبرو اقدام فرمایید.</p>
              <div className="quick-links">
                <Link to="/products" className="quick-link">🛒 مشاهده محصولات</Link>
              </div>
            </div>
          )}

          {activeMenu === 'orders' && (
            <div className="placeholder-content">
              <p>📦 شما هنوز سفارشی ثبت نکرده‌اید.</p>
            </div>
          )}

          {activeMenu === 'downloads' && (
            <div className="placeholder-content">
              <p>📥 فایلی برای دانلود موجود نیست.</p>
            </div>
          )}

          {activeMenu === 'addresses' && (
            <div className="placeholder-content">
              <p>📍 آدرسی ثبت نشده است.</p>
              <button className="btn-primary">➕ افزودن آدرس جدید</button>
            </div>
          )}

          {activeMenu === 'account' && (
            <div className="account-details">
              <h3>اطلاعات حساب کاربری</h3>
              <div className="detail-row"><span>نام:</span> {customer.firstName}</div>
              <div className="detail-row"><span>نام خانوادگی:</span> {customer.lastName}</div>
              <div className="detail-row"><span>شماره تماس:</span> {customer.phone}</div>
              <div className="detail-row"><span>ایمیل:</span> {customer.email}</div>
              <button className="btn-secondary">ویرایش اطلاعات</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CustomerPanel
