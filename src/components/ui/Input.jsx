export default function Input({
  id,
  label,
  hint,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={[
          'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '',
          inputClassName,
        ].join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          hint || error
            ? `${id}-desc`
            : undefined
        }
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-desc`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-desc`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
