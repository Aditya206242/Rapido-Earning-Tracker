import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { sendPasswordResetEmail } from '@/services/auth.service'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Check <span className="font-semibold">{email}</span> for a password reset link.
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-brand-600">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm font-medium text-loss-600">{error}</p>}
          <Button type="submit" fullWidth loading={loading}>
            Send Reset Link
          </Button>
          <Link to="/login" className="text-center text-sm font-medium text-brand-600">
            Back to login
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
