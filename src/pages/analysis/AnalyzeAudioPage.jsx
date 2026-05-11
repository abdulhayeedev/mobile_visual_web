import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { analyzeAudio, getApiErrorMessage } from '../../services/index.js'
import {
  isAllowedAudioFile,
  MAX_AUDIO_UPLOAD_BYTES,
  AUDIO_FILE_HELP,
} from '../../constants/apiLimits.js'
import { formatPredictionScore } from './analysisDisplayUtils.js'

export default function AnalyzeAudioPage() {
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
    if (!isAllowedAudioFile(f)) {
      setFile(null)
      setFileError(AUDIO_FILE_HELP)
      return
    }
    setFile(f)
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    onFiles(e.dataTransfer.files)
  }

  const canRun = file && !loading

  const onRun = async () => {
    if (!canRun || !file) return
    setError(null)
    setResult(null)
    setUploadPct(0)
    setLoading(true)
    try {
      const data = await analyzeAudio(file, {
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

  const pred = result?.prediction

  return (
    <div>
      <PageHeader
        title="Audio classification (HF)"
        description="POST /api/v1/analyze-audio — Hugging Face audio-classification on the first portion of the file. Bearer auth required."
      />

      <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200/80">
        Uses the server ML stack (torch, torchaudio, transformers). A 503 response usually means
        the ML stack is not installed; install requirements-ml.txt on the API host.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Audio file"
            subtitle={`Max ${Math.round(MAX_AUDIO_UPLOAD_BYTES / (1024 * 1024))} MiB — WAV or FLAC`}
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
              accept=".wav,.flac,audio/wav,audio/flac,audio/x-flac"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <p className="text-sm font-medium text-slate-900">Drop audio here or click to choose</p>
            <p className="mt-1 text-xs text-slate-500">{AUDIO_FILE_HELP}</p>
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
              Classify audio
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
                    : 'Uploading and classifying…'
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

        {result ? (
          <Card>
            <CardHeader title="Response" subtitle={`Sample rate ${result.sample_rate ?? '—'} Hz`} />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-slate-600">Type</dt>
                <dd className="font-medium text-slate-900">{result.type}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-slate-600">Top label</dt>
                <dd className="text-right font-medium text-slate-900">
                  {pred?.label ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-slate-600">Score</dt>
                <dd className="font-mono text-indigo-700">
                  {formatPredictionScore(pred?.score)}
                </dd>
              </div>
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
