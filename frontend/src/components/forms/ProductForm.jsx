// frontend/src/components/forms/ProductForm.jsx
import { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ initialData, onSubmit, onCancel, isLoading = false, brands = [], tags = [] }) => {
  const [formData, setFormData] = useState({
    productCode: '',
    grade: '',
    name: '',
    price: '',
    partnerPrice: '',
    discount: '',
    stock: '',
    description: '',
    manufacturer: '',
    glazeType: '',
    suitableFor: '',
    category: '',
    size: '',
    glaze: '',
    color: '',
    images: '',
    fullDescription: '',
    tags: [],
    audience: 'all'
  });

  const [errors, setErrors] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productCode: initialData.productCode || '',
        grade: initialData.grade || '',
        name: initialData.name || '',
        price: initialData.price || '',
        partnerPrice: initialData.partnerPrice || '',
        discount: initialData.discount || '',
        stock: initialData.stock || '',
        description: initialData.description || '',
        manufacturer: initialData.manufacturer || '',
        glazeType: initialData.glazeType || '',
        suitableFor: initialData.suitableFor || '',
        category: initialData.category || '',
        size: initialData.size || '',
        glaze: initialData.glaze || '',
        color: initialData.color || '',
        images: initialData.images ? initialData.images.join(', ') : '',
        fullDescription: initialData.fullDescription || '',
        tags: initialData.tags || [],
        audience: initialData.audience || 'all'
      });
      setSelectedTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name) newErrors.name = 'نام محصول الزامی است';
    if (!formData.price) newErrors.price = 'قیمت محصول الزامی است';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const imagePreview = formData.images
    ? formData.images.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>کد محصول</label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleChange}
            placeholder="مثال: PRD-001"
          />
        </div>
        <div className="form-group">
          <label>درجه</label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="A, B, C"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>نام محصول *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="نام محصول"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>قیمت پایه (تومان) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>قیمت همکار (تومان)</label>
          <input
            type="number"
            name="partnerPrice"
            value={formData.partnerPrice}
            onChange={handleChange}
            placeholder="اختیاری"
          />
        </div>
        <div className="form-group">
          <label>تخفیف (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            placeholder="0-100"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>متراژ موجودی</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label>دسته‌بندی</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="کاشی، سرامیک، ..."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>شرکت سازنده</label>
          <select name="manufacturer" value={formData.manufacturer} onChange={handleChange}>
            <option value="">انتخاب کنید</option>
            {brands.map(brand => (
              <option key={brand.id || brand} value={brand.name || brand}>
                {brand.name || brand}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>نوع لعاب</label>
          <input
            type="text"
            name="glazeType"
            value={formData.glazeType}
            onChange={handleChange}
            placeholder="براق، مات، ..."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>سایز</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="60*60، 40*40، ..."
          />
        </div>
        <div className="form-group">
          <label>رنگ</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="سفید، کرم، طوسی، ..."
          />
        </div>
      </div>

      <div className="form-group">
        <label>توضیحات کوتاه</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="توضیحات مختصر محصول"
        />
      </div>

      <div className="form-group">
        <label>آدرس تصاویر (با کاما جدا کنید)</label>
        <input
          type="text"
          name="images"
          value={formData.images}
          onChange={handleChange}
          placeholder="/images/product1.jpg, /images/product2.jpg"
        />
        {imagePreview.length > 0 && (
          <div className="image-preview">
            {imagePreview.map((url, i) => (
              <img key={i} src={url} alt={`پیش‌نمایش ${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>تگ‌های محصول</label>
        <div className="tags-selector">
          {tags.map(tag => (
            <button
              key={tag.name || tag}
              type="button"
              className={`tag-btn ${selectedTags.includes(tag.name || tag) ? 'active' : ''}`}
              onClick={() => handleTagToggle(tag.name || tag)}
            >
              {tag.name || tag}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>مخاطب</label>
          <select name="audience" value={formData.audience} onChange={handleChange}>
            <option value="all">نمایش برای همه</option>
            <option value="customers">فقط مشتریان عادی</option>
            <option value="partners">فقط همکاران</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>توضیحات کامل (HTML مجاز)</label>
        <textarea
          name="fullDescription"
          value={formData.fullDescription}
          onChange={handleChange}
          rows="8"
          placeholder="توضیحات کامل محصول با امکان استفاده از تگ‌های HTML"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره...' : (initialData ? 'ویرایش محصول' : 'افزودن محصول')}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          انصراف
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
