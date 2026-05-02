import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getProductById, getProducts } from '../utils/storage'
import { getCurrentUserRole } from '../utils/customerAuth'
import { getSiteSettings } from '../utils/siteSettings'
import './ProductPage.css'

const ProductPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [salesMode, setSalesMode] = useState('cart')
  const [loading, setLoading] = useState(true)
  const userRole = getCurrentUserRole()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const found = await getProductById(parseInt(id))
        if (found) {
          try {
            const { getProductTemplates, generateProductDescription } = await import('../utils/productTemplates.js')
            const templates = await getProductTemplates()
            const autoDescription = generateProductDescription(found, templates)
            
            if (!found.fullDescription || found.fullDescription === '') {
              found.fullDescription = autoDescription
            }
          } catch (err) {
            console.error('Error loading templates:', err)
          }
          setProduct(found)
          await loadSimilarProducts(found)
        }
        const settings = await getSiteSettings()
        setSalesMode(settings.salesMode)
      } catch (err) {
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const loadSimilarProducts = async (currentProduct) => {
    try {
      const allProducts = await getProducts()
      const similar = allProducts.filter(p => {
        if (p.id === currentProduct.id) return false
        if (currentProduct.glaze && p.glaze && p.glaze === currentProduct.glaze) return true
        if (currentProduct.color && p.color && p.color === currentProduct.color) return true
        if (currentProduct.size && p.size && p.size === currentProduct.size) return true
        return false
      })
      setSimilarProducts(similar.slice(0, 4))
    } catch (err) {
      console.error('Error loading similar products:', err)
      setSimilarProducts([])
    }
  }

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری محصول...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>محصول یافت نشد</h2>
        <Link to="/">بازگشت به صفحه اصلی</Link>
      </div>
    )
  }

  const isAllowed = () => {
    if (!product.audience || product.audience === 'all') return true
    if (product.audience === 'customers' && (userRole === 'customer' || userRole === 'guest')) return true
    if (product.audience === 'partners' && userRole === 'partner') return true
    return false
  }

  if (!isAllowed()) {
    return <Navigate to="/" replace />
  }

  const displayPrice = (userRole === 'partner' && product.partnerPrice)
    ? product.partnerPrice
    : product.price

  const finalPrice = product.discount
    ? Math.round(displayPrice * (1 - product.discount / 100))
    : displayPrice

  const getImageUrl = (img) => {
    if (img && img.startsWith('http')) return img
    if (img) return img
    return 'https://picsum.photos/400/400?random=' + product.id
  }

  const images = product.images?.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ['https://picsum.photos/400/400?random=' + product.id]

  const getSimilarProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0]
    return 'https://picsum.photos/150/150?random=' + product.id
  }

  const getSimilarProductPrice = (product) => {
    const dispPrice = (userRole === 'partner' && product.partnerPrice) ? product.partnerPrice : product.price
    return product.discount
      ? Math.round(dispPrice * (1 - product.discount / 100))
      : dispPrice
  }

  return (
    <div className="product-page">
      <div className="container">
        <Link to="/products" className="back-link">← بازگشت به محصولات</Link>

        <div className="product-layout">
          <div className="gallery-box">
            <div className="main-image-wrapper">
              <img 
                src={getImageUrl(images[selectedImage])} 
                alt={product.name} 
                className="main-image"
                onError={(e) => {
                  e.target.src = 'https://picsum.photos/400/400?random=' + product.id
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={getImageUrl(img)} alt={`تصویر ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="info-box">
            <h1 className="product-title">{product.name}</h1>
            
            {/* کد محصول - فقط برای لاگین شده‌ها */}
            {(userRole === 'customer' || userRole === 'partner') && (
              <div className="product-code-badge">
                <span>کد: {product.productCode || '—'}</span>
              </div>
            )}

            {product.grade && (
              <div className="product-grade">
                <span className="grade-label">درجه:</span>
                <span className="grade-value">{product.grade}</span>
              </div>
            )}

            {salesMode === 'cart' && (
              <div className="price-wrapper">
                {product.discount > 0 && (
                  <span className="old-price">{displayPrice.toLocaleString()} تومان</span>
                )}
                <span className="final-price">{finalPrice.toLocaleString()} تومان</span>
                {product.discount > 0 && (
                  <span className="discount-tag">{product.discount}% تخفیف</span>
                )}
              </div>
            )}

            <div className="specs-card">
              <h3>مشخصات فنی</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>درجه</th>
                    <td>{product.grade || '—'}</td>
                  </tr>
                  <tr>
                    <th>سایز</th>
                    <td>{product.size || '—'}</td>
                  </tr>
                  <tr>
                    <th>نوع لعاب</th>
                    <td>{product.glaze || '—'}</td>
                  </tr>
                  <tr>
                    <th>رنگ</th>
                    <td>{product.color || '—'}</td>
                  </tr>
                  <tr>
                    <th>نوع خاک</th>
                    <td>{product.glazeType || '—'}</td>
                  </tr>
                  
                  {/* موجودی - فقط برای همکاران */}
                  {userRole === 'partner' && (
                    <tr>
                      <th>متراژ موجودی</th>
                      <td className={product.stock < 50 ? 'low-stock' : ''}>
                        {product.stock !== undefined && product.stock !== null 
                          ? `${product.stock.toLocaleString()} متر مربع` 
                          : '—'}
                        {product.stock < 50 && product.stock > 0 && <span className="low-stock-badge"> موجودی محدود</span>}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
            </div>

            <div className="actions">
              {salesMode === 'cart' ? (
                <button 
                  className="btn-primary"
                  onClick={() => alert('برای ثبت سفارش با ما تماس بگیرید')}
                >
                  🛒 درخواست سفارش
                </button>
              ) : (
                <a
                  href="tel:07143333333"
                  className="btn-primary contact-btn"
                  style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                >
                  📞 برای ثبت سفارش تماس بگیرید
                </a>
              )}
            </div>
          </div>
        </div>

        {product.fullDescription && (
          <div className="full-description-box">
            <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
          </div>
        )}

        {/* محصولات مشابه */}
        {similarProducts.length > 0 && (
          <div className="similar-products">
            <h3>محصولات مشابه</h3>
            <div className="similar-products-grid">
              {similarProducts.map(similar => {
                const similarPrice = getSimilarProductPrice(similar)
                return (
                  <Link to={`/product/${similar.id}`} key={similar.id} className="similar-product-card">
                    <div className="similar-product-image">
                      <img src={getSimilarProductImage(similar)} alt={similar.name} />
                    </div>
                    <div className="similar-product-info">
                      <h4>{similar.name}</h4>
                      <div className="similar-badges">
                        <span className="similar-badge">📏 {similar.size || '-'}</span>
                        <span className="similar-badge">✨ {similar.glaze || '-'}</span>
                      </div>
                      {salesMode === 'cart' && (
                        <div className="similar-price">
                          {similar.discount > 0 && (
                            <span className="similar-old-price">{similarPrice.toLocaleString()} تومان</span>
                          )}
                          <span className="similar-new-price">{similarPrice.toLocaleString()} تومان</span>
                        </div>
                      )}
                    </div>
                    {similar.discount > 0 && (
                      <span className="similar-discount-badge">{similar.discount}%</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductPage
