import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card, { CardHeader } from '../../components/ui/Card.jsx'
import Loader from '../../components/ui/Loader.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { getConsentPolicy, getApiErrorMessage } from '../../services/index.js'

export default function ConsentPage() {
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getConsentPolicy()
      .then((data) => {
        if (!cancelled) setPolicy(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Consent & ethics"
        description="Human-centric safeguards for automated audiovisual analysis in research settings."
      />

      {loading ? (
        <Loader label="Loading current policy from server…" />
      ) : null}

      {error ? (
        <ErrorState
          title="Could not load consent policy"
          message={error}
          onRetry={() => {
            setError(null)
            setLoading(true)
            getConsentPolicy()
              .then(setPolicy)
              .catch((e) => setError(getApiErrorMessage(e)))
              .finally(() => setLoading(false))
          }}
        />
      ) : null}

      {policy && !loading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={policy.title}
              subtitle={`Version ${policy.version} — required for registration before analysis`}
            />
            <p className="text-sm leading-relaxed text-slate-700">{policy.summary}</p>
          </Card>

          <Card>
            <CardHeader title="Full policy text" />
            <div className="max-h-[min(480px,70vh)] overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-200 whitespace-pre-wrap">
              {policy.full_text}
            </div>
          </Card>
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader
            title="Principles"
            subtitle="High-level commitments for this FYP deployment"
          />
          <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
            <li>Process only media covered by explicit, documented participant consent.</li>
            <li>Minimise retention; pseudonymise identifiers at ingest where possible.</li>
            <li>Restrict access to authorised lab members and audit exports.</li>
            <li>Provide clear participant information on automated inference risks.</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Data categories" />
          <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Purpose
                  </th>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Retention
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    Raw video / audio
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Feature extraction &amp; QA
                  </td>
                  <td className="px-4 py-3 text-slate-600">Project duration</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    Derived features
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    Modelling &amp; reporting
                  </td>
                  <td className="px-4 py-3 text-slate-600">As per ethics approval</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    Audit logs
                  </td>
                  <td className="px-4 py-3 text-slate-600">Security &amp; compliance</td>
                  <td className="px-4 py-3 text-slate-600">12 months rolling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Withdrawal & deletion" />
          <p className="text-sm leading-relaxed text-slate-700">
            Participants may withdraw consent in line with your faculty ethics
            process. Use the dashboard and reporting flows to track identifiers
            tied to registered sessions.
          </p>
        </Card>
      </div>
    </div>
  )
}
