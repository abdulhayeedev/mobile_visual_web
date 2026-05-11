import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { analysisResultMock, getJobById } from '../../data/mockData.js'
import {
  loadAnalysisSession,
  getAnalysisJob,
  getApiErrorMessage,
} from '../../services/index.js'

function MetricBar({ label, value, max = 100, color = 'bg-indigo-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="presentation"
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function formatDurationSeconds(sec) {
  if (typeof sec !== 'number' || Number.isNaN(sec)) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Map GET /analysis-jobs/{id}?include_results=true into analyse-video-shaped payload where possible. */
function analysisFromStoredResults(results) {
  if (!results || typeof results !== 'object') return null
  const vf = results.visual_features ?? results.facial_features
  const af = results.audio_features
  const agg = results.aggregated_features
  const meta = results.metadata
  if (!vf && !af && !meta && !agg) return null
  return {
    facial_features: vf || {
      frames_analyzed: 0,
      total_face_instances: 0,
      landmark_backend: '—',
      per_frame: [],
    },
    audio_features: af || { status: 'skipped', reason: 'no_audio', detail: '' },
    metadata: meta || {},
    aggregated_features: agg || {},
    _multimodalSummary:
      typeof results.summary === 'string'
        ? results.summary
        : typeof results.multimodal_features === 'string'
          ? results.multimodal_features
          : null,
  }
}

/** @param {unknown} s */
function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Printable / savable HTML summary (opens in browser; user can Print to PDF).
 * @param {Record<string, unknown>} data — shape from AnalysisResultPage `data`
 * @param {string | undefined} jobId
 */
function buildAnalysisReportHtml(data, jobId) {
  const vf = data.visualFeatures
  const af = data.audioFeatures
  const agg = data.aggregated
  const hasVisual =
    vf &&
    typeof vf === 'object' &&
    (data.source === 'api' || data.source === 'mock')
  const hasAudio =
    af && typeof af === 'object' && (data.source === 'api' || data.source === 'mock')

  const visualBlock =
    hasVisual && vf
      ? `
    <section>
      <h2>Visual features</h2>
      <table>
        <tr><th>Face instances (total)</th><td>${escapeHtml(vf.faceDetections)}</td></tr>
        <tr><th>Avg. faces / frame</th><td>${escapeHtml(vf.avgFacesPerFrame)}</td></tr>
        <tr><th>Frames analysed</th><td>${escapeHtml(vf.framesAnalyzed)}</td></tr>
        <tr><th>Landmark backend</th><td>${escapeHtml(vf.landmarkBackend)}</td></tr>
      </table>
    </section>`
      : ''

  const audioBlock =
    hasAudio && af
      ? `
    <section>
      <h2>Audio features</h2>
      <p><strong>Status:</strong> ${escapeHtml(af.audioStatus ?? '—')}${af.audioDetail ? ` — ${escapeHtml(af.audioDetail)}` : ''}</p>
      <table>
        <tr><th>Sample rate</th><td>${escapeHtml(af.sampleRate)} Hz</td></tr>
        <tr><th>Spectral centroid</th><td>${escapeHtml(af.spectralCentroidHz)} Hz</td></tr>
        <tr><th>Voiced fraction (est.)</th><td>${escapeHtml(af.voiceActivityPct)}%</td></tr>
      </table>
    </section>`
      : ''

  const aggregatedBlock =
    agg && typeof agg === 'object' && Object.keys(agg).length > 0
      ? `
    <section>
      <h2>Aggregated features (JSON)</h2>
      <pre>${escapeHtml(JSON.stringify(agg, null, 2))}</pre>
    </section>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>HAYEE — Analysis report (${escapeHtml(jobId)})</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.1rem; margin-top: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid #f1f5f9; }
    th { width: 12rem; color: #475569; font-weight: 600; }
    pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow: auto; font-size: 0.75rem; }
    .summary { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Analysis report</h1>
  <p class="meta">HAYEE · Generated ${escapeHtml(new Date().toISOString())}</p>
  <section>
    <h2>Job</h2>
    <table>
      <tr><th>Job / session</th><td>${escapeHtml(data.jobId)}</td></tr>
      <tr><th>Video</th><td>${escapeHtml(data.videoName)}</td></tr>
      <tr><th>Status</th><td>${escapeHtml(data.status)}</td></tr>
      <tr><th>Duration</th><td>${escapeHtml(data.duration)}</td></tr>
      <tr><th>Resolution</th><td>${escapeHtml(data.resolution)}</td></tr>
      <tr><th>FPS</th><td>${escapeHtml(data.fps)}</td></tr>
    </table>
    ${data.errorMessage ? `<p><strong>Error:</strong> ${escapeHtml(data.errorMessage)}</p>` : ''}
  </section>
  ${visualBlock}
  ${audioBlock}
  ${aggregatedBlock}
  <section>
    <h2>Multimodal summary</h2>
    <p class="summary">${escapeHtml(data.multimodalSummary)}</p>
  </section>
</body>
</html>`
}

export default function AnalysisResultPage() {
  const { jobId } = useParams()
  const location = useLocation()
  const fromNav = location.state?.bundle
  const stored = loadAnalysisSession(jobId)
  const localBundle = fromNav || stored

  const [serverJob, setServerJob] = useState(null)
  const [serverLoadState, setServerLoadState] = useState('idle')
  const [serverError, setServerError] = useState(null)

  const numericJobId = useMemo(() => {
    if (jobId == null || jobId === '') return null
    const n = Number.parseInt(String(jobId), 10)
    return Number.isFinite(n) ? n : null
  }, [jobId])

  useEffect(() => {
    let cancelled = false

    if (localBundle?.analysis || numericJobId == null) {
      queueMicrotask(() => {
        if (cancelled) return
        setServerJob(null)
        setServerLoadState('idle')
        setServerError(null)
      })
      return () => {
        cancelled = true
      }
    }

    queueMicrotask(() => {
      if (cancelled) return
      setServerLoadState('loading')
      setServerError(null)
    })

    getAnalysisJob(numericJobId, { include_results: true })
      .then((job) => {
        if (!cancelled) {
          setServerJob(job)
          setServerLoadState('done')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setServerError(getApiErrorMessage(e))
          setServerLoadState('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [localBundle?.analysis, numericJobId])

  const analysisFromServer = useMemo(() => {
    if (!serverJob?.results) return null
    return analysisFromStoredResults(serverJob.results)
  }, [serverJob])

  const effectiveBundle = useMemo(() => {
    if (localBundle?.analysis) return localBundle
    if (analysisFromServer) {
      return {
        analysis: analysisFromServer,
        fileName: serverJob?.filename || 'Video',
        participantEmail: null,
        consentRegister: null,
      }
    }
    return null
  }, [localBundle, analysisFromServer, serverJob])

  const job = useMemo(() => getJobById(jobId), [jobId])

  const analysis = effectiveBundle?.analysis

  const data = useMemo(() => {
    if (!analysis) {
      if (serverLoadState === 'loading') {
        return null
      }
      if (serverJob) {
        return {
          jobId: serverJob.job_ref || String(jobId),
          videoName: serverJob.filename || 'Video',
          status: serverJob.status,
          duration: formatDurationSeconds(serverJob.duration_seconds),
          resolution: '—',
          fps: '—',
          source: 'job-empty',
          raw: null,
          serverErrorMessage: null,
          errorMessage: serverJob.error_message,
          multimodalSummary:
            serverJob.has_results === false
              ? 'This job has no stored feature payload yet. Complete analysis on the server or open a freshly analysed clip from upload.'
              : 'Feature results could not be parsed for display. Use Export JSON if the API exposes raw `results`.',
        }
      }
      return {
        ...analysisResultMock,
        jobId: job?.id || jobId,
        videoName: job?.videoName || analysisResultMock.videoName,
        status: job?.status || analysisResultMock.status,
        source: 'mock',
        raw: null,
        serverErrorMessage: serverError,
        errorMessage: null,
      }
    }

    const meta = analysis.metadata || {}
    const facial = analysis.facial_features || {}
    const audio = analysis.audio_features || {}
    const agg = analysis.aggregated_features || {}

    const audioOk = audio.status === 'ok'
    const centroid =
      audioOk && audio.spectral?.centroid_hz?.mean != null
        ? Math.round(audio.spectral.centroid_hz.mean)
        : null

    const voicePct =
      audioOk && typeof audio.pitch?.voiced_fraction === 'number'
        ? Math.round(audio.pitch.voiced_fraction * 100)
        : 0

    const multimodalFromAnalysis =
      analysis._multimodalSummary ||
      (audioOk
        ? `Analysed ${meta.num_frames_sampled ?? facial.frames_analyzed ?? '—'} sampled frames at ~${meta.fps || '—'} fps. ` +
          `${facial.total_face_instances ?? 0} face instance(s) across frames (${facial.landmark_backend || 'unknown'}). ` +
          `Audio: ${audio.sample_rate ?? '—'} Hz sample rate` +
          (centroid != null ? `; spectral centroid ~${centroid} Hz.` : '.')
        : `Video decoded (${meta.duration ?? '—'}s). Audio: ${audio.status === 'skipped' ? audio.reason || 'skipped' : 'n/a'}.`)

    return {
      jobId: serverJob?.job_ref || String(jobId),
      videoName:
        effectiveBundle.fileName || serverJob?.filename || job?.videoName || 'Video',
      status: serverJob?.status || 'completed',
      duration: formatDurationSeconds(
        meta.duration ?? serverJob?.duration_seconds ?? null,
      ),
      resolution:
        meta.width && meta.height ? `${meta.width}×${meta.height}` : '—',
      fps: meta.fps ?? '—',
      source: 'api',
      visualFeatures: {
        faceDetections: facial.total_face_instances ?? 0,
        avgFacesPerFrame:
          facial.frames_analyzed > 0
            ? (facial.total_face_instances / facial.frames_analyzed).toFixed(2)
            : '0',
        dominantExpressions: [],
        gazeStability: 0,
        headPoseVariance: 0,
        landmarkBackend: facial.landmark_backend,
        framesAnalyzed: facial.frames_analyzed,
      },
      audioFeatures: {
        sampleRate: audioOk ? audio.sample_rate ?? '—' : '—',
        channels: '—',
        rmsLevelDb: '—',
        spectralCentroidHz: centroid ?? '—',
        voiceActivityPct: voicePct,
        snrEstimateDb: '—',
        audioStatus: audio.status,
        audioDetail: audio.status === 'skipped' ? audio.detail : null,
      },
      multimodalSummary: multimodalFromAnalysis,
      aggregated: agg,
      raw: analysis,
      errorMessage: serverJob?.error_message,
    }
  }, [
    analysis,
    effectiveBundle,
    job,
    jobId,
    serverJob,
    serverLoadState,
    serverError,
  ])

  const exportJson = useCallback(() => {
    const payload =
      localBundle?.analysis ??
      analysisFromServer ??
      serverJob?.results ??
      data?.raw
    if (!payload) return
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${jobId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [
    localBundle?.analysis,
    analysisFromServer,
    serverJob?.results,
    data?.raw,
    jobId,
  ])

  const downloadHtmlReport = useCallback(() => {
    if (!data) return
    const html = buildAnalysisReportHtml(data, jobId)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-report-${jobId}.html`
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data, jobId])

  if (serverLoadState === 'loading' && !localBundle?.analysis) {
    return (
      <div>
        <PageHeader
          title="Analysis result"
          description="Loading job from the server…"
        />
        <Loader label="Loading analysis job…" />
      </div>
    )
  }

  if (
    serverLoadState === 'error' &&
    !localBundle?.analysis &&
    numericJobId != null
  ) {
    return (
      <div>
        <PageHeader
          title="Analysis result"
          description="Could not load this job."
        />
        <ErrorState title="Job not available" message={serverError} />
        <p className="mt-4">
          <Link
            to="/jobs"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to jobs
          </Link>
        </p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const showMock = data.source === 'mock'
  const showJobEmpty = data.source === 'job-empty'
  const exportable =
    !!(localBundle?.analysis || analysisFromServer || serverJob?.results || data.raw)

  return (
    <div>
      <PageHeader
        title="Analysis result"
        description={
          data.source === 'api'
            ? 'Structured visual, audio, and aggregated summaries from the API.'
            : data.source === 'job-empty'
              ? 'Job metadata from the server; features may still be processing or not persisted.'
              : 'Structured visual, audio, and fused summaries (demo data — open a job from the list for live data).'
        }
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={exportJson}
              disabled={!exportable}
            >
              Export JSON
            </Button>
            <Button type="button" onClick={downloadHtmlReport}>
              Download report
            </Button>
          </>
        }
      />

      {data.serverErrorMessage ? (
        <p className="mb-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700">
          {data.serverErrorMessage}
        </p>
      ) : null}

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Session / job
            </p>
            <p className="mt-1 font-mono text-sm text-slate-900">{data.jobId}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {data.videoName}
            </h2>
            {effectiveBundle?.participantEmail ? (
              <p className="mt-1 text-sm text-slate-600">
                Participant: {effectiveBundle.participantEmail}
              </p>
            ) : null}
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <div>
                <dt className="inline text-slate-500">Duration: </dt>
                <dd className="inline font-medium text-slate-800">
                  {data.duration}
                </dd>
              </div>
              <div>
                <dt className="inline text-slate-500">Resolution: </dt>
                <dd className="inline font-medium text-slate-800">
                  {data.resolution}
                </dd>
              </div>
              <div>
                <dt className="inline text-slate-500">FPS: </dt>
                <dd className="inline font-medium text-slate-800">{data.fps}</dd>
              </div>
            </dl>
            {data.errorMessage ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {data.errorMessage}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge status={data.status} />
            <Link
              to="/jobs"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to jobs
            </Link>
          </div>
        </div>
      </Card>

      {showJobEmpty ? (
        <Card className="mb-6">
          <CardHeader title="Feature payload" subtitle="No displayable results" />
          <p className="text-sm text-slate-600">{data.multimodalSummary}</p>
        </Card>
      ) : null}

      {!showMock && !showJobEmpty ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Visual features"
              subtitle={
                data.visualFeatures.landmarkBackend || 'Face pipeline'
              }
            />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <dt className="text-xs text-slate-500">Face instances (total)</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">
                  {typeof data.visualFeatures.faceDetections === 'number'
                    ? data.visualFeatures.faceDetections.toLocaleString()
                    : data.visualFeatures.faceDetections}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <dt className="text-xs text-slate-500">Avg. faces / frame</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">
                  {data.visualFeatures.avgFacesPerFrame}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-slate-600">
              Frames analysed:{' '}
              <strong>{data.visualFeatures.framesAnalyzed ?? '—'}</strong>
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Audio features"
              subtitle="MFCC, pitch, and spectral summaries"
            />
            {data.audioFeatures.audioStatus === 'skipped' ? (
              <p className="text-sm text-amber-800">
                Audio skipped
                {data.audioFeatures.audioDetail
                  ? `: ${data.audioFeatures.audioDetail}`
                  : ''}
              </p>
            ) : null}
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">Sample rate</dt>
                <dd className="font-medium text-slate-900">
                  {data.audioFeatures.sampleRate} Hz
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">Spectral centroid (mean)</dt>
                <dd className="font-medium text-slate-900">
                  {data.audioFeatures.spectralCentroidHz} Hz
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">Voiced fraction (est.)</dt>
                <dd className="font-medium text-slate-900">
                  {data.audioFeatures.voiceActivityPct}%
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      ) : showMock ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Visual features"
              subtitle="Face-related cues and scene stability (mock metrics)"
            />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <dt className="text-xs text-slate-500">Face detections</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">
                  {analysisResultMock.visualFeatures.faceDetections.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <dt className="text-xs text-slate-500">Avg. faces / frame</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">
                  {analysisResultMock.visualFeatures.avgFacesPerFrame}
                </dd>
              </div>
            </dl>
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-slate-700">
                Expression distribution
              </p>
              {analysisResultMock.visualFeatures.dominantExpressions.map(
                (row) => (
                  <MetricBar
                    key={row.label}
                    label={row.label}
                    value={row.pct}
                    max={100}
                    color={
                      row.label === 'Neutral'
                        ? 'bg-slate-400'
                        : row.label === 'Smile'
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                    }
                  />
                ),
              )}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MetricBar
                label="Gaze stability"
                value={Math.round(
                  analysisResultMock.visualFeatures.gazeStability * 100,
                )}
              />
              <MetricBar
                label="Head pose variance (°)"
                value={Math.min(
                  100,
                  analysisResultMock.visualFeatures.headPoseVariance,
                )}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Audio features"
              subtitle="Level, spectrum, and speech presence"
            />
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">Sample rate</dt>
                <dd className="font-medium text-slate-900">
                  {analysisResultMock.audioFeatures.sampleRate} Hz
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">Channels</dt>
                <dd className="font-medium text-slate-900">
                  {analysisResultMock.audioFeatures.channels}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">RMS level</dt>
                <dd className="font-medium text-slate-900">
                  {analysisResultMock.audioFeatures.rmsLevelDb} dBFS
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <dt className="text-slate-600">Spectral centroid</dt>
                <dd className="font-medium text-slate-900">
                  {analysisResultMock.audioFeatures.spectralCentroidHz} Hz
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-600">SNR estimate</dt>
                <dd className="font-medium text-slate-900">
                  {analysisResultMock.audioFeatures.snrEstimateDb} dB
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <MetricBar
                label="Voice activity"
                value={analysisResultMock.audioFeatures.voiceActivityPct}
              />
            </div>
          </Card>
        </div>
      ) : null}

      {data.source === 'api' &&
      data.aggregated &&
      Object.keys(data.aggregated).length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            title="Aggregated features"
            subtitle="Pooled statistics from the API response"
          />
          <pre className="max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(data.aggregated, null, 2)}
          </pre>
        </Card>
      ) : null}

      {(showMock || showJobEmpty) &&
      serverJob?.results &&
      typeof serverJob.results === 'object' &&
      Object.keys(serverJob.results).length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            title="Stored results (raw)"
            subtitle="From job record — shape may differ from inline analyse response"
          />
          <pre className="max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(serverJob.results, null, 2)}
          </pre>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardHeader
          title="Multimodal summary"
          subtitle={
            data.source === 'api' ? 'Derived from API metadata' : 'Placeholder copy'
          }
        />
        <p className="text-sm leading-relaxed text-slate-700">
          {data.multimodalSummary}
        </p>
      </Card>
    </div>
  )
}
