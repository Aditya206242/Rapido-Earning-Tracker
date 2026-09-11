import { useState } from 'react'
import { Fuel, ReceiptText, TrendingUp } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { AddEarningForm } from '@/components/forms/AddEarningForm'
import { AddPetrolForm } from '@/components/forms/AddPetrolForm'
import { AddExpenseForm } from '@/components/forms/AddExpenseForm'

type ActiveForm = 'earning' | 'petrol' | 'expense' | null

const choices = [
  {
    key: 'earning' as const,
    title: 'Add Earning',
    description: 'Log money you earned today',
    icon: TrendingUp,
    iconBg: 'bg-profit-50 text-profit-600',
  },
  {
    key: 'petrol' as const,
    title: 'Add Petrol',
    description: 'Log fuel expense',
    icon: Fuel,
    iconBg: 'bg-loss-50 text-loss-600',
  },
  {
    key: 'expense' as const,
    title: 'Add Expense',
    description: 'Food, maintenance, parking & more',
    icon: ReceiptText,
    iconBg: 'bg-amber-50 text-amber-600',
  },
]

export function Add() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)

  function close() {
    setActiveForm(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Transaction</h1>
        <p className="mt-1 text-sm text-slate-500">Takes just a few seconds</p>
      </div>

      <div className="flex flex-col gap-3">
        {choices.map(({ key, title, description, icon: Icon, iconBg }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveForm(key)}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-semibold text-slate-900">{title}</span>
              <span className="block text-sm text-slate-500">{description}</span>
            </span>
          </button>
        ))}
      </div>

      <Sheet open={activeForm === 'earning'} onClose={close} title="Add Earning">
        <AddEarningForm onSuccess={close} />
      </Sheet>
      <Sheet open={activeForm === 'petrol'} onClose={close} title="Add Petrol">
        <AddPetrolForm onSuccess={close} />
      </Sheet>
      <Sheet open={activeForm === 'expense'} onClose={close} title="Add Expense">
        <AddExpenseForm onSuccess={close} />
      </Sheet>
    </div>
  )
}
