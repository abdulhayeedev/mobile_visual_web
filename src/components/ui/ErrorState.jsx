import Button from './Button.jsx'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 text-center"
      role="alert"
    >
      <p className="text-sm font-semibold text-red-900">{title}</p>
      {message ? (
        <p className="mt-1 text-sm text-red-800/90">{message}</p>
      ) : null}
      {onRetry ? (
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}
