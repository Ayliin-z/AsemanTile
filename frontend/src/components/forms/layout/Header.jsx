import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isAuthenticated } from '../../utils/auth'
import { isCustomerAuthenticated, getCurrentCustomer } from '../../utils/customerAuth'
import './Header.css'

const Header = () => {
  const location = useLocation()
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false)
  const [customerRole, setCustomerRole] = useState(null)

  useEffect(() => {
    const admin = isAuthenticated()
    const custAuth = isCustomerAuthenticated()
    setAdminLoggedIn(admin)
    setCustomerLoggedIn(custAuth)
    if (custAuth) {
      const cust = getCurrentCustomer()
      setCustomerRole(cust?.role || null)
    } else {
      setCustomerRole(null)
    }
  }, [location.pathname])

  const getAccountLink = () => {
    if (adminLoggedIn) return <Link to="/admin" className="login-link">پنل مدیریت</Link>
    if (customerRole === 'partner') return <Link to="/partner" className="login-link">پنل همکار</Link>
    if (customerRole === 'customer') return <Link to="/customer" className="login-link">حساب کاربری</Link>
    return <Link to="/login" className="login-link">ورود / عضویت</Link>
  }

  return (
    <header className="main-header">
      <div className="container nav-container">
        <div className="nav-content">
          <div className="logo-area">
            <Link to="/" className="logo-link">
              <img src="/images/logo.png" alt="کاشی و سرامیک آسمان" className="logo-img" />
              <div className="logo-text">
                <h1>کاشی و سرامیک آسمان</h1>
              </div>
            </Link>
          </div>

          <nav className="navigation">
            <ul className="nav-menu">
              <li><Link to="/">خانه</Link></li>
              <li><Link to="/products">محصولات</Link></li>
              <li><Link to="/blog">وبلاگ</Link></li>
              <li><Link to="/about">درباره ما</Link></li>
              <li><Link to="/contact">تماس با ما</Link></li>
              <li className="login-item">
                {getAccountLink()}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
