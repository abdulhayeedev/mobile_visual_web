import { apiClient } from './apiClient.js'

/**
 * @typedef {{
 *   version: string,
 *   title: string,
 *   summary: string,
 *   full_text: string
 * }} ConsentPolicyResponse
 */

/**
 * @typedef {{
 *   participant_email: string,
 *   participant_name: string,
 *   accepted: boolean,
 *   consent_version: string,
 *   mobile_session_id: string
 * }} ConsentRegisterRequest
 */

/**
 * @typedef {{
 *   user_id: number,
 *   video_session_id: number,
 *   consent_id: number,
 *   accepted: boolean,
 *   consent_version: string,
 *   message: string
 * }} ConsentRegisterResponse
 */

/**
 * `GET /api/v1/consent/policy` — current policy text and version (send `consent_version` back on register).
 * @returns {Promise<ConsentPolicyResponse>}
 */
export function getConsentPolicy() {
  return apiClient.get('/api/v1/consent/policy').then((res) => res.data)
}

/**
 * `POST /api/v1/consent/register` — register consent for this client session.
 * @param {ConsentRegisterRequest} body
 * @returns {Promise<ConsentRegisterResponse>}
 */
export function registerConsent(body) {
  return apiClient
    .post('/api/v1/consent/register', body, {
      headers: { 'Content-Type': 'application/json' },
    })
    .then((res) => res.data)
}
