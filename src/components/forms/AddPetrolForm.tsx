import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { createPetrolEntry, updatePetrolEntry } from '@/services/petrol.service'
import { validateAmount, validateDate, validateOptionalPositiveNumber } from '@/utils/validation'
import { todayISO } from '@/utils/date'
import type { PetrolEntry } from '@/types'

interface AddPetrolFormProps {
  initial?: PetrolEntry
  onSuccess: () => void
}

export function AddPetrolForm({ initial, onSuccess }: AddPetrolFormProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [litres, setLitres] = useState(initial?.litres != null ? String(initial.litres) : '')
  const [pricePerLitre, setPricePerLitre] = useState(
    initial?.price_per_litre != null ? String(initial.price_per_litre) : '',
  )
  const [station, setStation] = useState(initial?.petrol_station ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<{ amount?: string; date?: string; litres?: string; price?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountCheck = validateAmount(amount)
    const dateCheck = validateDate(date)
    const litresCheck = validateOptionalPositiveNumber(litres)
    const priceCheck = validateOptionalPositiveNumber(pricePerLitre)
    if (!amountCheck.valid || !dateCheck.valid || !litresCheck.valid || !priceCheck.valid) {
      setErrors({
        amount: amountCheck.error,
        date: dateCheck.error,
        litres: litresCheck.error,
        price: priceCheck.error,
      })
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
      const payload = {
        amount: Number(amount),
        date,
        litres: litres.trim() ? Number(litres) : null,
        price_per_litre: pricePerLitre.trim() ? Number(pricePerLitre) : null,
        petrol_station: station.trim() || null,
        note: note.trim() || null,
      }
      if (initial) {
        await updatePetrolEntry(initial.id, payload)
        toast.success('Petrol entry updated')
      } else {
        await createPetrolEntry(user.id, payload)
        toast.success('Petrol expense added')
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save petrol entry')
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
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Litres (optional)"
          type="number"
          inputMode="decimal"
          placeholder="0.0"
          value={litres}
          onChange={(e) => setLitres(e.target.value)}
          error={errors.litres}
        />
        <Input
          label="Price/Litre (optional)"
          type="number"
          inputMode="decimal"
          prefix="₹"
          placeholder="0"
          value={pricePerLitre}
          onChange={(e) => setPricePerLitre(e.target.value)}
          error={errors.price}
        />
      </div>
      <Input
        label="Petrol Station (optional)"
        type="text"
        placeholder="e.g. HP Petrol Pump"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      />
      <Input
        label="Note (optional)"
        type="text"
        placeholder="e.g. Morning petrol"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" fullWidth size="lg" variant="danger" loading={submitting}>
        {initial ? 'Save Changes' : 'Add Petrol'}
      </Button>
    </form>
  )
}
