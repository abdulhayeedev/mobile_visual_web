export const dashboardStats = {
  totalUploads: 128,
  completedAnalyses: 94,
  processingJobs: 5,
  failedJobs: 3,
}

export const processingStats = {
  avgQueueMinutes: 4.2,
  avgProcessingMinutes: 12.8,
  successRate: 96.9,
  gpuUtilization: 72,
}

export const recentJobs = [
  {
    id: 'job-8841',
    videoName: 'interview_clip_01.mp4',
    status: 'completed',
    submittedAt: '2026-04-06T14:22:00Z',
    duration: '2:34',
  },
  {
    id: 'job-8840',
    videoName: 'focus_group_b.mp4',
    status: 'processing',
    submittedAt: '2026-04-06T13:58:00Z',
    duration: '5:12',
  },
  {
    id: 'job-8839',
    videoName: 'lecture_snippet.wav',
    status: 'queued',
    submittedAt: '2026-04-06T13:40:00Z',
    duration: '1:05',
  },
  {
    id: 'job-8838',
    videoName: 'panel_discussion.mp4',
    status: 'failed',
    submittedAt: '2026-04-06T11:05:00Z',
    duration: '8:44',
  },
  {
    id: 'job-8837',
    videoName: 'lab_session_03.mp4',
    status: 'completed',
    submittedAt: '2026-04-05T16:30:00Z',
    duration: '3:21',
  },
]

export const videosList = [
  {
    id: 'vid-101',
    name: 'interview_clip_01.mp4',
    sizeMb: 42.3,
    uploadedAt: '2026-04-06T14:20:00Z',
    lastJobStatus: 'completed',
  },
  {
    id: 'vid-102',
    name: 'focus_group_b.mp4',
    sizeMb: 118.7,
    uploadedAt: '2026-04-06T13:55:00Z',
    lastJobStatus: 'processing',
  },
  {
    id: 'vid-103',
    name: 'lecture_snippet.wav',
    sizeMb: 8.1,
    uploadedAt: '2026-04-06T13:38:00Z',
    lastJobStatus: 'queued',
  },
]

export const allJobs = [...recentJobs]

export function getJobById(jobId) {
  return allJobs.find((j) => j.id === jobId) || recentJobs[0]
}

export const analysisResultMock = {
  jobId: 'job-8841',
  videoName: 'interview_clip_01.mp4',
  duration: '2:34',
  resolution: '1920×1080',
  fps: 29.97,
  status: 'completed',
  visualFeatures: {
    faceDetections: 1842,
    avgFacesPerFrame: 1.12,
    dominantExpressions: [
      { label: 'Neutral', pct: 52 },
      { label: 'Smile', pct: 28 },
      { label: 'Attention', pct: 14 },
      { label: 'Other', pct: 6 },
    ],
    gazeStability: 0.78,
    headPoseVariance: 12.4,
  },
  audioFeatures: {
    sampleRate: 48000,
    channels: 2,
    rmsLevelDb: -18.4,
    spectralCentroidHz: 2840,
    voiceActivityPct: 68,
    snrEstimateDb: 22.1,
  },
  multimodalSummary:
    'Predominantly single-speaker interview with stable framing. Visual attention aligns with speech segments; elevated voice activity during minutes 0:45–1:20. Facial expression distribution skews neutral with periodic positive affect. Suitable for downstream sentiment and engagement scoring.',
}

export const reportsList = [
  {
    id: 'rep-01',
    title: 'Weekly processing summary',
    generatedAt: '2026-04-06T09:00:00Z',
    format: 'PDF',
  },
  {
    id: 'rep-02',
    title: 'Facial metrics aggregate (March)',
    generatedAt: '2026-04-01T09:00:00Z',
    format: 'CSV',
  },
]

export const usersList = [
  {
    id: 'usr-1',
    name: 'Dr. A. Khan',
    email: 'a.khan@university.ac.uk',
    role: 'Researcher',
    lastActive: '2026-04-06T15:10:00Z',
  },
  {
    id: 'usr-2',
    name: 'M. Patel',
    email: 'm.patel@university.ac.uk',
    role: 'Analyst',
    lastActive: '2026-04-06T12:44:00Z',
  },
  {
    id: 'usr-3',
    name: 'Lab Admin',
    email: 'lab@university.ac.uk',
    role: 'Admin',
    lastActive: '2026-04-05T18:02:00Z',
  },
]
