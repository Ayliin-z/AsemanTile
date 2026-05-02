// frontend/src/components/forms/PasswordForm.jsx
import { useState } from 'react';
import './PasswordForm.css';

const PasswordForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setLocalError('رمز عبور فعلی را وارد کنید');
      return false;
    }
    if (!formData.newPassword) {
      setLocalError('رمز عبور جدید را وارد کنید');
      return false;
    }
    if (formData.newPassword.length < 4) {
      setLocalError('رمز عبور جدید باید حداقل ۴ کاراکتر باشد');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    });
  };

  return (
    <form className="password-form" onSubmit={handleSubmit}>
      <h3>تغییر رمز عبور</h3>
      
      {(error || localError) && (
        <div className="form-error">{error || localError}</div>
      )}
      
      <div className="form-group">
        <label>رمز عبور فعلی</label>
        <div className="password-wrapper">
          <input
            type={showPasswords.old ? 'text' : 'password'}
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => togglePassword('old')}
          >
            {showPasswords.old ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>رمز عبور جدید</label>
        <div className="password-wrapper">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => togglePassword('new')}
          >
            {showPasswords.new ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>تکرار رمز عبور جدید</label>
        <div className="password-wrapper">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => togglePassword('confirm')}
          >
            {showPasswords.confirm ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </button>
      </div>
    </form>
  );
};

export default PasswordForm;
