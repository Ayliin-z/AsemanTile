import React, { useState, useEffect } from 'react'
import './AdminPage.css'

const ContactRequestsPage = () => {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetch('http://localhost:5003/api/contact')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="contact-requests-view">
      <h2>درخواست‌های تماس</h2>
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>شماره تماس</th>
              <th>شهر</th>
              <th>پیام</th>
              <th>وضعیت</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.name}</td>
                <td>{req.mobile}</td>
                <td>{req.city || '—'}</td>
                <td style={{maxWidth: '200px'}}>{req.message?.substring(0, 50)}</td>
                <td>
                  <span className={`status-badge status-${req.status}`}>
                    {req.status === 'new' ? 'جدید' : req.status === 'contacted' ? 'تماس گرفته شد' : 'پیگیری شد'}
                  </span>
                </td>
                <td>{new Date(req.created_at).toLocaleDateString('fa-IR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContactRequestsPage
