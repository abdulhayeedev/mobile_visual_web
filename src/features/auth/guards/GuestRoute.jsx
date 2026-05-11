import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Guest-only guard: login / register. Authenticated users are redirected to the app.
 */
export default function GuestRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
