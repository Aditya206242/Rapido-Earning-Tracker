import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { validateRequired } from '@/utils/validation'
import type { Profile } from '@/types'

interface ProfileFormProps {
  profile: Profile | null
  onSave: (input: { name: string; mobile: string; upi_id: string }) => Promise<void>
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name ?? '')
  const [mobile, setMobile] = useState(profile?.mobile ?? '')
  const [upiId, setUpiId] = useState(profile?.upi_id ?? '')
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nameCheck = validateRequired(name, 'Name')
    if (!nameCheck.valid) {
      setErrors({ name: nameCheck.error })
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await onSave({ name: name.trim(), mobile: mobile.trim(), upi_id: upiId.trim() })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Input
        label="Mobile Number"
        type="tel"
        placeholder="10-digit mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <Input
        label="UPI ID"
        type="text"
        placeholder="yourname@upi"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
      />
      <Button type="submit" fullWidth loading={saving}>
        Save Profile
      </Button>
    </form>
  )
}
