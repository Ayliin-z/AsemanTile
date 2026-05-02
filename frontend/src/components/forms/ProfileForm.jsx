// frontend/src/components/forms/ProfileForm.jsx
import { useState, useEffect } from 'react';
import './ProfileForm.css';

const ProfileForm = ({ user, onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    mobile: '',
    email: ''
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || [];
      setFormData({
        name: user.name || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        mobile: user.mobile || '',
        email: user.email || ''
      });
    }
  }, [user]);

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
    if (!formData.email) {
      setLocalError('ایمیل را وارد کنید');
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
      email: formData.email
    });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h3>اطلاعات حساب کاربری</h3>
      
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
            placeholder="نام"
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
            placeholder="نام خانوادگی"
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
          disabled
        />
        <small>شماره موبایل قابل تغییر نیست</small>
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

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
