import { useMemo } from 'react'
import { Inbox } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionItem } from './TransactionItem'
import { formatDisplayDate } from '@/utils/date'
import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of transactions) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No transactions found"
        description="Try adjusting your filters, or add your first transaction."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([date, items]) => (
        <div key={date}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {formatDisplayDate(date)}
          </p>
          <Card className="px-4">
            {items.map((t) => (
              <TransactionItem key={`${t.type}-${t.id}`} transaction={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
