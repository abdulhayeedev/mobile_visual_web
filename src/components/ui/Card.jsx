export default function Card({ children, className = '', padding = true }) {
  return (
    <section
      className={[
        'rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80',
        padding ? 'p-5 sm:p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
