export {
  apiClient,
  API_BASE_URL,
  getApiErrorMessage,
} from './apiClient.js'

export { getAppInfo, getHealth, getApiV1Health } from './appApi.js'

export { analyzeVideo } from './videoAnalysisApi.js'

export {
  analyzeVideoHf,
  analyzeAudio,
  multimodalPredict,
} from './mediaAnalysisApi.js'

export { getConsentPolicy, registerConsent } from './consentApi.js'

export { getOrCreateSessionId } from './sessionId.js'

export { saveAnalysisSession, loadAnalysisSession } from './analysisSession.js'

export { setStoredUserId, getStoredUserId } from './userStorage.js'

export { listVideos } from './videosApi.js'

export {
  listAnalysisJobs,
  getAnalysisJob,
  listVideoAnalysisJobs,
} from './analysisJobsApi.js'

export {
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_AUDIO_UPLOAD_BYTES,
  isAllowedVideoFile,
  isAllowedAudioFile,
  VIDEO_FILE_HELP,
  AUDIO_FILE_HELP,
} from '../constants/apiLimits.js'

export {
  loginRequest,
  registerRequest,
  normalizeAuthResponse,
  refreshTokenRequest,
  getCurrentUserRequest,
  decodeJwtExpiryMs,
  resolveTokenExpiryMs,
} from '../features/auth/services/authService.js'
