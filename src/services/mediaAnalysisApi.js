import { apiClient } from './apiClient.js'

/**
 * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
 */

/**
 * @typedef {AxiosRequestConfig & { filename?: string }} MultipartRequestOptions
 */

/**
 * `POST /api/v1/analyze-video-hf` — rule-based heuristics (early frames + demuxed audio).
 * No DB rows. Optional `heuristic_features` when the server attaches floats.
 * @typedef {{
 *   type: 'video',
 *   frames_analyzed: number,
 *   predictions: Array<{ label: string, score: number }>,
 *   metadata: {
 *     duration: number,
 *     num_frames: number,
 *     num_frames_sampled: number,
 *     fps: number,
 *     width: number,
 *     height: number
 *   },
 *   heuristic_features: Record<string, number> | null
 * }} AnalyzeVideoHfResponse
 */

/**
 * `POST /api/v1/analyze-audio` — requires ML stack on server (`requirements-ml.txt`).
 * **503** when ML stack is not installed.
 * @typedef {{
 *   type: 'audio',
 *   sample_rate: number,
 *   prediction: { label: string, score: number }
 * }} AnalyzeAudioResponse
 */

/**
 * `POST /api/v1/multimodal-predict` — ephemeral fusion inference; **503** without ML stack.
 * @typedef {{
 *   type: 'multimodal',
 *   emotion_class: number,
 *   emotion_label: string | null,
 *   fusion_logits: number[],
 *   audio_logits: number[],
 *   audio_emotion_class: number,
 *   num_video_frames_used: number,
 *   fusion_checkpoint_loaded: boolean
 * }} MultimodalPredictResponse
 */

/**
 * @param {File | Blob} file
 * @param {MultipartRequestOptions} [options]
 * @returns {Promise<AnalyzeVideoHfResponse>}
 */
export function analyzeVideoHf(file, options) {
  const { filename, ...requestConfig } = options ?? {}
  const formData = new FormData()
  const name =
    filename ?? (file instanceof File ? file.name : 'upload.mp4')
  formData.append('file', file, name)

  return apiClient
    .post('/api/v1/analyze-video-hf', formData, {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        Accept: 'application/json',
      },
    })
    .then((res) => res.data)
}

/**
 * @param {File | Blob} file — `.wav` or `.flac`
 * @param {MultipartRequestOptions} [options]
 * @returns {Promise<AnalyzeAudioResponse>}
 */
export function analyzeAudio(file, options) {
  const { filename, ...requestConfig } = options ?? {}
  const formData = new FormData()
  const name =
    filename ?? (file instanceof File ? file.name : 'audio.wav')
  formData.append('file', file, name)

  return apiClient
    .post('/api/v1/analyze-audio', formData, {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        Accept: 'application/json',
      },
    })
    .then((res) => res.data)
}

/**
 * @typedef {AxiosRequestConfig & { videoFilename?: string, audioFilename?: string }} MultimodalRequestOptions
 */

/**
 * @param {{ video: File | Blob, audio: File | Blob }} files
 * @param {MultimodalRequestOptions} [options]
 * @returns {Promise<MultimodalPredictResponse>}
 */
export function multimodalPredict(files, options) {
  const { videoFilename, audioFilename, ...requestConfig } = options ?? {}
  const formData = new FormData()
  const vName =
    videoFilename ??
    (files.video instanceof File ? files.video.name : 'video.mp4')
  const aName =
    audioFilename ??
    (files.audio instanceof File ? files.audio.name : 'audio.wav')
  formData.append('video', files.video, vName)
  formData.append('audio', files.audio, aName)

  return apiClient
    .post('/api/v1/multimodal-predict', formData, {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        Accept: 'application/json',
      },
    })
    .then((res) => res.data)
}
