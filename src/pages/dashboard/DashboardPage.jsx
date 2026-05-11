import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Loader from '../../components/ui/Loader.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import {
  getApiV1Health,
  getAppInfo,
  getApiErrorMessage,
  listVideos,
  listAnalysisJobs,
} from '../../services/index.js'

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [metricsError, setMetricsError] = useState(null)
  const [totals, setTotals] = useState({
    videos: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    queued: 0,
    allJobs: 0,
  })
  const [recentJobRows, setRecentJobRows] = useState([])
  const [apiHealth, setApiHealth] = useState(null)
  const [apiApp, setApiApp] = useState(null)
  const [apiHealthError, setApiHealthError] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getApiV1Health(), getAppInfo()]).then((results) => {
      if (cancelled) return
      const [hRes, appRes] = results
      if (hRes.status === 'fulfilled') setApiHealth(hRes.value)
      if (appRes.status === 'fulfilled') setApiApp(appRes.value)
      if (hRes.status === 'rejected' && appRes.status === 'rejected') {
        setApiHealthError(
          [hRes.reason, appRes.reason].map(getApiErrorMessage).join(' · '),
        )
      } else {
        setApiHealthError(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const base = { limit: 1, skip: 0 }

    Promise.allSettled([
      listVideos({
        ...base,
        exclude_session_placeholders: true,
      }),
      listAnalysisJobs({ ...base, status: 'completed' }),
      listAnalysisJobs({ ...base, status: 'processing' }),
      listAnalysisJobs({ ...base, status: 'failed' }),
      listAnalysisJobs({ ...base, status: 'queued' }),
      listAnalysisJobs({ ...base, status: 'all', limit: 8 }),
    ]).then((results) => {
      if (cancelled) return

      const pickTotal = (i) =>
        results[i].status === 'fulfilled' ? results[i].value.total : 0
      const recentRes = results[5]

      if (results.every((r) => r.status === 'rejected')) {
        setMetricsError(
          results.map((r) => getApiErrorMessage(r.reason)).join(' · '),
        )
        setTotals({
          videos: 0,
          completed: 0,
          processing: 0,
          failed: 0,
          queued: 0,
          allJobs: 0,
        })
        setRecentJobRows([])
      } else {
        const failedIdx = [0, 1, 2, 3, 4, 5].filter(
          (i) => results[i].status === 'rejected',
        )
        if (failedIdx.length > 0) {
          setMetricsError(
            `Some metrics failed to load (${failedIdx.length} request(s)).`,
          )
        } else {
          setMetricsError(null)
        }

        setTotals({
          videos: pickTotal(0),
          completed: pickTotal(1),
          processing: pickTotal(2),
          failed: pickTotal(3),
          queued: pickTotal(4),
          allJobs:
            recentRes.status === 'fulfilled' ? recentRes.value.total : 0,
        })

        if (recentRes.status === 'fulfilled') {
          setRecentJobRows(
            recentRes.value.items.map((j) => ({
              ...j,
              id: j.id,
              videoName: j.filename,
              submittedAt: j.submitted_at,
              duration: formatDurationSeconds(j.duration_seconds),
            })),
          )
        } else {
          setRecentJobRows([])
        }
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const successRate = useMemo(() => {
    const { completed, failed } = totals
    const denom = completed + failed
    if (denom <= 0) return null
    return Math.round((completed / denom) * 1000) / 10
  }, [totals])

  const stats = [
    {
      label: 'Total uploads',
      value: totals.videos,
      hint: 'Videos in library (after filters)',
    },
    {
      label: 'Completed analyses',
      value: totals.completed,
      hint: 'Jobs with status completed',
    },
    {
      label: 'Processing',
      value: totals.processing,
      hint: 'Active pipeline jobs',
    },
    {
      label: 'Failed',
      value: totals.failed,
      hint: 'Needs attention',
    },
  ]

  const columns = [
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
    {
      key: 'duration',
      label: 'Duration',
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Link
          to={`/analysis/${row.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Open
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor uploads, running jobs, and lab throughput at a glance."
        actions={
            <Link to="/upload">
              <Button type="button">New upload</Button>
            </Link>
        }
      />

      {metricsError ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900 ring-1 ring-amber-100">
          {metricsError}
        </p>
      ) : null}

      {loading ? (
        <Loader label="Loading dashboard metrics…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{s.hint}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader
                  title="Recent analysis jobs"
                  subtitle="Latest activity across the processing queue"
                />
                {recentJobRows.length === 0 ? (
                  <EmptyState
                    title="No jobs yet"
                    description="Upload a short clip to start your first multimodal analysis pipeline."
                    action={
                      <Link to="/upload">
                        <Button type="button">Upload video</Button>
                      </Link>
                    }
                  />
                ) : (
                  <DataTable columns={columns} rows={recentJobRows} />
                )}
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="API status"
                  subtitle="Backend liveness (GET /api/v1/health)"
                />
                {apiHealthError ? (
                  <p className="text-sm text-red-700">{apiHealthError}</p>
                ) : apiHealth ? (
                  <dl className="space-y-2 text-sm">
                    {apiApp ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-600">App (GET /)</dt>
                        <dd className="text-right font-medium text-slate-900">
                          {apiApp.app}
                        </dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Status</dt>
                      <dd className="font-medium text-emerald-700">
                        {apiHealth.status}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Version</dt>
                      <dd className="font-mono text-slate-900">
                        {apiHealth.version}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-slate-500">Checking…</p>
                )}
              </Card>
              <Card>
                <CardHeader title="Quick actions" />
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/upload"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Upload &amp; analyse
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/videos"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Browse library
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Export reports
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                </ul>
              </Card>
              <Card>
                <CardHeader
                  title="Queue snapshot"
                  subtitle="Derived from analysis job totals"
                />
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Jobs in queue</dt>
                    <dd className="font-medium text-slate-900">
                      {totals.queued}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Total jobs (tracked)</dt>
                    <dd className="font-medium text-slate-900">
                      {totals.allJobs}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">
                      Success rate (completed / (completed + failed))
                    </dt>
                    <dd className="font-medium text-slate-900">
                      {successRate != null ? `${successRate}%` : '—'}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
