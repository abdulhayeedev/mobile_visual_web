const STORAGE_KEY = 'hayee_mobile_session_id'

/**
 * Opaque session id for `mobile_session_id` (8–128 chars per API).
 * Persisted so repeat visits reuse the same session.
 * @returns {string}
 */
export function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (
      typeof existing === 'string' &&
      existing.length >= 8 &&
      existing.length <= 128
    ) {
      return existing
    }
  } catch {
    /* ignore */
  }
  const id = `web-${crypto.randomUUID()}`
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
  return id
}
