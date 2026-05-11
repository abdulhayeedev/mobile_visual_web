import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { multimodalPredict, getApiErrorMessage } from '../../services/index.js'
import {
  isAllowedVideoFile,
  isAllowedAudioFile,
  VIDEO_FILE_HELP,
  AUDIO_FILE_HELP,
} from '../../constants/apiLimits.js'
import { summarizeNumberArray } from './analysisDisplayUtils.js'

export default function MultimodalPredictPage() {
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const [videoFile, setVideoFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [videoError, setVideoError] = useState(null)
  const [audioError, setAudioError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const onVideoFiles = useCallback((list) => {
    const f = list?.[0]
    setVideoError(null)
    setResult(null)
    setError(null)
    if (!f) return
    if (!isAllowedVideoFile(f)) {
      setVideoFile(null)
      setVideoError(VIDEO_FILE_HELP)
      return
    }
    setVideoFile(f)
  }, [])

  const onAudioFiles = useCallback((list) => {
    const f = list?.[0]
    setAudioError(null)
    setResult(null)
    setError(null)
    if (!f) return
    if (!isAllowedAudioFile(f)) {
      setAudioFile(null)
      setAudioError(AUDIO_FILE_HELP)
      return
    }
    setAudioFile(f)
  }, [])

  const previewUrl = useMemo(() => {
    if (!videoFile) return null
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const canRun = videoFile && audioFile && !loading

  const onRun = async () => {
    if (!canRun || !videoFile || !audioFile) return
    setError(null)
    setResult(null)
    setUploadPct(0)
    setLoading(true)
    try {
      const data = await multimodalPredict(
        { video: videoFile, audio: audioFile },
        {
          onUploadProgress: (ev) => {
            if (ev.total) {
              setUploadPct(Math.round((ev.loaded / ev.total) * 100))
            }
          },
        },
      )
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
      setUploadPct(0)
    }
  }

  return (
    <div>
      <PageHeader
        title="Multimodal predict"
        description="POST /api/v1/multimodal-predict — video + WAV/FLAC together (ephemeral; no DB). Requires ML stack on the server."
      />

      <p className="mb-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
        Video rules match analyse-video; audio is limited to{' '}
        <strong className="font-medium text-slate-900">.wav</strong> or{' '}
        <strong className="font-medium text-slate-900">.flac</strong> (max 20 MiB).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Video" subtitle="Same extensions as library upload" />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.m4v,.webm,.avi,.mkv"
            className="hidden"
            onChange={(e) => onVideoFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
          >
            Choose video
          </Button>
          {videoError ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {videoError}
            </p>
          ) : null}
          {videoFile ? (
            <p className="mt-2 text-sm text-slate-700">{videoFile.name}</p>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="Audio" subtitle="WAV or FLAC" />
          <input
            ref={audioInputRef}
            type="file"
            accept=".wav,.flac,audio/wav,audio/flac,audio/x-flac"
            className="hidden"
            onChange={(e) => onAudioFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => audioInputRef.current?.click()}
          >
            Choose audio
          </Button>
          {audioError ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {audioError}
            </p>
          ) : null}
          {audioFile ? (
            <p className="mt-2 text-sm text-slate-700">{audioFile.name}</p>
          ) : null}
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Run" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!canRun} onClick={onRun}>
                Run multimodal inference
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  setVideoFile(null)
                  setAudioFile(null)
                  setVideoError(null)
                  setAudioError(null)
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
                      : 'Uploading and inferring…'
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
        </div>

        {videoFile && previewUrl ? (
          <Card className="lg:col-span-2">
            <CardHeader title="Video preview" />
            <div className="mx-auto max-w-3xl">
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
            </div>
          </Card>
        ) : null}

        {result ? (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Response"
              subtitle={
                result.fusion_checkpoint_loaded
                  ? 'Fusion checkpoint loaded'
                  : 'Random fusion weights (no checkpoint on server)'
              }
            />
            <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Emotion class', result.emotion_class],
                ['Emotion label', result.emotion_label ?? '—'],
                ['Audio emotion class', result.audio_emotion_class],
                ['Video frames used', result.num_video_frames_used],
                ['Fusion checkpoint', result.fusion_checkpoint_loaded ? 'yes' : 'no'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                >
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="text-right font-mono text-slate-900">
                    {v === null || v === undefined ? '—' : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Fusion logits
                </p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900/5 p-3 font-mono text-xs text-slate-800 ring-1 ring-slate-200">
                  {summarizeNumberArray(result.fusion_logits ?? [])}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Audio logits
                </p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900/5 p-3 font-mono text-xs text-slate-800 ring-1 ring-slate-200">
                  {summarizeNumberArray(result.audio_logits ?? [])}
                </pre>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
