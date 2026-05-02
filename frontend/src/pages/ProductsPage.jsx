import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../utils/storage'
import { getCurrentUserRole } from '../utils/customerAuth'
import { getSiteSettings } from '../utils/siteSettings'
import './ProductsPage.css'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedClayType, setSelectedClayType] = useState('')
  const [selectedGlaze, setSelectedGlaze] = useState('')
  const [selectedUsage, setSelectedUsage] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [discountOnly, setDiscountOnly] = useState(false)
  const [sortBy, setSortBy] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [salesMode, setSalesMode] = useState('cart')
  const itemsPerPage = 12

  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')
  const userRole = getCurrentUserRole()

  useEffect(() => {
    const loadData = async () => {
      const prods = await getProducts()
      setProducts(prods)
      const settings = await getSiteSettings()
      setSalesMode(settings.salesMode)
    }
    loadData()
  }, [])

  // لیست مقادیر منحصربفرد برای فیلترها
  const sizeList = useMemo(() => {
    const sizes = [...new Set(products.map(p => p.size).filter(Boolean))]
    const order = ['30*30', '30*60', '40*40', '60*60', '60*120', '80*80', '120*20', 'اسلب']
    return sizes.sort((a, b) => {
      const indexA = order.indexOf(a)
      const indexB = order.indexOf(b)
      if (indexA === -1 && indexB === -1) return a.localeCompare(b)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [products])

  const clayTypeList = useMemo(() => {
    return [...new Set(products.map(p => p.glazeType).filter(Boolean))]
  }, [products])

  const glazeList = useMemo(() => {
    return [...new Set(products.map(p => p.glaze).filter(Boolean))]
  }, [products])

  const usageList = useMemo(() => {
    return [...new Set(products.map(p => p.suitableFor).filter(Boolean))]
  }, [products])

  const colorList = useMemo(() => {
    return [...new Set(products.map(p => p.color).filter(Boolean))]
  }, [products])

  // فیلتر بر اساس نقش کاربر
  const audienceFiltered = useMemo(() => {
    return products.filter(p => {
      if (!p.audience || p.audience === 'all') return true
      if (p.audience === 'customers' && (userRole === 'customer' || userRole === 'guest')) return true
      if (p.audience === 'partners' && userRole === 'partner') return true
      return false
    })
  }, [products, userRole])

  // اعمال همه فیلترها
  const filteredProducts = useMemo(() => {
    return audienceFiltered.filter(p => {
      const matchesSearch = searchTerm
        ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.productCode && p.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
        : true
      
      const matchesSize = !selectedSize || p.size === selectedSize
      const matchesClayType = !selectedClayType || p.glazeType === selectedClayType
      const matchesGlaze = !selectedGlaze || p.glaze === selectedGlaze
      const matchesUsage = !selectedUsage || p.suitableFor === selectedUsage
      const matchesColor = !selectedColor || p.color === selectedColor
      const matchesDiscount = !discountOnly || p.discount > 0
      
      let matchesTag = true
      if (tagParam) {
        matchesTag = p.tags && p.tags.includes(tagParam)
      }
      
      return matchesSearch && matchesSize && matchesClayType && matchesGlaze && 
             matchesUsage && matchesColor && matchesDiscount && matchesTag
    })
  }, [audienceFiltered, searchTerm, selectedSize, selectedClayType, selectedGlaze, 
      selectedUsage, selectedColor, discountOnly, tagParam])

  // مرتب‌سازی
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => {
          const priceA = (userRole === 'partner' && a.partnerPrice) ? a.partnerPrice : a.price
          const priceB = (userRole === 'partner' && b.partnerPrice) ? b.partnerPrice : b.price
          return priceA - priceB
        })
      case 'price-desc':
        return arr.sort((a, b) => {
          const priceA = (userRole === 'partner' && a.partnerPrice) ? a.partnerPrice : a.price
          const priceB = (userRole === 'partner' && b.partnerPrice) ? b.partnerPrice : b.price
          return priceB - priceA
        })
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'name-asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return arr
    }
  }, [filteredProducts, sortBy, userRole])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedProducts.slice(start, start + itemsPerPage)
  }, [sortedProducts, currentPage])

  const getDisplayPrice = (product) => {
    if (userRole === 'partner' && product.partnerPrice) return product.partnerPrice
    return product.price
  }

  const getFinalPrice = (product) => {
    const displayPrice = getDisplayPrice(product)
    return product.discount
      ? Math.round(displayPrice * (1 - product.discount / 100))
      : displayPrice
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedSize('')
    setSelectedClayType('')
    setSelectedGlaze('')
    setSelectedUsage('')
    setSelectedColor('')
    setDiscountOnly(false)
    setSortBy('')
    setCurrentPage(1)
  }

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0]
    if (product.image) return product.image
    return 'https://picsum.photos/300/300?random=' + product.id
  }

  const activeFilterCount = [selectedSize, selectedClayType, selectedGlaze, selectedUsage, selectedColor, discountOnly, searchTerm].filter(Boolean).length

  return (
    <div className="products-page">
      <Link to="/" className="back-link">← بازگشت به خانه</Link>

      <div className="shop-header">
        <h1 className="shop-title">
          فروشگاه
          {tagParam && <span className="tag-filter-badge"> : {tagParam}</span>}
        </h1>
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا کد محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn" aria-label="جستجو">🔍</button>
        </div>
      </div>

      <div className="products-layout">
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>فیلتر محصولات</h3>
            {activeFilterCount > 0 && (
              <button className="clear-filters-btn" onClick={resetFilters}>
                حذف همه فیلترها ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="sidebar-sort">
            <label htmlFor="sort-select">مرتب‌سازی:</label>
            <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">پیش‌فرض</option>
              <option value="price-asc">قیمت: کم به زیاد</option>
              <option value="price-desc">قیمت: زیاد به کم</option>
              <option value="name-asc">نام: الفبا</option>
              <option value="newest">جدیدترین</option>
            </select>
          </div>

          {/* فیلتر سایز */}
          {sizeList.length > 0 && (
            <div className="filter-group">
              <label>📏 سایز</label>
              <div className="filter-buttons">
                <button className={`filter-btn ${selectedSize === '' ? 'active' : ''}`} onClick={() => setSelectedSize('')}>همه</button>
                {sizeList.map(size => (
                  <button key={size} className={`filter-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر نوع خاک */}
          {clayTypeList.length > 0 && (
            <div className="filter-group">
              <label>🧱 نوع خاک</label>
              <div className="filter-buttons">
                <button className={`filter-btn ${selectedClayType === '' ? 'active' : ''}`} onClick={() => setSelectedClayType('')}>همه</button>
                {clayTypeList.map(clay => (
                  <button key={clay} className={`filter-btn ${selectedClayType === clay ? 'active' : ''}`} onClick={() => setSelectedClayType(clay)}>
                    {clay === 'خاک سفید' && '⚪'} {clay === 'خاک قرمز' && '🔴'} {clay === 'پرسلان' && '💎'} {clay}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر نوع لعاب */}
          {glazeList.length > 0 && (
            <div className="filter-group">
              <label>✨ نوع لعاب</label>
              <div className="filter-buttons">
                <button className={`filter-btn ${selectedGlaze === '' ? 'active' : ''}`} onClick={() => setSelectedGlaze('')}>همه</button>
                {glazeList.map(glaze => (
                  <button key={glaze} className={`filter-btn ${selectedGlaze === glaze ? 'active' : ''}`} onClick={() => setSelectedGlaze(glaze)}>
                    {glaze}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر کاربرد */}
          {usageList.length > 0 && (
            <div className="filter-group">
              <label>📍 کاربرد</label>
              <div className="filter-buttons">
                <button className={`filter-btn ${selectedUsage === '' ? 'active' : ''}`} onClick={() => setSelectedUsage('')}>همه</button>
                {usageList.map(usage => (
                  <button key={usage} className={`filter-btn ${selectedUsage === usage ? 'active' : ''}`} onClick={() => setSelectedUsage(usage)}>
                    {usage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر رنگ */}
          {colorList.length > 0 && (
            <div className="filter-group">
              <label>🎨 رنگ</label>
              <div className="filter-buttons">
                <button className={`filter-btn ${selectedColor === '' ? 'active' : ''}`} onClick={() => setSelectedColor('')}>همه</button>
                {colorList.map(color => (
                  <button key={color} className={`filter-btn ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* فیلتر تخفیف‌دار */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => setDiscountOnly(e.target.checked)}
              />
              🔥 فقط محصولات تخفیف‌دار
            </label>
          </div>
        </aside>

        <div className="products-grid-section">
          {paginatedProducts.length === 0 ? (
            <div className="no-products">
              <p>محصولی با این فیلترها یافت نشد.</p>
              <button className="reset-filter-btn" onClick={resetFilters}>حذف فیلترها</button>
            </div>
          ) : (
            <>
              <div className="results-info">
                <span>{sortedProducts.length} محصول یافت شد</span>
              </div>
              <div className="products-grid">
                {paginatedProducts.map(product => {
                  const displayPrice = getDisplayPrice(product)
                  const finalPrice = getFinalPrice(product)
                  return (
                    <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                      <div className="product-card">
                        <img src={getProductImage(product)} alt={product.name} />
                        {product.discount > 0 && (
                          <span className="product-discount-badge">{product.discount}%</span>
                        )}
                        <h3>{product.name}</h3>
                        
                        {/* کد محصول - فقط برای لاگین شده‌ها */}
                        {(userRole === 'customer' || userRole === 'partner') && (
                          <p className="product-code">کد: {product.productCode}</p>
                        )}
                        
                        {salesMode === 'cart' && (
                          <>
                            {product.discount > 0 && (
                              <p className="old-price">{displayPrice.toLocaleString()} تومان</p>
                            )}
                            <p className="product-price">{finalPrice.toLocaleString()} تومان</p>
                          </>
                        )}
                        
                        {/* موجودی - فقط برای همکاران */}
                        {userRole === 'partner' && (
                          <p className={`product-stock ${product.stock < 50 ? 'low-stock' : ''}`}>
                            موجودی: {product.stock.toLocaleString()} متر مربع
                          </p>
                        )}
                        
                        <div className="product-badges">
                          {product.size && <span className="product-badge">📏 {product.size}</span>}
                          {product.glazeType && <span className="product-badge">🧱 {product.glazeType}</span>}
                          {product.glaze && <span className="product-badge">✨ {product.glaze}</span>}
                          {product.color && <span className="product-badge">🎨 {product.color}</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>❮</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button key={pageNum} className={pageNum === currentPage ? 'active' : ''} onClick={() => goToPage(pageNum)}>
                        {pageNum}
                      </button>
                    )
                  })}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>❯</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
