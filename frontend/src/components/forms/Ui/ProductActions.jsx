// frontend/src/components/ui/ProductActions.jsx
import { useState } from 'react';
import './ProductActions.css';

const ProductActions = ({ 
  product, 
  salesMode = 'cart', 
  onAddToCart, 
  className = '',
  showQuantity = false 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    setIsLoading(true);
    try {
      await onAddToCart(product, quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 999)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // حالت تماس (نمایش شماره تلفن)
  if (salesMode === 'contact') {
    return (
      <div className={`product-actions ${className}`}>
        <a 
          href="tel:07143333333" 
          className="btn-contact"
        >
          📞 تماس بگیرید
        </a>
        <a 
          href="https://wa.me/98910870698" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          💬 واتساپ
        </a>
      </div>
    );
  }

  // حالت سبد خرید
  return (
    <div className={`product-actions ${className}`}>
      {showQuantity && (
        <div className="quantity-selector">
          <button 
            onClick={decrementQuantity} 
            disabled={quantity <= 1}
            className="qty-btn"
          >
            -
          </button>
          <span className="qty-value">{quantity}</span>
          <button 
            onClick={incrementQuantity} 
            disabled={quantity >= (product.stock || 999)}
            className="qty-btn"
          >
            +
          </button>
          {product.stock && (
            <span className="stock-info">موجودی: {product.stock}</span>
          )}
        </div>
      )}
      
      <button 
        onClick={handleAddToCart}
        disabled={isLoading || (product.stock === 0)}
        className="btn-add-to-cart"
      >
        {isLoading ? (
          <span className="loading-spinner-small"></span>
        ) : (
          <>
            🛒 {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
          </>
        )}
      </button>
    </div>
  );
};

export default ProductActions;
