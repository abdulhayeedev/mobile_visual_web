import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { listVideos, getApiErrorMessage } from '../../services/index.js'

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

export default function VideosPage() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 50

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(
    async (nextSkip = 0) => {
      setLoading(true)
      setError(null)
      try {
        const res = await listVideos({
          search: debouncedQ || undefined,
          exclude_session_placeholders: true,
          skip: nextSkip,
          limit,
        })
        setItems(
          nextSkip === 0 ? res.items : (prev) => [...prev, ...res.items],
        )
        setTotal(res.total)
      } catch (e) {
        setError(getApiErrorMessage(e))
        if (nextSkip === 0) setItems([])
      } finally {
        setLoading(false)
      }
    },
    [debouncedQ],
  )

  useEffect(() => {
    load(0)
  }, [load])

  const hasMore = items.length < total

  const columns = [
    { key: 'filename', label: 'File' },
    {
      key: 'size_display',
      label: 'Size',
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      render: (row) => formatTime(row.uploaded_at),
    },
    {
      key: 'duration_seconds',
      label: 'Duration',
      render: (row) =>
        row.duration_seconds != null && !Number.isNaN(row.duration_seconds)
          ? `${Math.floor(row.duration_seconds / 60)}:${String(Math.floor(row.duration_seconds % 60)).padStart(2, '0')}`
          : '—',
    },
    {
      key: 'last_job_status',
      label: 'Last job',
      render: (row) =>
        row.last_job_status ? (
          <StatusBadge status={row.last_job_status} />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'job_count',
      label: 'Jobs',
      render: (row) => row.job_count ?? 0,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Link
          to={`/jobs?video_id=${row.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          View jobs
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Videos"
        description="Library of ingested media available for analysis and reporting."
        actions={
          <Link to="/upload">
            <Button type="button">Upload</Button>
          </Link>
        }
      />
      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md flex-1">
            <Input
              id="video-search"
              placeholder="Search by filename…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search videos"
            />
          </div>
          <p className="text-sm text-slate-500">
            {loading && items.length === 0
              ? '…'
              : `${items.length} of ${total} shown`}
          </p>
        </div>

        {error ? (
          <ErrorState
            title="Could not load videos"
            message={error}
            onRetry={() => load(0)}
          />
        ) : loading && items.length === 0 ? (
          <Loader label="Loading videos…" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={items}
              emptyMessage="No videos match your search."
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
