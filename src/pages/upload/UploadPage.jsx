import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import {
  analyzeVideo,
  getConsentPolicy,
  getApiErrorMessage,
  registerConsent,
  getOrCreateSessionId,
  saveAnalysisSession,
  setStoredUserId,
} from '../../services/index.js'
import {
  isAllowedVideoFile,
  MAX_VIDEO_UPLOAD_BYTES,
  VIDEO_FILE_HELP,
} from '../../constants/apiLimits.js'

export default function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [consent, setConsent] = useState(false)

  const [policy, setPolicy] = useState(null)
  const [policyLoading, setPolicyLoading] = useState(true)
  const [policyError, setPolicyError] = useState(null)

  const [meta, setMeta] = useState({
    title: '',
    participantEmail: '',
    participantName: '',
    notes: '',
  })

  const [phase, setPhase] = useState('idle')
  const [uploadPct, setUploadPct] = useState(0)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getConsentPolicy()
      .then((data) => {
        if (!cancelled) setPolicy(data)
      })
      .catch((err) => {
        if (!cancelled) setPolicyError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setPolicyLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onFiles = useCallback((list) => {
    const f = list?.[0]
    setFileError(null)
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

  const emailValid = useMemo(() => {
    const s = meta.participantEmail.trim()
    if (!s) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
  }, [meta.participantEmail])

  const canSubmit =
    file &&
    consent &&
    policy &&
    emailValid &&
    meta.participantName.trim().length >= 1 &&
    phase === 'idle'

  const onStartAnalysis = async () => {
    if (!canSubmit || !file || !policy) return
    setActionError(null)
    setUploadPct(0)
    setPhase('consenting')
    try {
      const mobile_session_id = getOrCreateSessionId()
      const consentRes = await registerConsent({
        participant_email: meta.participantEmail.trim(),
        participant_name: meta.participantName.trim(),
        accepted: true,
        consent_version: policy.version,
        mobile_session_id,
      })
      setStoredUserId(consentRes.user_id)

      setPhase('analyzing')
      const analysis = await analyzeVideo(file, {
        onUploadProgress: (ev) => {
          if (ev.total) {
            setUploadPct(Math.round((ev.loaded / ev.total) * 100))
          }
        },
      })

      const jobId = analysis.job_id
      if (jobId == null || Number.isNaN(Number(jobId))) {
        throw new Error('Analysis response missing job_id')
      }

      const bundle = {
        analysis,
        consentRegister: consentRes,
        fileName: file.name,
        participantEmail: meta.participantEmail.trim(),
        videoId: analysis.video_id,
        jobId: analysis.job_id,
      }

      saveAnalysisSession(jobId, {
        ...bundle,
      })

      navigate(`/analysis/${jobId}`, {
        state: { bundle },
      })
    } catch (err) {
      setActionError(getApiErrorMessage(err))
      setPhase('idle')
      setUploadPct(0)
    }
  }

  return (
    <div>
      <PageHeader
        title="Upload video"
        description="Ingest short clips for facial, audio, and multimodal feature extraction."
      />

      {policyLoading ? (
        <div className="mb-6">
          <Loader label="Loading consent policy…" />
        </div>
      ) : null}

      {policyError ? (
        <div className="mb-6">
          <ErrorState
            title="Could not load consent policy"
            message={policyError}
            onRetry={() => {
              setPolicyError(null)
              setPolicyLoading(true)
              getConsentPolicy()
                .then(setPolicy)
                .catch((e) => setPolicyError(getApiErrorMessage(e)))
                .finally(() => {
                  setPolicyLoading(false)
                })
            }}
          />
        </div>
      ) : null}

      {policy && !policyLoading ? (
        <p className="mb-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <span className="font-medium text-slate-900">Policy v{policy.version}</span>
          {' — '}
          {policy.title}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="File"
            subtitle="Drag and drop or choose a file from your device"
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
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors',
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
            <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">
              Drop video here
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {`Max ${Math.round(MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024))} MiB — .mp4, .mov, .m4v, .webm, .avi, .mkv`}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-6 pointer-events-none"
              size="sm"
            >
              Choose file
            </Button>
          </div>

          {fileError ? (
            <p className="mt-4 text-sm text-red-700" role="alert">
              {fileError}
            </p>
          ) : null}

          {file ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Preview
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-black shadow-inner ring-1 ring-slate-900/10">
                <video
                  className="h-full w-full object-contain"
                  src={previewUrl || undefined}
                  controls
                  muted
                >
                  <track kind="captions" />
                </video>
              </div>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Metadata" subtitle="Participant and optional study fields" />
            <div className="space-y-4">
              <Input
                id="participantEmail"
                type="email"
                autoComplete="email"
                label="Participant email"
                placeholder="participant@example.com"
                value={meta.participantEmail}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, participantEmail: e.target.value }))
                }
              />
              <Input
                id="participantName"
                autoComplete="name"
                label="Participant name"
                placeholder="Display name (1–255 characters)"
                value={meta.participantName}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, participantName: e.target.value }))
                }
              />
              <Input
                id="title"
                label="Clip title (optional)"
                placeholder="e.g. Session A — baseline"
                value={meta.title}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, title: e.target.value }))
                }
              />
              <div>
                <label
                  htmlFor="notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Framing, lighting, or consent caveats"
                  value={meta.notes}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Consent" />
            <label className="flex gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                I confirm participants have provided appropriate consent for
                automated visual and audio analysis under our institutional
                ethics protocol, and that uploads exclude prohibited content. I
                have read policy version{' '}
                {policy ? (
                  <strong>{policy.version}</strong>
                ) : (
                  '…'
                )}
                .
              </span>
            </label>
            {actionError ? (
              <div className="mt-4">
                <ErrorState title="Request failed" message={actionError} />
              </div>
            ) : null}
            {phase === 'consenting' || phase === 'analyzing' ? (
              <div className="mt-4">
                <Loader
                  label={
                    phase === 'consenting'
                      ? 'Recording consent…'
                      : `Analysing video… ${uploadPct > 0 ? `${uploadPct}%` : ''}`
                  }
                />
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canSubmit || policyLoading || !!policyError}
                title={
                  !file
                    ? 'Select a video first'
                    : !consent
                      ? 'Confirm consent'
                      : !emailValid || !meta.participantName.trim()
                        ? 'Enter participant email and name'
                        : ''
                }
                onClick={onStartAnalysis}
              >
                Start analysis
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={phase !== 'idle'}
                onClick={() => {
                  setMeta({
                    title: '',
                    participantEmail: '',
                    participantName: '',
                    notes: '',
                  })
                  setFile(null)
                  setConsent(false)
                  setActionError(null)
                }}
              >
                Reset form
              </Button>
            </div>
            {!file ? (
              <p className="mt-3 text-xs text-slate-500">
                Select a file, enter participant details, and confirm consent.
                Consent is registered on the server before analysis runs.
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}
