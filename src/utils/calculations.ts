import type {
  DailyBreakdownPoint,
  Earning,
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
        description: 'Rapido Earning',
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
