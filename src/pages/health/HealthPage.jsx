import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import Button from '../../components/ui/Button.jsx'
import {
  getApiV1Health,
  getAppInfo,
  getHealth,
  getApiErrorMessage,
} from '../../services/index.js'

function applyHealthResults(results, setters) {
  const { setRootHealth, setV1Health, setAppInfo, setError } = setters
  const [h0, h1, app] = results
  if (h0.status === 'fulfilled') setRootHealth(h0.value)
  else setRootHealth(null)
  if (h1.status === 'fulfilled') setV1Health(h1.value)
  else setV1Health(null)
  if (app.status === 'fulfilled') setAppInfo(app.value)
  else setAppInfo(null)
  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length === results.length) {
    setError(failed.map((r) => getApiErrorMessage(r.reason)).join(' · '))
  } else if (failed.length > 0) {
    setError(
      `Partial: ${failed.map((r) => getApiErrorMessage(r.reason)).join(' · ')}`,
    )
  } else {
    setError(null)
  }
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rootHealth, setRootHealth] = useState(null)
  const [v1Health, setV1Health] = useState(null)
  const [appInfo, setAppInfo] = useState(null)

  const fetchAll = useCallback(() => {
    return Promise.allSettled([
      getHealth(),
      getApiV1Health(),
      getAppInfo(),
    ])
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAll().then((results) => {
      if (cancelled) return
      applyHealthResults(results, {
        setRootHealth,
        setV1Health,
        setAppInfo,
        setError,
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [fetchAll])

  const onRefresh = useCallback(() => {
    setLoading(true)
    fetchAll().then((results) => {
      applyHealthResults(results, {
        setRootHealth,
        setV1Health,
        setAppInfo,
        setError,
      })
      setLoading(false)
    })
  }, [fetchAll])

  return (
    <div>
      <PageHeader
        title="API health"
        description="Backend liveness, versioned health, and app metadata from your configured API base URL."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {error ? (
        <div className="mb-6">
          <ErrorState title="Some checks failed" message={error} onRetry={onRefresh} />
        </div>
      ) : null}

      {loading && !rootHealth && !v1Health && !appInfo ? (
        <Loader label="Checking API…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="GET /health"
              subtitle="Load balancer–friendly liveness"
            />
            {rootHealth ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-medium text-emerald-700">{rootHealth.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Service</dt>
                  <dd className="text-right text-slate-900">{rootHealth.service}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Version</dt>
                  <dd className="font-mono text-slate-900">{rootHealth.version}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">No data</p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="GET /api/v1/health"
              subtitle="Versioned API liveness"
            />
            {v1Health ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-medium text-emerald-700">{v1Health.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Service</dt>
                  <dd className="text-right text-slate-900">{v1Health.service}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Version</dt>
                  <dd className="font-mono text-slate-900">{v1Health.version}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">No data</p>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="GET /" subtitle="Application identity" />
            {appInfo ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <dt className="text-slate-600">App</dt>
                  <dd className="font-medium text-slate-900">{appInfo.app}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <dt className="text-slate-600">Version</dt>
                  <dd className="font-mono text-slate-900">{appInfo.version}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">No data</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
