import { type FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import {
  addCustomCategory,
  createExpense,
  getCustomCategories,
  updateExpense,
} from '@/services/expenses.service'
import { validateAmount, validateDate } from '@/utils/validation'
import { todayISO } from '@/utils/date'
import { EXPENSE_CATEGORIES } from '@/types'
import type { Expense } from '@/types'

interface AddExpenseFormProps {
  initial?: Expense
  onSuccess: () => void
}

const NEW_CATEGORY_VALUE = '__new__'

export function AddExpenseForm({ initial, onSuccess }: AddExpenseFormProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<{ amount?: string; date?: string; category?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const allCategories = [...EXPENSE_CATEGORIES, ...getCustomCategories()]
  const isAddingCustom = category === NEW_CATEGORY_VALUE

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountCheck = validateAmount(amount)
    const dateCheck = validateDate(date)
    const finalCategory = isAddingCustom ? customCategory.trim() : category
    if (isAddingCustom && !finalCategory) {
      setErrors({ category: 'Enter a category name' })
      return
    }
    if (!amountCheck.valid || !dateCheck.valid) {
      setErrors({ amount: amountCheck.error, date: dateCheck.error })
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
      if (isAddingCustom) addCustomCategory(finalCategory)
      const payload = { amount: Number(amount), category: finalCategory, date, note: note.trim() || null }
      if (initial) {
        await updateExpense(initial.id, payload)
        toast.success('Expense updated')
      } else {
        await createExpense(user.id, payload)
        toast.success('Expense added')
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save expense')
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
      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
      >
        {allCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={NEW_CATEGORY_VALUE}>+ Add custom category</option>
      </Select>
      {isAddingCustom && (
        <Input
          label="New Category Name"
          type="text"
          placeholder="e.g. Insurance"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
        />
      )}
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
        placeholder="e.g. Chain lubrication"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" fullWidth size="lg" variant="danger" loading={submitting}>
        {initial ? 'Save Changes' : 'Add Expense'}
      </Button>
    </form>
  )
}
