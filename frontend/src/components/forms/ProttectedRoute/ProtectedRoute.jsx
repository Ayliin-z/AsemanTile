// frontend/src/components/protected/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from '../../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuth = isAuthenticated();
  const user = getStoredUser();

  // اگر وارد نشده باشه
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // اگر نقش مشخص شده و کاربر نقش مجاز را ندارد
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.type)) {
    // بر اساس نقش کاربر به پنل مناسب هدایت کن
    if (user?.type === 'admin') return <Navigate to="/admin" replace />;
    if (user?.type === 'employee') return <Navigate to="/employee" replace />;
    if (user?.type === 'partner') return <Navigate to="/partner" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
};

export default ProtectedRoute;
