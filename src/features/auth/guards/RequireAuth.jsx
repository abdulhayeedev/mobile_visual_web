import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Protected route guard: requires Redux auth (token). Redirects to login with return path.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search || ''}`
    return (
      <Navigate to="/login" replace state={{ from }} />
    )
  }

  return children
}
