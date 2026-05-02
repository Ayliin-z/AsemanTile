import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as adminLogin } from '../utils/auth'
import { loginCustomer } from '../utils/customerAuth'
import { loginEmployee } from '../utils/employeeAuth'
import './LoginPage.css'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // ادمین (با نام کاربری admin)
    if (adminLogin(username, password)) {
      navigate('/admin')
      return
    }

    // کارمند (با ایمیل و رمز)
    const employeeResult = await loginEmployee(username, password)
    if (employeeResult.success) {
      navigate('/employee')
      return
    }

    // مشتری (با ایمیل و رمز)
    const customerResult = loginCustomer(username, password)
    if (customerResult.success) {
      navigate('/customer')
      return
    }

    setError('نام کاربری/ایمیل یا رمز عبور اشتباه است.')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>ورود به حساب</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="نام کاربری (ادمین) یا ایمیل (مشتری/کارمند)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">ورود</button>
        </form>
        <p className="register-link">
          حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام</Link>
        </p>
        <p className="hint">ادمین: admin / 1234</p>
        <p className="hint">کارمند: ایمیل / رمز عبور</p>
      </div>
    </div>
  )
}

export default LoginPage
