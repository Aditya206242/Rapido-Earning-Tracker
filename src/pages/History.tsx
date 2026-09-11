import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useFinancialData } from '@/hooks/useFinancialData'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters, emptyFilters, type TransactionFilterState } from '@/components/transactions/TransactionFilters'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { AddEarningForm } from '@/components/forms/AddEarningForm'
import { AddPetrolForm } from '@/components/forms/AddPetrolForm'
import { AddExpenseForm } from '@/components/forms/AddExpenseForm'
import { buildTransactionList } from '@/utils/calculations'
import { deleteEarning } from '@/services/earnings.service'
import { deletePetrolEntry } from '@/services/petrol.service'
import { deleteExpense } from '@/services/expenses.service'
import type { Earning, Expense, PetrolEntry, Transaction } from '@/types'

export function History() {
  const { earnings, petrolEntries, expenses, loading, error, refresh } = useFinancialData()
  const [filters, setFilters] = useState<TransactionFilterState>(emptyFilters)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const allTransactions = useMemo(
    () => buildTransactionList(earnings, petrolEntries, expenses),
    [earnings, petrolEntries, expenses],
  )

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.category !== 'all' && t.category !== filters.category) return false
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo && t.date > filters.dateTo) return false
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase()
        const haystack = `${t.description} ${t.note ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [allTransactions, filters])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      if (deleting.type === 'earning') await deleteEarning(deleting.id)
      if (deleting.type === 'petrol') await deletePetrolEntry(deleting.id)
      if (deleting.type === 'expense') await deleteExpense(deleting.id)
      toast.success('Transaction deleted')
      setDeleting(null)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleEditSuccess() {
    setEditing(null)
    refresh()
  }

  if (loading) return <LoadingSpinner label="Loading history..." />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">History</h1>
        <p className="mt-1 text-sm text-slate-500">{filtered.length} transactions</p>
      </div>

      <TransactionFilters filters={filters} onChange={setFilters} />

      <TransactionList transactions={filtered} onEdit={setEditing} onDelete={setDeleting} />

      <Sheet open={editing?.type === 'earning'} onClose={() => setEditing(null)} title="Edit Earning">
        {editing?.type === 'earning' && (
          <AddEarningForm initial={editing.raw as Earning} onSuccess={handleEditSuccess} />
        )}
      </Sheet>
      <Sheet open={editing?.type === 'petrol'} onClose={() => setEditing(null)} title="Edit Petrol">
        {editing?.type === 'petrol' && (
          <AddPetrolForm initial={editing.raw as PetrolEntry} onSuccess={handleEditSuccess} />
        )}
      </Sheet>
      <Sheet open={editing?.type === 'expense'} onClose={() => setEditing(null)} title="Edit Expense">
        {editing?.type === 'expense' && (
          <AddExpenseForm initial={editing.raw as Expense} onSuccess={handleEditSuccess} />
        )}
      </Sheet>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete transaction?"
        message="This action cannot be undone. This transaction will be permanently removed."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
