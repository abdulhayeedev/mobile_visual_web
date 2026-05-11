/**
 * Upload limits and filename rules aligned with Hayee API defaults
 * (`app/core/config.py` / environment overrides on the server).
 */

export const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024
export const MAX_AUDIO_UPLOAD_BYTES = 20 * 1024 * 1024

export const VIDEO_FILENAME_RE = /\.(mp4|mov|m4v|webm|avi|mkv)$/i
export const AUDIO_FILENAME_RE = /\.(wav|flac)$/i

export const VIDEO_FILE_HELP =
  'Supported video: .mp4, .mov, .m4v, .webm, .avi, .mkv — non-empty, max 50 MiB (server also validates container magic).'

export const AUDIO_FILE_HELP =
  'Supported audio: .wav, .flac — non-empty, max 20 MiB (server validates magic bytes).'

/**
 * @param {File | Blob | null | undefined} file
 * @returns {boolean}
 */
export function isAllowedVideoFile(file) {
  if (!file || file.size <= 0) return false
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) return false
  const name = file instanceof File ? file.name : ''
  return VIDEO_FILENAME_RE.test(name)
}

/**
 * @param {File | Blob | null | undefined} file
 * @returns {boolean}
 */
export function isAllowedAudioFile(file) {
  if (!file || file.size <= 0) return false
  if (file.size > MAX_AUDIO_UPLOAD_BYTES) return false
  const name = file instanceof File ? file.name : ''
  return AUDIO_FILENAME_RE.test(name)
}
