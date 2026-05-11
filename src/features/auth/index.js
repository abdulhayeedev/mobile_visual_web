export { useAuth } from './hooks/useAuth.js'
export { default as AuthLayout } from './components/AuthLayout.jsx'
export { default as LoginForm } from './components/LoginForm.jsx'
export { default as RegisterForm } from './components/RegisterForm.jsx'
export { default as RequireAuth } from './guards/RequireAuth.jsx'
export { default as GuestRoute } from './guards/GuestRoute.jsx'
export { useLoginForm } from './hooks/useLoginForm.js'
export { useRegisterForm } from './hooks/useRegisterForm.js'

export {
  loadPersistedAuth,
  savePersistedAuth,
  clearPersistedAuth,
} from './utils/authPersistence.js'

export {
  loginRequest,
  registerRequest,
  normalizeAuthResponse,
  refreshTokenRequest,
  getCurrentUserRequest,
  decodeJwtExpiryMs,
  resolveTokenExpiryMs,
} from './services/authService.js'
