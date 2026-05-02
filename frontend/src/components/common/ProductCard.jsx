// frontend/src/components/common/ProductCard.jsx
import { Link } from 'react-router-dom';
import PriceDisplay from '../ui/PriceDisplay';
import ProductActions from '../ui/ProductActions';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, salesMode = 'cart', userRole = 'guest' }) => {
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.image) return product.image;
    return `https://picsum.photos/300/200?random=${product.id}`;
  };

  const getDisplayPrice = () => {
    if (userRole === 'partner' && product.partnerPrice) return product.partnerPrice;
    return product.price;
  };

  const getFinalPrice = () => {
    const price = getDisplayPrice();
    return product.discount ? Math.round(price * (1 - product.discount / 100)) : price;
  };

  const getDiscountPercent = () => {
    const price = getDisplayPrice();
    if (!product.discount) return 0;
    return Math.round((product.discount / 100) * 100);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={getImageUrl()} alt={product.name} loading="lazy" />
          {product.discount > 0 && (
            <span className="discount-badge">{getDiscountPercent()}%</span>
          )}
          {product.tags?.includes('جدید') && (
            <span className="new-badge">جدید</span>
          )}
        </div>
        
        <h3 className="product-title">{product.name}</h3>
        
        <PriceDisplay 
          price={getDisplayPrice()}
          finalPrice={getFinalPrice()}
          discount={product.discount}
          size="small"
        />
        
        {product.size && (
          <p className="product-size">سایز: {product.size}</p>
        )}
      </Link>
      
      <ProductActions 
        product={product}
        salesMode={salesMode}
        onAddToCart={onAddToCart}
        className="product-actions"
      />
    </div>
  );
};

export default ProductCard;
