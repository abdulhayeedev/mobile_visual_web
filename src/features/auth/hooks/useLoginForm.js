import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { getApiErrorMessage } from '../../../services/apiClient.js'

export function useLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const pre = location.state?.registeredEmail
    if (typeof pre === 'string' && pre) setEmail(pre)
  }, [location.state?.registeredEmail])
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError(null)
      setSubmitting(true)
      try {
        await login({
          email: email.trim(),
          password,
        })
        const redirectTo =
          typeof location.state?.from === 'string' &&
          location.state.from.startsWith('/')
            ? location.state.from
            : '/dashboard'
        navigate(redirectTo, { replace: true })
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setSubmitting(false)
      }
    },
    [email, password, login, navigate, location.state?.from],
  )

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    onSubmit,
  }
}
