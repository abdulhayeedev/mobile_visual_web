import { Link } from 'react-router-dom'
import Input from '../../../components/ui/Input.jsx'
import Button from '../../../components/ui/Button.jsx'
import { useRegisterForm } from '../hooks/useRegisterForm.js'

export default function RegisterForm() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptedTerms,
    setAcceptedTerms,
    error,
    submitting,
    onSubmit,
  } = useRegisterForm()

  return (
    <>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          label="Full name"
          placeholder="Jane Researcher"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label="University email"
          placeholder="you@university.ac.uk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          label="Password"
          placeholder="8–128 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label="Confirm password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <label className="flex gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            I agree to the institutional data processing terms and consent
            workflow described in the{' '}
            <Link to="/consent" className="text-indigo-600 hover:underline">
              consent page
            </Link>
            .
          </span>
        </label>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Register'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have access?{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
