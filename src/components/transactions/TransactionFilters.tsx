import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EXPENSE_CATEGORIES } from '@/types'
import { getCustomCategories } from '@/services/expenses.service'
import type { TransactionType } from '@/types'

export interface TransactionFilterState {
  search: string
  type: TransactionType | 'all'
  category: string | 'all'
  dateFrom: string
  dateTo: string
}

interface TransactionFiltersProps {
  filters: TransactionFilterState
  onChange: (filters: TransactionFilterState) => void
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const allCategories = [...EXPENSE_CATEGORIES, ...getCustomCategories()]

  function set<K extends keyof TransactionFilterState>(key: K, value: TransactionFilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search description or note..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="pl-11"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="From"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
        <Input label="To" type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" value={filters.type} onChange={(e) => set('type', e.target.value as TransactionFilterState['type'])}>
          <option value="all">All Types</option>
          <option value="earning">Earning</option>
          <option value="petrol">Petrol</option>
          <option value="expense">Expense</option>
        </Select>
        <Select label="Category" value={filters.category} onChange={(e) => set('category', e.target.value)}>
          <option value="all">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export const emptyFilters: TransactionFilterState = {
  search: '',
  type: 'all',
  category: 'all',
  dateFrom: '',
  dateTo: '',
}
