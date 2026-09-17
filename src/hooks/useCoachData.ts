import { useMemo } from 'react'
import { useFinancialData } from './useFinancialData'
import { buildBestDayStats, buildDailyBreakdown, buildFinancialSummary } from '@/utils/calculations'
import { averageDailyProfitThisMonth } from '@/utils/coach'
import { currentMonthRange, eachDateInRange, todayISO } from '@/utils/date'
import type { Earning, Expense, PetrolEntry } from '@/types'

export interface CoachData {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  today: string
  monthEarnings: Earning[]
  monthPetrolEntries: PetrolEntry[]
  monthExpenses: Expense[]
  allEarnings: Earning[]
  allPetrolEntries: PetrolEntry[]
  allExpenses: Expense[]
  todaySummary: ReturnType<typeof buildFinancialSummary>
  monthSummary: ReturnType<typeof buildFinancialSummary>
  daysInMonth: number
  averageDailyProfit: number | null
  bestDay: ReturnType<typeof buildBestDayStats>['bestDay']
}

/**
 * Coach's single data source. Reuses useFinancialData exactly the way
 * Dashboard.tsx does (a month-range call plus an all-time call) and derives
 * everything else through calculations.ts/coach.ts — no new Supabase queries,
 * no re-derived totals.
 */
export function useCoachData(): CoachData {
  const { start, end } = currentMonthRange()
  const today = todayISO()

  const {
    earnings: monthEarnings,
    petrolEntries: monthPetrolEntries,
    expenses: monthExpenses,
    loading: monthLoading,
    error: monthError,
    refresh: refreshMonth,
  } = useFinancialData(start, end)

  const {
    earnings: allEarnings,
    petrolEntries: allPetrolEntries,
    expenses: allExpenses,
    loading: allLoading,
    error: allError,
    refresh: refreshAll,
  } = useFinancialData()

  const todaySummary = useMemo(
    () =>
      buildFinancialSummary(
        monthEarnings.filter((e) => e.date === today),
        monthPetrolEntries.filter((p) => p.date === today),
        monthExpenses.filter((x) => x.date === today),
      ),
    [monthEarnings, monthPetrolEntries, monthExpenses, today],
  )

  const monthSummary = useMemo(
    () => buildFinancialSummary(monthEarnings, monthPetrolEntries, monthExpenses),
    [monthEarnings, monthPetrolEntries, monthExpenses],
  )

  const daysInMonth = useMemo(() => eachDateInRange(start, end).length, [start, end])

  const averageDailyProfit = useMemo(() => {
    const breakdown = buildDailyBreakdown(monthEarnings, monthPetrolEntries, monthExpenses, start, end)
    return averageDailyProfitThisMonth(breakdown, today)
  }, [monthEarnings, monthPetrolEntries, monthExpenses, start, end, today])

  const bestDay = useMemo(() => buildBestDayStats(allEarnings).bestDay, [allEarnings])

  async function refresh() {
    await Promise.all([refreshMonth(), refreshAll()])
  }

  return {
    loading: monthLoading || allLoading,
    error: monthError ?? allError,
    refresh,
    today,
    monthEarnings,
    monthPetrolEntries,
    monthExpenses,
    allEarnings,
    allPetrolEntries,
    allExpenses,
    todaySummary,
    monthSummary,
    daysInMonth,
    averageDailyProfit,
    bestDay,
  }
}
