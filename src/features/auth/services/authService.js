import { apiClient } from '../../../services/apiClient.js'
import {
  decodeJwtExpiryMs,
  resolveTokenExpiryMs,
} from '../../../services/authTokenUtils.js'

export { decodeJwtExpiryMs, resolveTokenExpiryMs } from '../../../services/authTokenUtils.js'

/**
 * Auth API — isolated from Redux; use via `useAuth` / thunks.
 * Contract: `POST /api/v1/auth/*`, `GET /api/v1/auth/me`.
 */

/**
 * @typedef {{
 *   id: number,
 *   email: string,
 *   full_name: string,
 *   is_active: boolean
 * }} AuthUserDto
 */

/**
 * @param {Record<string, unknown>} payload — login/register body or `/me`-like shape
 * @param {string} fallbackEmail
 * @returns {{ id?: number, email: string, full_name?: string, is_active?: boolean }}
 */
export function normalizeUserFromPayload(payload, fallbackEmail) {
  const u = payload?.user ?? payload
  if (u && typeof u === 'object' && typeof u.email === 'string') {
    const id = u.id
    const is_active = u.is_active
    return {
      ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
      email: u.email,
      full_name: typeof u.full_name === 'string' ? u.full_name : undefined,
      ...(typeof is_active === 'boolean' ? { is_active } : {}),
    }
  }
  return { email: fallbackEmail, full_name: undefined }
}

/**
 * @param {Record<string, unknown>} data
 * @param {string} email
 * @returns {{
 *   token: string,
 *   user: { id?: number, email: string, full_name?: string, is_active?: boolean },
 *   expiresAt: number | null,
 *   refreshToken: string | null
 * }}
 */
export function normalizeAuthResponse(data, email) {
  const token = data?.access_token ?? data?.token ?? null
  if (!token || typeof token !== 'string') {
    throw new Error('Auth response did not include an access token.')
  }
  const user = normalizeUserFromPayload(data, email)
  const expiresAt = resolveTokenExpiryMs(data, token)
  const rt = data?.refresh_token
  const refreshToken = typeof rt === 'string' ? rt : null
  return { token, user, expiresAt, refreshToken }
}

/**
 * `POST /api/v1/auth/refresh` — returns a new access token; refresh token is unchanged on the server.
 * @param {{ refresh_token: string }} body
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export async function refreshTokenRequest(body) {
  const { data } = await apiClient.post('/api/v1/auth/refresh', body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

/**
 * `GET /api/v1/auth/me` — requires Bearer access token.
 * @returns {Promise<AuthUserDto>}
 */
export async function getCurrentUserRequest() {
  const { data } = await apiClient.get('/api/v1/auth/me')
  return data
}

/**
 * @param {{ email: string, password: string }} body
 */
export async function loginRequest(body) {
  const { data } = await apiClient.post('/api/v1/auth/login', body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}

/**
 * @param {{ full_name: string, email: string, password: string }} body
 */
export async function registerRequest(body) {
  const { data } = await apiClient.post('/api/v1/auth/register', body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}
