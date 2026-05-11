import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { getApiErrorMessage } from '../../../services/apiClient.js'

export function useRegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError(null)
      const name = fullName.trim()
      if (name.length < 1 || name.length > 255) {
        setError('Full name must be between 1 and 255 characters.')
        return
      }
      if (password.length < 8 || password.length > 128) {
        setError('Password must be between 8 and 128 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (!acceptedTerms) {
        setError('Please accept the terms to continue.')
        return
      }
      setSubmitting(true)
      try {
        const data = await register({
          full_name: name,
          email: email.trim(),
          password,
        })
        const hasToken = !!(data?.access_token ?? data?.token)
        navigate(hasToken ? '/dashboard' : '/login', {
          replace: true,
          state: hasToken
            ? undefined
            : { registeredEmail: email.trim() },
        })
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setSubmitting(false)
      }
    },
    [
      fullName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
      register,
      navigate,
    ],
  )

  return {
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
  }
}
