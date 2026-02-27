import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, allowedRoles }) {
     const { isAuthenticated, user } = useSelector(state => state.auth)
     const location = useLocation()

     if (!isAuthenticated) {
          return <Navigate to="/login" state={{ from: location }} replace />
     }

     if (allowedRoles && !allowedRoles.includes(user?.role)) {
          return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />
     }

     return children
}
