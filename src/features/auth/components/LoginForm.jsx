import { Link, useLocation } from 'react-router-dom'
import Input from '../../../components/ui/Input.jsx'
import Button from '../../../components/ui/Button.jsx'
import { useLoginForm } from '../hooks/useLoginForm.js'

export default function LoginForm() {
  const location = useLocation()
  const showRegisteredHint = Boolean(location.state?.registeredEmail)
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    onSubmit,
  } = useLoginForm()

  return (
    <>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {showRegisteredHint ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">
            Account created — sign in with your email and password.
          </p>
        ) : null}
        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="you@university.ac.uk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-slate-500">
          Your session is saved locally so you stay signed in after refresh. Sign
          out to clear it on this device.
        </p>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{' '}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Register
        </Link>
      </p>
    </>
  )
}
