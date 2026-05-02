import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../utils/storage'
import { getCurrentEmployee, isEmployeeAuthenticated } from '../utils/employeeAuth'
import { getCurrentCustomer, isCustomerAuthenticated } from '../utils/customerAuth'
import { isAuthenticated } from '../utils/auth'
import './CreateQuotePage.css'

const CreateQuotePage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null) // 'admin', 'employee', 'customer'
  
  // اطلاعات مشتری
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_mobile: '',
    customer_phone: '',
    customer_email: '',
    customer_economic_code: '',
    customer_postal_code: '',
    customer_address: ''
  })
  
  // اطلاعات فاکتور
  const [quoteInfo, setQuoteInfo] = useState({
    issue_date: new Date().toISOString().split('T')[0],
    expires_at: '',
    payment_terms: '',
    credit_duration: '',
    delivery_location: '',
    prepayment_amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    notes: ''
  })
  
  // آیتم‌های محصول
  const [items, setItems] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  
  // جستجوی محصولات
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.productCode && p.productCode.toLowerCase().includes(productSearch.toLowerCase()))
  )
  
  useEffect(() => {
    // چک کردن نوع کاربر
    const adminLoggedIn = isAuthenticated()
    const employeeLoggedIn = isEmployeeAuthenticated()
    const customerLoggedIn = isCustomerAuthenticated()
    
    if (adminLoggedIn) {
      setUserType('admin')
      setUser({ id: null, name: 'ادمین' })
    } else if (employeeLoggedIn) {
      const emp = getCurrentEmployee()
      if (emp) {
        setUserType('employee')
        setUser(emp)
      } else {
        navigate('/login')
        return
      }
    } else if (customerLoggedIn) {
      // مشتری عادی هم می‌تونه درخواست بده؟ بعداً
      const cust = getCurrentCustomer()
      if (cust) {
        setUserType('customer')
        setUser(cust)
      } else {
        navigate('/login')
        return
      }
    } else {
      navigate('/login')
      return
    }
    
    loadProducts()
  }, [])
  
  const loadProducts = async () => {
    const prods = await getProducts()
    setProducts(prods)
  }
  
  const handleCustomerChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }
  
  const handleQuoteChange = (e) => {
    setQuoteInfo({
      ...quoteInfo,
      [e.target.name]: e.target.value
    })
  }
  
  const addItem = (product) => {
    const existing = items.find(i => i.product_id === product.id)
    if (existing) {
      setItems(items.map(i => 
        i.product_id === product.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          price: product.partnerPrice || product.price,
          unit: 'متر مربع',
          discount_percent: 0,
          tax_percent: 0
        }
      ])
    }
    setShowProductModal(false)
    setProductSearch('')
  }
  
  const removeItem = (index) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }
  
  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = quoteInfo.discount_amount || 0
    const tax = quoteInfo.tax_amount || 0
    return subtotal - discount + tax
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!customerInfo.customer_name || !customerInfo.customer_mobile) {
      alert('لطفاً نام و شماره موبایل مشتری را وارد کنید')
      return
    }
    
    if (items.length === 0) {
      alert('لطفاً حداقل یک محصول اضافه کنید')
      return
    }
    
    setLoading(true)
    
    try {
      const quoteData = {
        ...customerInfo,
        ...quoteInfo,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          discount_percent: item.discount_percent,
          tax_percent: item.tax_percent
        })),
        created_by: user?.id || null
      }
      
      console.log('Sending quote data:', quoteData)
      
      const res = await fetch('http://localhost:5003/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        alert('پیش‌فاکتور با موفقیت ایجاد شد')
        // بر اساس نوع کاربر به صفحه مناسب برمی‌گرده
        if (userType === 'admin') {
          navigate('/admin/quotes-list')
        } else {
          navigate('/employee/quotes')
        }
      } else {
        alert('خطا: ' + (data.error || 'مشخص نیست'))
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('خطا در ایجاد پیش‌فاکتور')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="create-quote-page">
      <div className="container">
        <h1>ایجاد پیش‌فاکتور جدید</h1>
        
        <form onSubmit={handleSubmit}>
          {/* اطلاعات مشتری */}
          <div className="form-section">
            <h2>اطلاعات مشتری</h2>
            <div className="form-row">
              <div className="form-group">
                <label>نام مشتری *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={customerInfo.customer_name}
                  onChange={handleCustomerChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>شماره موبایل *</label>
                <input
                  type="tel"
                  name="customer_mobile"
                  value={customerInfo.customer_mobile}
                  onChange={handleCustomerChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>تلفن ثابت</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={customerInfo.customer_phone}
                  onChange={handleCustomerChange}
                />
              </div>
              <div className="form-group">
                <label>ایمیل</label>
                <input
                  type="email"
                  name="customer_email"
                  value={customerInfo.customer_email}
                  onChange={handleCustomerChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>کد اقتصادی</label>
                <input
                  type="text"
                  name="customer_economic_code"
                  value={customerInfo.customer_economic_code}
                  onChange={handleCustomerChange}
                />
              </div>
              <div className="form-group">
                <label>کد پستی</label>
                <input
                  type="text"
                  name="customer_postal_code"
                  value={customerInfo.customer_postal_code}
                  onChange={handleCustomerChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>آدرس</label>
              <textarea
                name="customer_address"
                value={customerInfo.customer_address}
                onChange={handleCustomerChange}
                rows="2"
              />
            </div>
          </div>
          
          {/* اطلاعات فاکتور */}
          <div className="form-section">
            <h2>اطلاعات فاکتور</h2>
            <div className="form-row">
              <div className="form-group">
                <label>تاریخ صدور</label>
                <input
                  type="date"
                  name="issue_date"
                  value={quoteInfo.issue_date}
                  onChange={handleQuoteChange}
                />
              </div>
              <div className="form-group">
                <label>تاریخ اعتبار</label>
                <input
                  type="date"
                  name="expires_at"
                  value={quoteInfo.expires_at}
                  onChange={handleQuoteChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>شرایط فروش</label>
                <select name="payment_terms" value={quoteInfo.payment_terms} onChange={handleQuoteChange}>
                  <option value="">انتخاب کنید</option>
                  <option value="نقدی">نقدی</option>
                  <option value="غیرنقدی">غیرنقدی</option>
                  <option value="اقساط">اقساط</option>
                </select>
              </div>
              <div className="form-group">
                <label>مدت اعتبار</label>
                <input
                  type="text"
                  name="credit_duration"
                  placeholder="مثال: 30 روز"
                  value={quoteInfo.credit_duration}
                  onChange={handleQuoteChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>محل تحویل</label>
              <input
                type="text"
                name="delivery_location"
                value={quoteInfo.delivery_location}
                onChange={handleQuoteChange}
              />
            </div>
          </div>
          
          {/* آیتم‌های محصول */}
          <div className="form-section">
            <h2>محصولات</h2>
            <button type="button" className="btn-add-product" onClick={() => setShowProductModal(true)}>
              + افزودن محصول
            </button>
            
            {items.length > 0 && (
              <div className="items-table">
                <table className="items-table-inner">
                  <thead>
                    <tr>
                      <th>ردیف</th>
                      <th>نام محصول</th>
                      <th>تعداد</th>
                      <th>قیمت واحد</th>
                      <th>واحد</th>
                      <th>تخفیف %</th>
                      <th>مالیات %</th>
                      <th>جمع</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.product_name}</td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                            style={{ width: '120px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            style={{ width: '100px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.discount_percent}
                            onChange={(e) => updateItem(index, 'discount_percent', parseInt(e.target.value) || 0)}
                            style={{ width: '70px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.tax_percent}
                            onChange={(e) => updateItem(index, 'tax_percent', parseInt(e.target.value) || 0)}
                            style={{ width: '70px' }}
                          />
                        </td>
                        <td>{(item.quantity * item.price).toLocaleString()} تومان</td>
                        <td>
                          <button type="button" className="btn-remove" onClick={() => removeItem(index)}>✖</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'left' }}>جمع کل:</td>
                      <td>{calculateSubtotal().toLocaleString()} تومان</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          
          {/* مبالغ نهایی */}
          <div className="form-section">
            <h2>مبالغ نهایی</h2>
            <div className="form-row">
              <div className="form-group">
                <label>تخفیف کل (تومان)</label>
                <input
                  type="number"
                  name="discount_amount"
                  value={quoteInfo.discount_amount}
                  onChange={handleQuoteChange}
                />
              </div>
              <div className="form-group">
                <label>مالیات (تومان)</label>
                <input
                  type="number"
                  name="tax_amount"
                  value={quoteInfo.tax_amount}
                  onChange={handleQuoteChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>پیش‌پرداخت (تومان)</label>
              <input
                type="number"
                name="prepayment_amount"
                value={quoteInfo.prepayment_amount}
                onChange={handleQuoteChange}
              />
            </div>
            <div className="total-amount">
              <span>مبلغ قابل پرداخت:</span>
              <strong>{calculateTotal().toLocaleString()} تومان</strong>
            </div>
          </div>
          
          {/* توضیحات */}
          <div className="form-section">
            <h2>توضیحات اضافه</h2>
            <textarea
              name="notes"
              value={quoteInfo.notes}
              onChange={handleQuoteChange}
              rows="4"
              placeholder="توضیحات اضافی..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              انصراف
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت پیش‌فاکتور'}
            </button>
          </div>
        </form>
        
        {/* مودال انتخاب محصول */}
        {showProductModal && (
          <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>انتخاب محصول</h3>
                <button className="modal-close" onClick={() => setShowProductModal(false)}>✖</button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  placeholder="جستجوی محصول..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="product-search"
                />
                <div className="product-list">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-item" onClick={() => addItem(product)}>
                      <div className="product-name">{product.name}</div>
                      <div className="product-code">{product.productCode}</div>
                      <div className="product-price">
                        {(product.partnerPrice || product.price).toLocaleString()} تومان
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="no-products">محصولی یافت نشد</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateQuotePage
