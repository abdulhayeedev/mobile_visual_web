/**
 * JWT expiry helpers shared by `apiClient` and auth normalization (no axios).
 */

/**
 * @param {unknown} token
 * @returns {number | null} expiry time in ms since epoch
 */
export function decodeJwtExpiryMs(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(base64))
    if (json?.exp && typeof json.exp === 'number') {
      return json.exp * 1000
    }
  } catch {
    return null
  }
  return null
}

/**
 * @param {Record<string, unknown>} data — API JSON body
 * @param {string | null} token
 * @returns {number | null}
 */
export function resolveTokenExpiryMs(data, token) {
  const expiresIn = data?.expires_in
  if (typeof expiresIn === 'number' && expiresIn > 0) {
    return Date.now() + expiresIn * 1000
  }
  return decodeJwtExpiryMs(token)
}
