import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchExpenses } from '@/services/expenses.service'
import { fetchPetrolEntries } from '@/services/petrol.service'
import { fetchEarnings } from '@/services/earnings.service'
import type { Earning, Expense, PetrolEntry } from '@/types'

export interface FinancialData {
  earnings: Earning[]
  petrolEntries: PetrolEntry[]
  expenses: Expense[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Loads earnings, petrol entries, and expenses for the current user within an
 * optional date range. This is the single data-fetching hook every page
 * (Dashboard, History, Reports) builds on, so we only ever hit the DB once
 * per range change instead of duplicating queries across components.
 */
export function useFinancialData(start?: string, end?: string): FinancialData {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [petrolEntries, setPetrolEntries] = useState<PetrolEntry[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setEarnings([])
      setPetrolEntries([])
      setExpenses([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [earningsData, petrolData, expensesData] = await Promise.all([
        fetchEarnings(user.id, start, end),
        fetchPetrolEntries(user.id, start, end),
        fetchExpenses(user.id, start, end),
      ])
      setEarnings(earningsData)
      setPetrolEntries(petrolData)
      setExpenses(expensesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user, start, end])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { earnings, petrolEntries, expenses, loading, error, refresh }
}
