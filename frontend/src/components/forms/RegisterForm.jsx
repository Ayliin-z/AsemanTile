// frontend/src/components/forms/RegisterForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegisterForm.css';

const RegisterForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setLocalError('نام خود را وارد کنید');
      return false;
    }
    if (!formData.lastName.trim()) {
      setLocalError('نام خانوادگی خود را وارد کنید');
      return false;
    }
    if (!formData.mobile) {
      setLocalError('شماره موبایل را وارد کنید');
      return false;
    }
    if (formData.mobile.length < 10) {
      setLocalError('شماره موبایل معتبر نیست');
      return false;
    }
    if (!formData.email) {
      setLocalError('ایمیل را وارد کنید');
      return false;
    }
    if (!formData.password) {
      setLocalError('رمز عبور را وارد کنید');
      return false;
    }
    if (formData.password.length < 4) {
      setLocalError('رمز عبور باید حداقل ۴ کاراکتر باشد');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('رمز عبور و تکرار آن مطابقت ندارند');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit({
      name: `${formData.firstName} ${formData.lastName}`,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>ثبت‌نام در آسمان</h2>
      
      {(error || localError) && (
        <div className="form-error">{error || localError}</div>
      )}
      
      <div className="form-row">
        <div className="form-group">
          <label>نام</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="علی"
            required
          />
        </div>
        <div className="form-group">
          <label>نام خانوادگی</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="رضایی"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>شماره موبایل</label>
        <input
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="09123456789"
          required
        />
      </div>

      <div className="form-group">
        <label>ایمیل</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>رمز عبور</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>تکرار رمز عبور</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>نوع حساب</label>
        <div className="role-selector">
          <label className="role-option">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={formData.role === 'customer'}
              onChange={handleChange}
            />
            <span>👤 مشتری عادی</span>
          </label>
          <label className="role-option">
            <input
              type="radio"
              name="role"
              value="partner"
              checked={formData.role === 'partner'}
              onChange={handleChange}
            />
            <span>🤝 همکار (نیاز به تأیید)</span>
          </label>
        </div>
      </div>

      <button type="submit" className="btn-register" disabled={isLoading}>
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>

      <div className="form-footer">
        <Link to="/login">قبلاً ثبت‌نام کرده‌اید؟ ورود</Link>
      </div>
    </form>
  );
};

export default RegisterForm;
