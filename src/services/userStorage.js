const USER_ID_KEY = 'hayee_user_id'

/** @param {number} id */
export function setStoredUserId(id) {
  try {
    if (Number.isFinite(id)) localStorage.setItem(USER_ID_KEY, String(id))
  } catch {
    /* ignore */
  }
}

/** @returns {number | null} */
export function getStoredUserId() {
  try {
    const raw = localStorage.getItem(USER_ID_KEY)
    if (raw == null || raw === '') return null
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}
