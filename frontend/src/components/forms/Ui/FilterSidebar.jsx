// frontend/src/components/ui/FilterSidebar.jsx
import { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  categories = [],
  manufacturers = [],
  sizes = [],
  colors = [],
  priceRange = { min: 0, max: 1000000 }
}) => {
  const [priceMin, setPriceMin] = useState(filters.priceMin || priceRange.min);
  const [priceMax, setPriceMax] = useState(filters.priceMax || priceRange.max);

  const handlePriceChange = () => {
    onFilterChange({ priceMin, priceMax });
  };

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories?.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...(filters.categories || []), category];
    onFilterChange({ categories: newCategories });
  };

  const handleManufacturerToggle = (manufacturer) => {
    const newManufacturers = filters.manufacturers?.includes(manufacturer)
      ? filters.manufacturers.filter(m => m !== manufacturer)
      : [...(filters.manufacturers || []), manufacturer];
    onFilterChange({ manufacturers: newManufacturers });
  };

  const handleDiscountToggle = () => {
    onFilterChange({ hasDiscount: !filters.hasDiscount });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>فیلتر محصولات</h3>
        <button onClick={onReset} className="filter-reset">
          حذف همه
        </button>
      </div>

      {/* محدوده قیمت */}
      <div className="filter-group">
        <label>محدوده قیمت (تومان)</label>
        <div className="price-range">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            onBlur={handlePriceChange}
            placeholder="حداقل"
            className="price-input"
          />
          <span>تا</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            onBlur={handlePriceChange}
            placeholder="حداکثر"
            className="price-input"
          />
        </div>
      </div>

      {/* دسته‌بندی */}
      {categories.length > 0 && (
        <div className="filter-group">
          <label>دسته‌بندی</label>
          <div className="filter-options">
            {categories.map(cat => (
              <label key={cat} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* شرکت سازنده */}
      {manufacturers.length > 0 && (
        <div className="filter-group">
          <label>شرکت سازنده</label>
          <div className="filter-options">
            {manufacturers.map(m => (
              <label key={m} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.manufacturers?.includes(m)}
                  onChange={() => handleManufacturerToggle(m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* سایز */}
      {sizes.length > 0 && (
        <div className="filter-group">
          <label>سایز</label>
          <div className="filter-options filter-buttons">
            {sizes.map(sz => (
              <button
                key={sz}
                className={`filter-btn ${filters.sizes?.includes(sz) ? 'active' : ''}`}
                onClick={() => {
                  const newSizes = filters.sizes?.includes(sz)
                    ? filters.sizes.filter(s => s !== sz)
                    : [...(filters.sizes || []), sz];
                  onFilterChange({ sizes: newSizes });
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* رنگ‌ها */}
      {colors.length > 0 && (
        <div className="filter-group">
          <label>رنگ</label>
          <div className="filter-options">
            {colors.map(c => (
              <label key={c} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.colors?.includes(c)}
                  onChange={() => {
                    const newColors = filters.colors?.includes(c)
                      ? filters.colors.filter(col => col !== c)
                      : [...(filters.colors || []), c];
                    onFilterChange({ colors: newColors });
                  }}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* فقط تخفیف‌دار */}
      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasDiscount || false}
            onChange={handleDiscountToggle}
          />
          <span>فقط محصولات تخفیف‌دار</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
