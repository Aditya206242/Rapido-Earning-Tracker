import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { updatePassword } from '@/services/auth.service'
import { getAuthErrorMessage } from '@/utils/authErrors'

/** Landed on via the password reset email link (Supabase attaches a recovery session). */
export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      toast.success('Password updated. Please log in again.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Set New Password" subtitle="Choose a new password for your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          label="New Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm New Password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-loss-600">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Update Password
        </Button>
      </form>
    </AuthLayout>
  )
}
