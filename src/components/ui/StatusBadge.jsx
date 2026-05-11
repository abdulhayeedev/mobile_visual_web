const styles = {
  completed:
    'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
  processing: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  queued: 'bg-slate-100 text-slate-700 ring-slate-500/10',
  failed: 'bg-red-50 text-red-800 ring-red-600/15',
}

export default function StatusBadge({ status }) {
  const label =
    status === 'completed'
      ? 'Completed'
      : status === 'processing'
        ? 'Processing'
        : status === 'queued'
          ? 'Queued'
          : status === 'failed'
            ? 'Failed'
            : status

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[status] || 'bg-slate-100 text-slate-700 ring-slate-500/10',
      ].join(' ')}
    >
      {label}
    </span>
  )
}
