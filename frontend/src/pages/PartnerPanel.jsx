// frontend/src/pages/PartnerPanel.jsx
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { getCurrentCustomer, logoutCustomer } from '../utils/customerAuth'
import './CustomerPanel.css'

const PartnerPanel = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const customer = getCurrentCustomer()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutCustomer()
    navigate('/login')
  }

  if (!customer || customer.role !== 'partner') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <div className="customer-profile">
          <div className="avatar">🤝</div>
          <h3>{customer.firstName} {customer.lastName}</h3>
          <p>{customer.email}</p>
          <p className="partner-badge">همکار</p>
        </div>
        <nav className="customer-nav">
          <button className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => setActiveMenu('dashboard')}>📊 پیشخوان</button>
          <button className={activeMenu === 'orders' ? 'active' : ''} onClick={() => setActiveMenu('orders')}>📦 سفارش‌ها</button>
          <button className={activeMenu === 'products' ? 'active' : ''} onClick={() => setActiveMenu('products')}>🛒 محصولات ویژه همکار</button>
          <button className={activeMenu === 'account' ? 'active' : ''} onClick={() => setActiveMenu('account')}>⚙️ جزئیات حساب</button>
          <button onClick={handleLogout} className="logout-btn">🚪 خروج</button>
        </nav>
      </aside>

      <main className="customer-main">
        <header className="customer-header">
          <h1>
            {activeMenu === 'dashboard' && 'پیشخوان همکار'}
            {activeMenu === 'orders' && 'سفارش‌های من'}
            {activeMenu === 'products' && 'محصولات ویژه'}
            {activeMenu === 'account' && 'جزئیات حساب'}
          </h1>
        </header>

        <div className="customer-content">
          {activeMenu === 'dashboard' && (
            <div className="welcome-card">
              <h2>خوش آمدید همکار گرامی، {customer.firstName}!</h2>
              <p>شما به عنوان همکار تجاری به قیمت‌های ویژه دسترسی دارید.</p>
            </div>
          )}
          {activeMenu === 'orders' && (
            <div className="placeholder-content">
              <p>📦 شما هنوز سفارشی ثبت نکرده‌اید.</p>
            </div>
          )}
          {activeMenu === 'products' && (
            <div className="placeholder-content">
              <p>🛒 محصولات ویژه همکار به‌زودی در این بخش قرار می‌گیرند.</p>
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

export default PartnerPanel
