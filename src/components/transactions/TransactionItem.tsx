import { Fuel, Pencil, ReceiptText, Trash2, Wallet } from 'lucide-react'
import { formatShortDate } from '@/utils/date'
import { formatSignedINR } from '@/utils/currency'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: () => void
  onDelete: () => void
}

const typeConfig = {
  earning: { icon: Wallet, iconBg: 'bg-profit-50 text-profit-600', sign: '+' as const },
  petrol: { icon: Fuel, iconBg: 'bg-loss-50 text-loss-600', sign: '-' as const },
  expense: { icon: ReceiptText, iconBg: 'bg-amber-50 text-amber-600', sign: '-' as const },
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const config = typeConfig[transaction.type]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3.5 last:border-0">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{transaction.description}</p>
        <p className="text-xs text-slate-500">
          {formatShortDate(transaction.date)}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-bold ${config.sign === '+' ? 'text-profit-600' : 'text-loss-600'}`}
      >
        {formatSignedINR(transaction.amount, config.sign)}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit transaction"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete transaction"
          className="rounded-lg p-2 text-slate-400 hover:bg-loss-50 hover:text-loss-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
