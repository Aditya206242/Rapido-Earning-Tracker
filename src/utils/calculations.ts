import type {
  BestDayStats,
  DailyBreakdownPoint,
  Earning,
  EarningDay,
  Expense,
  FinancialSummary,
  PetrolEntry,
  Transaction,
} from '@/types'
import { eachDateInRange } from './date'

/**
 * Single source of truth for every financial formula in the app.
 * Nothing else should re-derive totals, expenses, or profit/loss status.
 */

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

export function calculateTotalExpenses(totalPetrol: number, totalOtherExpenses: number): number {
  return totalPetrol + totalOtherExpenses
}

export function calculateNetProfit(totalEarnings: number, totalExpenses: number): number {
  return totalEarnings - totalExpenses
}

export function profitStatus(netProfit: number): FinancialSummary['status'] {
  if (netProfit > 0) return 'PROFIT'
  if (netProfit < 0) return 'LOSS'
  return 'BREAK EVEN'
}

export function buildFinancialSummary(
  earnings: Earning[],
  petrolEntries: PetrolEntry[],
  expenses: Expense[],
): FinancialSummary {
  const totalEarnings = sumAmounts(earnings)
  const totalPetrol = sumAmounts(petrolEntries)
  const totalOtherExpenses = sumAmounts(expenses)
  const totalExpenses = calculateTotalExpenses(totalPetrol, totalOtherExpenses)
  const netProfit = calculateNetProfit(totalEarnings, totalExpenses)

  return {
    totalEarnings,
    totalPetrol,
    totalOtherExpenses,
    totalExpenses,
    netProfit,
    status: profitStatus(netProfit),
    earningCount: earnings.length,
    petrolCount: petrolEntries.length,
    expenseCount: expenses.length,
  }
}

/** Builds a per-day breakdown across a date range, filling gaps with zeroes so charts stay continuous. */
export function buildDailyBreakdown(
  earnings: Earning[],
  petrolEntries: PetrolEntry[],
  expenses: Expense[],
  start: string,
  end: string,
): DailyBreakdownPoint[] {
  const byDate = new Map<string, DailyBreakdownPoint>()
  for (const date of eachDateInRange(start, end)) {
    byDate.set(date, { date, earnings: 0, petrol: 0, otherExpenses: 0, expenses: 0, profit: 0 })
  }

  for (const e of earnings) {
    const point = byDate.get(e.date)
    if (point) point.earnings += e.amount
  }
  for (const p of petrolEntries) {
    const point = byDate.get(p.date)
    if (point) point.petrol += p.amount
  }
  for (const x of expenses) {
    const point = byDate.get(x.date)
    if (point) point.otherExpenses += x.amount
  }

  for (const point of byDate.values()) {
    point.expenses = calculateTotalExpenses(point.petrol, point.otherExpenses)
    point.profit = calculateNetProfit(point.earnings, point.expenses)
  }

  return Array.from(byDate.values())
}

/** Merges the three transaction sources into a single unified, newest-first list. */
export function buildTransactionList(
  earnings: Earning[],
  petrolEntries: PetrolEntry[],
  expenses: Expense[],
): Transaction[] {
  const transactions: Transaction[] = [
    ...earnings.map(
      (e): Transaction => ({
        id: e.id,
        type: 'earning',
        date: e.date,
        description: ' Earning',
        amount: e.amount,
        note: e.note,
        raw: e,
      }),
    ),
    ...petrolEntries.map(
      (p): Transaction => ({
        id: p.id,
        type: 'petrol',
        date: p.date,
        description: p.petrol_station?.trim() || 'Petrol',
        amount: p.amount,
        note: p.note,
        raw: p,
      }),
    ),
    ...expenses.map(
      (x): Transaction => ({
        id: x.id,
        type: 'expense',
        date: x.date,
        description: x.category,
        amount: x.amount,
        category: x.category,
        note: x.note,
        raw: x,
      }),
    ),
  ]

  return transactions.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return 0
  })
}

/** Keeps only earnings whose date falls within [start, end] inclusive (YYYY-MM-DD comparison). */
export function filterEarningsByRange(earnings: Earning[], start: string, end: string): Earning[] {
  return earnings.filter((e) => e.date >= start && e.date <= end)
}

/** Sums earnings onto each date they fall on — multiple entries on one date combine into a single total. */
export function groupEarningsByDate(earnings: Earning[]): Map<string, number> {
  const byDate = new Map<string, number>()
  for (const e of earnings) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount)
  }
  return byDate
}

/**
 * The single highest-earning day (same-date entries combined first).
 * Ties resolve to the most recent date. Null when there are no earnings.
 */
export function findBestEarningDay(earnings: Earning[]): EarningDay | null {
  const byDate = groupEarningsByDate(earnings)
  let best: EarningDay | null = null
  for (const [date, amount] of byDate) {
    if (!best || amount > best.amount || (amount === best.amount && date > best.date)) {
      best = { date, amount }
    }
  }
  return best
}

/**
 * Total earnings ÷ number of unique days that have at least one earning —
 * never divides by calendar days. Null when there are no earnings.
 */
export function calculateAverageDailyEarning(earnings: Earning[]): number | null {
  const byDate = groupEarningsByDate(earnings)
  if (byDate.size === 0) return null
  const total = Array.from(byDate.values()).reduce((sum, amount) => sum + amount, 0)
  return total / byDate.size
}

/** Combines best-day and average-daily-earning stats for one period (all time / this week / this month). */
export function buildBestDayStats(earnings: Earning[]): BestDayStats {
  const byDate = groupEarningsByDate(earnings)
  const activeDays = byDate.size
  const totalEarnings = Array.from(byDate.values()).reduce((sum, amount) => sum + amount, 0)

  return {
    bestDay: findBestEarningDay(earnings),
    averageDailyEarning: activeDays === 0 ? null : totalEarnings / activeDays,
    activeDays,
    totalEarnings,
  }
}
