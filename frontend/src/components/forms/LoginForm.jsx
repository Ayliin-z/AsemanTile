// frontend/src/components/forms/LoginForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.email, formData.password);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>ورود به حساب</h2>
      
      {error && <div className="form-error">{error}</div>}
      
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

      <button type="submit" className="btn-login" disabled={isLoading}>
        {isLoading ? 'در حال ورود...' : 'ورود'}
      </button>

      <div className="form-footer">
        <Link to="/register">حساب کاربری ندارید؟ ثبت‌نام</Link>
        <Link to="/forgot-password">رمز عبور خود را فراموش کرده‌اید؟</Link>
      </div>
    </form>
  );
};

export default LoginForm;
