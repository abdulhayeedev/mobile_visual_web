import { apiClient } from './apiClient.js'

/**
 * `GET /api/v1/videos` is scoped to the authenticated user (Bearer token).
 * @typedef {{
 *   search?: string,
 *   exclude_session_placeholders?: boolean,
 *   skip?: number,
 *   limit?: number
 * }} ListVideosParams
 */

/**
 * @typedef {{
 *   id: number,
 *   filename: string,
 *   size_bytes: number | null,
 *   size_display: string,
 *   uploaded_at: string,
 *   duration_seconds: number | null,
 *   last_job_status: string | null,
 *   last_job_id: number | null,
 *   job_count: number
 * }} VideoListItem
 */

/**
 * @typedef {{ items: VideoListItem[], total: number }} VideosListResponse
 */

/**
 * `GET /api/v1/videos`
 * @param {ListVideosParams} [params]
 * @returns {Promise<VideosListResponse>}
 */
export function listVideos(params) {
  return apiClient
    .get('/api/v1/videos', { params })
    .then((res) => res.data)
}
