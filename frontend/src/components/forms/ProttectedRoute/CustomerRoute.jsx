import { Navigate } from 'react-router-dom'
import { isCustomerAuthenticated } from '../../utils/customerAuth'

const CustomerRoute = ({ children }) => {
  if (!isCustomerAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default CustomerRoute
