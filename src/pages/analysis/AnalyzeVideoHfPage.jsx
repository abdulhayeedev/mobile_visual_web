import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { analyzeVideoHf, getApiErrorMessage } from '../../services/index.js'
import {
  isAllowedVideoFile,
  MAX_VIDEO_UPLOAD_BYTES,
  VIDEO_FILE_HELP,
} from '../../constants/apiLimits.js'
import {
  formatPredictionScore,
  heuristicFeatureEntries,
  humanizeMetricKey,
  formatMetricValue,
} from './analysisDisplayUtils.js'

export default function AnalyzeVideoHfPage() {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const onFiles = useCallback((list) => {
    const f = list?.[0]
    setFileError(null)
    setResult(null)
    setError(null)
    if (!f) return
    if (!isAllowedVideoFile(f)) {
      setFile(null)
      setFileError(VIDEO_FILE_HELP)
      return
    }
    setFile(f)
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    onFiles(e.dataTransfer.files)
  }

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const sortedPredictions = useMemo(() => {
    const p = result?.predictions
    if (!Array.isArray(p)) return []
    return [...p].sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
  }, [result])

  const heuristicRows = useMemo(
    () => heuristicFeatureEntries(result?.heuristic_features),
    [result],
  )

  const canRun = file && !loading

  const onRun = async () => {
    if (!canRun || !file) return
    setError(null)
    setResult(null)
    setUploadPct(0)
    setLoading(true)
    try {
      const data = await analyzeVideoHf(file, {
        onUploadProgress: (ev) => {
          if (ev.total) {
            setUploadPct(Math.round((ev.loaded / ev.total) * 100))
          }
        },
      })
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
      setUploadPct(0)
    }
  }

  const meta = result?.metadata

  return (
    <div>
      <PageHeader
        title="Video heuristics (HF path)"
        description="POST /api/v1/analyze-video-hf — rule-based features from early frames and demuxed audio. No database rows. Requires a signed-in session (Bearer token)."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Video file"
            subtitle={`Max ${Math.round(MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024))} MiB; same extensions as full analyze-video`}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={[
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
              dragOver
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300',
            ].join(' ')}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*,.mp4,.mov,.m4v,.webm,.avi,.mkv"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <p className="text-sm font-medium text-slate-900">Drop video here or click to choose</p>
            <p className="mt-1 text-xs text-slate-500">{VIDEO_FILE_HELP}</p>
          </div>
          {fileError ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {fileError}
            </p>
          ) : null}
          {file ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" disabled={!canRun} onClick={onRun}>
              Run heuristics
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setFile(null)
                setFileError(null)
                setResult(null)
                setError(null)
              }}
            >
              Clear
            </Button>
          </div>
          {loading ? (
            <div className="mt-4">
              <Loader
                label={
                  uploadPct > 0
                    ? `Uploading… ${uploadPct}%`
                    : 'Uploading and analysing…'
                }
              />
            </div>
          ) : null}
          {error ? (
            <div className="mt-4">
              <ErrorState title="Request failed" message={error} />
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          {file && previewUrl ? (
            <Card>
              <CardHeader title="Preview" />
              <div className="aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-slate-900/10">
                <video
                  className="h-full w-full object-contain"
                  src={previewUrl}
                  controls
                  muted
                >
                  <track kind="captions" />
                </video>
              </div>
            </Card>
          ) : null}

          {result ? (
            <Card>
              <CardHeader
                title="Response"
                subtitle={
                  result.type === 'video'
                    ? `${result.frames_analyzed ?? 0} frames analysed (heuristic path)`
                    : 'Result'
                }
              />
              {meta && typeof meta === 'object' ? (
                <dl className="mb-6 grid gap-2 text-sm sm:grid-cols-2">
                  {[
                    ['Duration (s)', meta.duration],
                    ['FPS', meta.fps],
                    ['Frames', meta.num_frames],
                    ['Sampled', meta.num_frames_sampled],
                    ['Size', `${meta.width ?? '—'}×${meta.height ?? '—'}`],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                    >
                      <dt className="text-slate-600">{k}</dt>
                      <dd className="font-mono text-slate-900">
                        {typeof v === 'number' && !Number.isNaN(v)
                          ? Number.isInteger(v)
                            ? v
                            : Number(v.toFixed(2))
                          : v ?? '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {heuristicRows.length ? (
                <div className="mb-6">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Heuristic features
                  </p>
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    {heuristicRows.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-2 rounded-lg bg-indigo-50/60 px-3 py-2 ring-1 ring-indigo-100/80"
                      >
                        <dt className="text-slate-700">{humanizeMetricKey(k)}</dt>
                        <dd className="shrink-0 font-mono text-slate-900">
                          {formatMetricValue(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Predictions
              </p>
              <ul className="space-y-2">
                {sortedPredictions.length ? (
                  sortedPredictions.map((row, i) => (
                    <li
                      key={`${row.label}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-100"
                    >
                      <span className="font-medium text-slate-900">{row.label}</span>
                      <span className="shrink-0 font-mono text-indigo-700">
                        {formatPredictionScore(row.score)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No predictions in response.</li>
                )}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
