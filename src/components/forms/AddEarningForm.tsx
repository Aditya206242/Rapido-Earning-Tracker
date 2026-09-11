import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { createEarning, updateEarning } from '@/services/earnings.service'
import { validateAmount, validateDate } from '@/utils/validation'
import { todayISO } from '@/utils/date'
import type { Earning } from '@/types'

interface AddEarningFormProps {
  initial?: Earning
  onSuccess: () => void
}

export function AddEarningForm({ initial, onSuccess }: AddEarningFormProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountCheck = validateAmount(amount)
    const dateCheck = validateDate(date)
    if (!amountCheck.valid || !dateCheck.valid) {
      setErrors({ amount: amountCheck.error, date: dateCheck.error })
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
      const payload = { amount: Number(amount), date, note: note.trim() || null }
      if (initial) {
        await updateEarning(initial.id, payload)
        toast.success('Earning updated')
      } else {
        await createEarning(user.id, payload)
        toast.success('Earning added')
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save earning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Amount"
        type="number"
        inputMode="decimal"
        prefix="₹"
        autoFocus
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />
      <Input
        label="Date"
        type="date"
        value={date}
        max={todayISO()}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <Input
        label="Note (optional)"
        type="text"
        placeholder="e.g. Rapido earning"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" fullWidth size="lg" variant="success" loading={submitting}>
        {initial ? 'Save Changes' : 'Add Earning'}
      </Button>
    </form>
  )
}
