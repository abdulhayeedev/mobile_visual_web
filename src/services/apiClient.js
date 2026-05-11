import axios from 'axios'
import { store } from '../store/store.js'
import { clearCredentials, setCredentials } from '../store/authSlice.js'
import { resolveTokenExpiryMs } from './authTokenUtils.js'

const rawBase =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : ''

/** @type {string} */
export const API_BASE_URL = rawBase.replace(/\/$/, '') || 'http://localhost:8000'

/**
 * Axios instance for the Audio Visual Analysis backend.
 * Base URL defaults to `http://localhost:8000` (see API docs).
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const isRefresh =
    typeof config.url === 'string' &&
    config.url.includes('/api/v1/auth/refresh')
  const { token, expiresAt, refreshToken } = store.getState().auth

  if (!isRefresh) {
    if (expiresAt != null && Date.now() >= expiresAt && !refreshToken) {
      store.dispatch(clearCredentials())
      return config
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } else if (config.headers && 'Authorization' in config.headers) {
    delete config.headers.Authorization
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (
      !axios.isAxiosError(error) ||
      status !== 401 ||
      !original ||
      typeof original.url !== 'string'
    ) {
      if (status === 401) {
        store.dispatch(clearCredentials())
      }
      return Promise.reject(error)
    }

    const url = original.url
    if (
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/refresh')
    ) {
      store.dispatch(clearCredentials())
      return Promise.reject(error)
    }

    if (original._retryAfterRefresh) {
      store.dispatch(clearCredentials())
      return Promise.reject(error)
    }

    const { refreshToken } = store.getState().auth
    if (!refreshToken) {
      store.dispatch(clearCredentials())
      return Promise.reject(error)
    }

    original._retryAfterRefresh = true
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
      const accessToken = data?.access_token
      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Refresh response missing access_token')
      }
      const expiresAtNext = resolveTokenExpiryMs(data, accessToken)
      const prev = store.getState().auth
      store.dispatch(
        setCredentials({
          token: accessToken,
          user: prev.user,
          expiresAt: expiresAtNext,
          refreshToken: prev.refreshToken,
        }),
      )
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${accessToken}`
      return apiClient.request(original)
    } catch {
      store.dispatch(clearCredentials())
      return Promise.reject(error)
    }
  },
)

/**
 * Human-readable message from FastAPI-style errors (`{ detail: string | array }`)
 * or a generic fallback.
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === 'object' && item !== null && 'msg' in item
            ? String(item.msg)
            : JSON.stringify(item),
        )
        .join('; ')
    }
  }
  if (error instanceof Error) return error.message
  return 'Request failed'
}
