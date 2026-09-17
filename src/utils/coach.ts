import type { DailyBreakdownPoint, Expense, FinancialSummary, PetrolEntry } from '@/types'
import { groupExpensesByCategory, sumAmounts, type CategoryTotal } from './calculations'

/**
 * Pure, Coach-specific derivations. These only compose the app's existing
 * financial primitives (calculations.ts / date.ts) — they never re-derive a
 * total, expense, or profit figure from raw rows.
 */

/** a / b, or null when b is 0 — avoids NaN/Infinity showing up as a fake number. */
export function safeRatio(a: number, b: number): number | null {
  if (b === 0) return null
  return a / b
}

/**
 * This month's average daily profit, counted only over "active" days so far
 * (days with any earnings/petrol/expense entry, up to and including today) —
 * mirrors calculateAverageDailyEarning's "divide by active days, not calendar
 * days" convention, applied to profit instead of earnings.
 */
export function averageDailyProfitThisMonth(dailyBreakdown: DailyBreakdownPoint[], today: string): number | null {
  const activePoints = dailyBreakdown.filter(
    (point) => point.date <= today && (point.earnings > 0 || point.petrol > 0 || point.otherExpenses > 0),
  )
  if (activePoints.length === 0) return null
  const totalProfit = activePoints.reduce((sum, point) => sum + point.profit, 0)
  return totalProfit / activePoints.length
}

export interface MonthlyProjection {
  averageDailyProfit: number
  monthProfitSoFar: number
  estimatedMonthlyProfit: number
  daysInMonth: number
}

/** Projects the full month's profit from the average daily profit seen so far. Null when there's no data yet. */
export function buildMonthlyProjection(
  monthSummary: FinancialSummary,
  avgDailyProfit: number | null,
  daysInMonth: number,
): MonthlyProjection | null {
  if (avgDailyProfit === null) return null
  return {
    averageDailyProfit: avgDailyProfit,
    monthProfitSoFar: monthSummary.netProfit,
    estimatedMonthlyProfit: avgDailyProfit * daysInMonth,
    daysInMonth,
  }
}

export interface TodayVsAverage {
  todayProfit: number
  averageDailyProfit: number
  difference: number
  percentDifference: number | null
}

/** Compares today's profit to the running average daily profit. Null when there's not enough history yet. */
export function buildTodayVsAverage(todaySummary: FinancialSummary, avgDailyProfit: number | null): TodayVsAverage | null {
  if (avgDailyProfit === null) return null
  const difference = todaySummary.netProfit - avgDailyProfit
  return {
    todayProfit: todaySummary.netProfit,
    averageDailyProfit: avgDailyProfit,
    difference,
    percentDifference: safeRatio(difference, Math.abs(avgDailyProfit)),
  }
}

export interface BestDayDetail {
  date: string
  earnings: number
  expenses: number
  profit: number
}

/** Looks up that one date's petrol/expenses so the best-earning-day answer can also show expenses & profit. */
export function buildBestDayDetail(
  bestDay: { date: string; amount: number },
  allPetrolEntries: PetrolEntry[],
  allExpenses: Expense[],
): BestDayDetail {
  const petrolOnDay = sumAmounts(allPetrolEntries.filter((p) => p.date === bestDay.date))
  const otherOnDay = sumAmounts(allExpenses.filter((x) => x.date === bestDay.date))
  const expenses = petrolOnDay + otherOnDay
  return {
    date: bestDay.date,
    earnings: bestDay.amount,
    expenses,
    profit: bestDay.amount - expenses,
  }
}

export interface SpendingBreakdown {
  items: CategoryTotal[]
  total: number
  largest: CategoryTotal | null
}

/** Combines petrol (as one line) with the existing per-category expense grouping, sorted highest first. */
export function buildSpendingBreakdown(petrolEntries: PetrolEntry[], expenses: Expense[]): SpendingBreakdown {
  const petrolTotal = sumAmounts(petrolEntries)
  const items = [
    ...(petrolTotal > 0 ? [{ category: 'Petrol', amount: petrolTotal }] : []),
    ...groupExpensesByCategory(expenses),
  ].sort((a, b) => b.amount - a.amount)

  return {
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
    largest: items[0] ?? null,
  }
}
