import { apiClient } from './apiClient.js'

/**
 * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
 */

/**
 * Successful `audio_features` branch from `POST /api/v1/analyze-video`.
 * @typedef {{
 *   status: 'ok',
 *   mfcc: { shape: number[], mean: number[], std: number[] },
 *   pitch: Record<string, number | null>,
 *   spectral: Record<string, { mean: number | null, std: number | null }>,
 *   duration_seconds: number,
 *   sample_rate: number
 * }} AudioFeaturesOk
 */

/**
 * Skipped `audio_features` branch (FFmpeg missing / processing failed).
 * @typedef {{
 *   status: 'skipped',
 *   reason: string,
 *   detail: string
 * }} AudioFeaturesSkipped
 */

/**
 * Feature payload returned when analysis completes successfully (`POST /api/v1/analyze-video`).
 * The public API may return `facial_features` / `audio_features` as loosely typed objects; the
 * shape below reflects the richer extractor response when present.
 * @typedef {{
 *   facial_features: {
 *     frames_analyzed: number,
 *     total_face_instances: number,
 *     landmark_backend: string,
 *     per_frame: Array<{
 *       frame_index: number,
 *       faces: Array<{
 *         landmark_count: number,
 *         landmarks_normalized: Array<{ x: number, y: number, z: number }>,
 *         bounding_box: { x: number, y: number, w: number, h: number },
 *         embedding: number[] | null,
 *         embedding_dim: number,
 *         embedding_model: string
 *       }>
 *     }>
 *   },
 *   audio_features: AudioFeaturesOk | AudioFeaturesSkipped,
 *   metadata: {
 *     duration: number,
 *     num_frames: number,
 *     num_frames_sampled: number,
 *     fps: number,
 *     width: number,
 *     height: number
 *   },
 *   aggregated_features: Record<string, unknown>
 * }} VideoAnalysisPayload
 */

/**
 * Full JSON body from `POST /api/v1/analyze-video` on success.
 * Extends the analysis payload with persisted `Video` / `AnalysisJob` identifiers.
 * Requires `Authorization: Bearer <access_token>` (see `apiClient`).
 *
 * @typedef {VideoAnalysisPayload & {
 *   video_id: number,
 *   job_id: number
 * }} VideoAnalysisResponse
 */

/**
 * @typedef {AxiosRequestConfig & { filename?: string }} AnalyzeVideoRequestOptions
 */

/**
 * Upload a video file for facial + audio feature extraction.
 * `POST /api/v1/analyze-video` — multipart field name must be `file`.
 * Server defaults: max 50 MiB, allowed extensions as in API docs, container magic checks, and
 * blocked upload Content-Types (e.g. text/*, application/json). 413 if the file exceeds the limit.
 * Authenticated users only; Bearer token is attached by `apiClient`.
 *
 * @param {File | Blob} file — video blob; filename should use an allowed extension (.mp4, .mov, .m4v, .webm, .avi, .mkv).
 * @param {AnalyzeVideoRequestOptions} [options] — optional `filename` for bare `Blob`s; plus any axios request options (`onUploadProgress`, `signal`, etc.).
 * @returns {Promise<VideoAnalysisResponse>}
 */
export function analyzeVideo(file, options) {
  const { filename, ...requestConfig } = options ?? {}
  const formData = new FormData()
  const name =
    filename ?? (file instanceof File ? file.name : 'upload.mp4')
  formData.append('file', file, name)

  return apiClient
    .post('/api/v1/analyze-video', formData, {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        Accept: 'application/json',
      },
    })
    .then((res) => res.data)
}
