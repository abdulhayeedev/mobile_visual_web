import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { listAnalysisJobs, getApiErrorMessage } from '../../services/index.js'

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function formatDurationSeconds(sec) {
  if (sec == null || Number.isNaN(sec)) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'processing', label: 'Processing' },
  { id: 'queued', label: 'Queued' },
  { id: 'failed', label: 'Failed' },
]

export default function AnalysisJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const videoIdParam = searchParams.get('video_id')
  const videoIdNum =
    videoIdParam != null && videoIdParam !== ''
      ? Number.parseInt(videoIdParam, 10)
      : null
  const videoIdFilter =
    videoIdNum != null && Number.isFinite(videoIdNum) ? videoIdNum : null

  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 50

  const load = useCallback(
    async (nextSkip = 0) => {
      setLoading(true)
      setError(null)
      try {
        const res = await listAnalysisJobs({
          status: filter,
          video_id: videoIdFilter ?? undefined,
          skip: nextSkip,
          limit,
        })
        const mapped = res.items.map((j) => ({
          ...j,
          id: j.id,
          videoName: j.filename,
          submittedAt: j.submitted_at,
          duration: formatDurationSeconds(j.duration_seconds),
        }))
        setItems(
          nextSkip === 0 ? mapped : (prev) => [...prev, ...mapped],
        )
        setTotal(res.total)
      } catch (e) {
        setError(getApiErrorMessage(e))
        if (nextSkip === 0) setItems([])
      } finally {
        setLoading(false)
      }
    },
    [filter, videoIdFilter],
  )

  useEffect(() => {
    load(0)
  }, [load])

  const clearVideoFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('video_id')
    setSearchParams(next)
  }

  const columns = useMemo(
    () => [
      { key: 'job_ref', label: 'Job' },
      { key: 'videoName', label: 'Video' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'submittedAt',
        label: 'Submitted',
        render: (row) => formatTime(row.submittedAt),
      },
      { key: 'duration', label: 'Duration' },
      {
        key: 'has_results',
        label: 'Results',
        render: (row) => (row.has_results ? 'Yes' : '—'),
      },
      {
        key: 'actions',
        label: '',
        render: (row) => (
          <Link
            to={`/analysis/${row.id}`}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {row.has_results || row.status === 'completed'
              ? 'Results'
              : 'Open'}
          </Link>
        ),
      },
    ],
    [],
  )

  const hasMore = items.length < total

  return (
    <div>
      <PageHeader
        title="Analysis jobs"
        description="Track queued, running, and completed multimodal pipelines."
        actions={
          <Link to="/upload">
            <Button type="button">New job</Button>
          </Link>
        }
      />
      <Card>
        {videoIdFilter != null ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 ring-1 ring-indigo-100">
            <span>
              Filtered to jobs for video ID{' '}
              <span className="font-mono font-semibold">{videoIdFilter}</span>
            </span>
            <button
              type="button"
              onClick={clearVideoFilter}
              className="font-medium text-indigo-700 underline hover:text-indigo-600"
            >
              Clear filter
            </button>
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={[
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                filter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {loading && items.length === 0
            ? '…'
            : `${items.length} of ${total} jobs`}
        </p>

        {error ? (
          <ErrorState
            title="Could not load jobs"
            message={error}
            onRetry={() => load(0)}
          />
        ) : loading && items.length === 0 ? (
          <Loader label="Loading analysis jobs…" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={items}
              emptyMessage="No jobs match the current filters."
            />
            {hasMore ? (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => load(items.length)}
                >
                  {loading ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            ) : null}
            {loading && items.length > 0 ? (
              <p className="mt-3 text-center text-sm text-slate-500">
                Updating…
              </p>
            ) : null}
          </>
        )}
      </Card>
    </div>
  )
}
