// frontend/src/components/forms/ContactForm.jsx
import { useState } from 'react';
import './ContactForm.css';

const ContactForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    city: '',
    area_m2: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateMobile = (mobile) => {
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return cleaned.length === 11;
    }
    return cleaned.length === 10;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'نام خود را وارد کنید';
    if (!formData.mobile) newErrors.mobile = 'شماره موبایل را وارد کنید';
    else if (!validateMobile(formData.mobile)) newErrors.mobile = 'شماره موبایل معتبر نیست';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>فرم تماس با ما</h3>
      <p className="form-description">
        فرم زیر را پر کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند.
      </p>

      <div className="form-group">
        <label>نام و نام خانوادگی *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="نام خود را وارد کنید"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>شماره موبایل *</label>
        <input
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="09123456789"
          className={errors.mobile ? 'error' : ''}
        />
        {errors.mobile && <span className="error-text">{errors.mobile}</span>}
      </div>

      <div className="form-row">
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
          <label>متراژ (متر مربع)</label>
          <input
            type="number"
            name="area_m2"
            value={formData.area_m2}
            onChange={handleChange}
            placeholder="مثلاً 120"
          />
        </div>
      </div>

      <div className="form-group">
        <label>پیام شما</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          placeholder="توضیحات بیشتر..."
        />
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? 'در حال ارسال...' : 'ارسال درخواست'}
      </button>
    </form>
  );
};

export default ContactForm;
