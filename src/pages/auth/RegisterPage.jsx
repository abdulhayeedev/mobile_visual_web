import AuthLayout from '../../features/auth/components/AuthLayout.jsx'
import RegisterForm from '../../features/auth/components/RegisterForm.jsx'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Request access for the AV analysis lab environment."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
