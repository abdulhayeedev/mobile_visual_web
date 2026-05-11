import { apiClient } from './apiClient.js'

/**
 * `GET /api/v1/analysis-jobs` is scoped to the authenticated user (Bearer token).
 * @typedef {{
 *   status?: string,
 *   video_id?: number,
 *   skip?: number,
 *   limit?: number
 * }} ListAnalysisJobsParams
 */

/**
 * `status` is typically `queued` | `processing` | `completed` | `failed` (`queued` maps to DB `pending`).
 * @typedef {{
 *   id: number,
 *   job_ref: string,
 *   video_id: number,
 *   filename: string,
 *   status: string,
 *   submitted_at: string,
 *   duration_seconds: number | null,
 *   has_results: boolean,
 *   error_message: string | null,
 *   started_at?: string | null,
 *   completed_at?: string | null,
 *   results?: {
 *     visual_features?: unknown,
 *     audio_features?: unknown,
 *     multimodal_features?: unknown,
 *     summary?: unknown
 *   } | Record<string, unknown> | null
 * }} AnalysisJobItem
 */

/**
 * @typedef {{ items: AnalysisJobItem[], total: number }} AnalysisJobsListResponse
 */

/**
 * `GET /api/v1/analysis-jobs` — optional `video_id` filters within the current user's jobs.
 * @param {ListAnalysisJobsParams} [params]
 * @returns {Promise<AnalysisJobsListResponse>}
 */
export function listAnalysisJobs(params) {
  return apiClient
    .get('/api/v1/analysis-jobs', { params })
    .then((res) => res.data)
}

/**
 * `GET /api/v1/analysis-jobs/{job_id}` — 404 if missing or not owned by the current user.
 * @param {number | string} jobId
 * @param {{ include_results?: boolean }} [params]
 * @returns {Promise<AnalysisJobItem>}
 */
export function getAnalysisJob(jobId, params) {
  return apiClient
    .get(`/api/v1/analysis-jobs/${jobId}`, { params })
    .then((res) => res.data)
}

/**
 * `GET /api/v1/videos/{video_id}/analysis-jobs` — 404 if the video is missing or not owned.
 * @param {number | string} videoId
 * @param {{ skip?: number, limit?: number }} [params]
 * @returns {Promise<AnalysisJobsListResponse>}
 */
export function listVideoAnalysisJobs(videoId, params) {
  return apiClient
    .get(`/api/v1/videos/${videoId}/analysis-jobs`, { params })
    .then((res) => res.data)
}
