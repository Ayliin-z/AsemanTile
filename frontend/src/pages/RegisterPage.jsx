// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerCustomer } from '../utils/customerAuth'
import './RegisterPage.css'

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند.')
      return
    }

    const result = registerCustomer({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      role: form.role
    })

    if (result.success) {
      if (form.role === 'partner') {
        alert('درخواست همکاری شما ثبت شد. پس از تأیید مدیریت می‌توانید وارد شوید.')
      } else {
        alert('ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.')
      }
      navigate('/login')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>ثبت‌نام در آسمان</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" placeholder="نام" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
            <input type="text" placeholder="نام خانوادگی" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
          </div>
          <input type="tel" placeholder="شماره تماس" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
          <input type="email" placeholder="ایمیل" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="رمز عبور" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <input type="password" placeholder="تکرار رمز عبور" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />

          {/* انتخاب نقش */}
          <div className="role-selector">
            <label>
              <input type="radio" name="role" value="customer" checked={form.role === 'customer'} onChange={e => setForm({...form, role: e.target.value})} />
              مشتری عادی
            </label>
            <label>
              <input type="radio" name="role" value="partner" checked={form.role === 'partner'} onChange={e => setForm({...form, role: e.target.value})} />
              همکار (نیاز به تأیید مدیریت)
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit">ثبت‌نام</button>
        </form>
        <p className="login-link">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link></p>
      </div>
    </div>
  )
}

export default RegisterPage
