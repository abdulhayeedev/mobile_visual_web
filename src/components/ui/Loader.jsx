export default function Loader({ label = 'Loading', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
        aria-hidden
      />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  )
}
