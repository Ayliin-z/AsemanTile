import { Navigate } from 'react-router-dom'
import { isCustomerAuthenticated, getCurrentCustomer } from '../../utils/customerAuth'

const PartnerRoute = ({ children }) => {
  if (!isCustomerAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  const customer = getCurrentCustomer()
  if (customer?.role !== 'partner') {
    return <Navigate to="/customer" replace />
  }
  return children
}

export default PartnerRoute
