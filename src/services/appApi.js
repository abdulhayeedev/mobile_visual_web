import { apiClient } from './apiClient.js'

/**
 * @typedef {{ app: string, version: string }} AppInfoResponse
 */

/**
 * @typedef {{ status: string, service: string, version: string }} HealthResponse
 */

/**
 * `GET /` — app name and version.
 * @returns {Promise<AppInfoResponse>}
 */
export function getAppInfo() {
  return apiClient.get('/').then((res) => res.data)
}

/**
 * `GET /health` — liveness / API status.
 * @returns {Promise<HealthResponse>}
 */
export function getHealth() {
  return apiClient.get('/health').then((res) => res.data)
}

/**
 * `GET /api/v1/health` — same semantics as {@link getHealth}.
 * @returns {Promise<HealthResponse>}
 */
export function getApiV1Health() {
  return apiClient.get('/api/v1/health').then((res) => res.data)
}
