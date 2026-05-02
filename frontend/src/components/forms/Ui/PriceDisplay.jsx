// frontend/src/components/ui/PriceDisplay.jsx
import './PriceDisplay.css';

const PriceDisplay = ({ 
  price, 
  finalPrice, 
  discount = 0, 
  size = 'medium',
  showDiscount = true,
  className = ''
}) => {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  const hasDiscount = discount > 0 && finalPrice !== price;

  return (
    <div className={`price-display price-${size} ${className}`}>
      {hasDiscount && showDiscount && (
        <div className="price-old-wrapper">
          <span className="price-old">{formatPrice(price)}</span>
          <span className="discount-badge">{discount}%</span>
        </div>
      )}
      <div className="price-current">
        <span className="price-value">{formatPrice(finalPrice)}</span>
        <span className="price-currency">تومان</span>
      </div>
      {hasDiscount && showDiscount && (
        <div className="price-saved">
          صرفه‌جویی: {formatPrice(price - finalPrice)} تومان
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
