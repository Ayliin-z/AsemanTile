// frontend/src/components/forms/PartnerRegisterForm.jsx
import { useState } from 'react';
import './PartnerRegisterForm.css';

const PartnerRegisterForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    city: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setLocalError('نام خود را وارد کنید');
      return false;
    }
    if (!formData.mobile) {
      setLocalError('شماره موبایل را وارد کنید');
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
    if (!formData.companyName.trim()) {
      setLocalError('نام شرکت را وارد کنید');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit({
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      city: formData.city,
      address: formData.address
    });
  };

  return (
    <form className="partner-register-form" onSubmit={handleSubmit}>
      <h2>ثبت‌نام همکار</h2>
      <p className="form-description">
        با ثبت‌نام به عنوان همکار، از قیمت‌های ویژه و مزایای اختصاصی بهره‌مند شوید.
        درخواست شما پس از بررسی توسط مدیریت تأیید می‌شود.
      </p>
      
      {(error || localError) && (
        <div className="form-error">{error || localError}</div>
      )}
      
      <div className="form-section">
        <h4>اطلاعات شخصی</h4>
        
        <div className="form-group">
          <label>نام و نام خانوادگی *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="نام خود را وارد کنید"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>شماره موبایل *</label>
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
            <label>ایمیل *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>رمز عبور *</label>
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
            <label>تکرار رمز عبور *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>اطلاعات شرکت</h4>

        <div className="form-group">
          <label>نام شرکت *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="نام شرکت خود را وارد کنید"
            required
          />
        </div>

        <div className="form-group">
          <label>شهر</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="شیراز، تهران، ..."
          />
        </div>

        <div className="form-group">
          <label>آدرس</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            placeholder="آدرس کامل دفتر یا انبار"
          />
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? 'در حال ثبت...' : 'ثبت درخواست همکاری'}
      </button>
    </form>
  );
};

export default PartnerRegisterForm;
