import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../utils/auth'

const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default AdminRoute
