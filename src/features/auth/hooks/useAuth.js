import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, clearCredentials } from '../../../store/authSlice.js'
import {
  loginRequest,
  registerRequest,
  normalizeAuthResponse,
  refreshTokenRequest,
  getCurrentUserRequest,
} from '../services/authService.js'
import { resolveTokenExpiryMs } from '../../../services/authTokenUtils.js'

export function useAuth() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)
  const expiresAt = useSelector((state) => state.auth.expiresAt)
  const refreshToken = useSelector((state) => state.auth.refreshToken)

  /** Clear session if access expiry passed and there is no refresh token. */
  useLayoutEffect(() => {
    if (
      token &&
      expiresAt != null &&
      Date.now() >= expiresAt &&
      !refreshToken
    ) {
      dispatch(clearCredentials())
    }
  }, [token, expiresAt, refreshToken, dispatch])

  const isAuthenticated = Boolean(token)

  const login = useCallback(
    async ({ email, password }) => {
      const data = await loginRequest({ email, password })
      const normalized = normalizeAuthResponse(data, email)
      dispatch(setCredentials(normalized))
      return normalized
    },
    [dispatch],
  )

  const register = useCallback(
    async ({ full_name, email, password }) => {
      const data = await registerRequest({ full_name, email, password })
      const rawToken = data?.access_token ?? data?.token
      if (rawToken) {
        let normalized = normalizeAuthResponse(data, email.trim())
        if (!normalized.user.full_name && full_name) {
          normalized = {
            ...normalized,
            user: { ...normalized.user, full_name },
          }
        }
        dispatch(setCredentials(normalized))
      }
      return data
    },
    [dispatch],
  )

  const logout = useCallback(() => {
    dispatch(clearCredentials())
  }, [dispatch])

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available.')
    }
    const data = await refreshTokenRequest({ refresh_token: refreshToken })
    const accessToken = data?.access_token
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Refresh response did not include an access token.')
    }
    const nextExpires = resolveTokenExpiryMs(data, accessToken)
    dispatch(
      setCredentials({
        token: accessToken,
        user,
        expiresAt: nextExpires,
        refreshToken,
      }),
    )
    return data
  }, [dispatch, refreshToken, user])

  const fetchMe = useCallback(async () => {
    const me = await getCurrentUserRequest()
    dispatch(
      setCredentials({
        token,
        user: {
          id: me.id,
          email: me.email,
          full_name: me.full_name,
          is_active: me.is_active,
        },
        expiresAt,
        refreshToken,
      }),
    )
    return me
  }, [dispatch, token, expiresAt, refreshToken])

  return useMemo(
    () => ({
      token,
      user,
      expiresAt,
      refreshToken,
      isAuthenticated,
      login,
      register,
      logout,
      refreshSession,
      fetchMe,
    }),
    [
      token,
      user,
      expiresAt,
      refreshToken,
      isAuthenticated,
      login,
      register,
      logout,
      refreshSession,
      fetchMe,
    ],
  )
}
