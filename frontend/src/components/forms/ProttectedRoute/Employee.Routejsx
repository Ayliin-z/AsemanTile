import { Navigate } from 'react-router-dom'
import { isEmployeeAuthenticated } from '../../utils/employeeAuth'

const EmployeeRoute = ({ children }) => {
  if (!isEmployeeAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default EmployeeRoute

