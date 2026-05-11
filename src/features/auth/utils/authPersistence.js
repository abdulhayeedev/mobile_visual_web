const STORAGE_KEY = 'hayee_auth_session'

/**
 * @typedef {{
 *   token: string,
 *   user: { id?: number, email: string, full_name?: string, is_active?: boolean },
 *   expiresAt: number | null,
 *   refreshToken?: string | null
 * }} PersistedAuth
 */

/**
 * Read persisted auth from localStorage. Returns null if missing, corrupt, or expired.
 * @returns {PersistedAuth | null}
 */
export function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data.token !== 'string' || !data.user?.email) {
      return null
    }
    const refreshTok =
      typeof data.refreshToken === 'string' ? data.refreshToken : null
    if (data.expiresAt != null && typeof data.expiresAt === 'number') {
      if (Date.now() >= data.expiresAt && !refreshTok) {
        clearPersistedAuth()
        return null
      }
    }
    const u = data.user
    const id = u?.id
    const is_active = u?.is_active
    return {
      token: data.token,
      user: {
        email: String(u.email),
        ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
        full_name:
          typeof u.full_name === 'string' ? u.full_name : undefined,
        ...(typeof is_active === 'boolean' ? { is_active } : {}),
      },
      expiresAt:
        typeof data.expiresAt === 'number' ? data.expiresAt : null,
      refreshToken: refreshTok,
    }
  } catch {
    return null
  }
}

/**
 * @param {PersistedAuth} session
 */
export function savePersistedAuth(session) {
  try {
    const payload = {
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt ?? null,
      refreshToken: session.refreshToken ?? null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function clearPersistedAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
