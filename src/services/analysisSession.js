/** @param {string | number} videoSessionId */
function key(videoSessionId) {
  return `hayee_analysis_${String(videoSessionId)}`
}

/**
 * Persist last analysis for the result page (same tab session).
 * @param {string | number} videoSessionId — from `registerConsent` → `video_session_id`
 * @param {{
 *   analysis: object,
 *   consentRegister: object,
 *   fileName: string,
 *   participantEmail: string
 * }} payload
 */
export function saveAnalysisSession(videoSessionId, payload) {
  try {
    sessionStorage.setItem(key(videoSessionId), JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}

/**
 * @param {string | number} videoSessionId
 * @returns {{
 *   analysis: object,
 *   consentRegister: object,
 *   fileName: string,
 *   participantEmail: string
 * } | null}
 */
export function loadAnalysisSession(videoSessionId) {
  try {
    const raw = sessionStorage.getItem(key(videoSessionId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
