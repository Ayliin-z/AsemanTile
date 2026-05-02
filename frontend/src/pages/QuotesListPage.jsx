import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './QuotesListPage.css'

const QuotesListPage = () => {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    customer_mobile: '',
    from_date: '',
    to_date: ''
  })

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)
    try {
      let url = 'http://localhost:5003/api/quotes'
      const params = []
      if (filter.status) params.push(`status=${filter.status}`)
      if (filter.customer_mobile) params.push(`customer_mobile=${filter.customer_mobile}`)
      if (filter.from_date) params.push(`from_date=${filter.from_date}`)
      if (filter.to_date) params.push(`to_date=${filter.to_date}`)
      if (params.length > 0) url += '?' + params.join('&')

      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setQuotes(data.data)
      } else {
        console.error('Error loading quotes:', data.error)
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    })
  }

  const applyFilter = () => {
    loadQuotes()
  }

  const resetFilter = () => {
    setFilter({
      status: '',
      customer_mobile: '',
      from_date: '',
      to_date: ''
    })
    setTimeout(() => loadQuotes(), 100)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'submitted': 'ثبت شده',
      'reviewing': 'در حال بررسی',
      'issued': 'صادر شده',
      'waiting_customer': 'در انتظار مشتری',
      'preparing': 'در حال آماده سازی',
      'completed': 'تکمیل شده',
      'final_confirmed': 'تایید نهایی',
      'cancelled': 'لغو شده'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      'submitted': 'status-submitted',
      'reviewing': 'status-reviewing',
      'issued': 'status-issued',
      'waiting_customer': 'status-waiting',
      'preparing': 'status-preparing',
      'completed': 'status-completed',
      'final_confirmed': 'status-final',
      'cancelled': 'status-cancelled'
    }
    return classMap[status] || ''
  }

  const viewQuote = (id) => {
    navigate(`/admin/quotes/${id}`)
  }

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0'
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fa-IR')
  }

  return (
    <div className="quotes-list-page">
      <div className="container">
        <div className="page-header">
          <h1>لیست پیش‌فاکتورها</h1>
          <button className="btn-create" onClick={() => navigate('/admin/create-quote')}>
            + ایجاد پیش‌فاکتور جدید
          </button>
        </div>

        {/* فیلترها */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>وضعیت</label>
              <select name="status" value={filter.status} onChange={handleFilterChange}>
                <option value="">همه</option>
                <option value="submitted">ثبت شده</option>
                <option value="reviewing">در حال بررسی</option>
                <option value="issued">صادر شده</option>
                <option value="waiting_customer">در انتظار مشتری</option>
                <option value="preparing">در حال آماده سازی</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>
            <div className="filter-group">
              <label>شماره موبایل مشتری</label>
              <input
                type="text"
                name="customer_mobile"
                placeholder="جستجو بر اساس موبایل..."
                value={filter.customer_mobile}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>از تاریخ</label>
              <input
                type="date"
                name="from_date"
                value={filter.from_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>تا تاریخ</label>
              <input
                type="date"
                name="to_date"
                value={filter.to_date}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn-filter" onClick={applyFilter}>جستجو</button>
            <button className="btn-reset" onClick={resetFilter}>حذف فیلترها</button>
          </div>
        </div>

        {/* لیست پیش‌فاکتورها */}
        {loading ? (
          <div className="loading-state">در حال بارگذاری...</div>
        ) : quotes.length === 0 ? (
          <div className="empty-state">
            <p>هیچ پیش‌فاکتوری یافت نشد</p>
            <button className="btn-create" onClick={() => navigate('/admin/create-quote')}>
              ایجاد اولین پیش‌فاکتور
            </button>
          </div>
        ) : (
          <div className="quotes-table-container">
            <table className="quotes-table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>تاریخ</th>
                  <th>نام مشتری</th>
                  <th>شماره موبایل</th>
                  <th>مبلغ کل</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id}>
                    <td>{quote.quote_number || `PF-${quote.id}`}</td>
                    <td>{formatDate(quote.issue_date)}</td>
                    <td>{quote.customer_name}</td>
                    <td>{quote.customer_mobile}</td>
                    <td>{formatNumber(quote.total_amount)} تومان</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(quote.status)}`}>
                        {getStatusBadge(quote.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => viewQuote(quote.id)}>
                        مشاهده
                      </button>
                      <button className="btn-print" onClick={() => window.open(`http://localhost:5003/api/quotes/${quote.id}/pdf`, '_blank')}>
                        چاپ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotesListPage
