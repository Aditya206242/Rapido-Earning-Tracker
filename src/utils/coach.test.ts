import { describe, expect, it } from 'vitest'
import { buildDailyBreakdown, buildFinancialSummary } from './calculations'
import {
  averageDailyProfitThisMonth,
  buildBestDayDetail,
  buildMonthlyProjection,
  buildSpendingBreakdown,
  buildTodayVsAverage,
  safeRatio,
} from './coach'
import type { Earning, Expense, PetrolEntry } from '@/types'

function earning(amount: number, date: string): Earning {
  return { id: crypto.randomUUID(), user_id: 'u1', amount, date, note: null, created_at: '', updated_at: '' }
}
function petrol(amount: number, date: string): PetrolEntry {
  return {
    id: crypto.randomUUID(),
    user_id: 'u1',
    amount,
    date,
    litres: null,
    price_per_litre: null,
    petrol_station: null,
    note: null,
    created_at: '',
    updated_at: '',
  }
}
function expense(amount: number, category: string, date: string): Expense {
  return { id: crypto.randomUUID(), user_id: 'u1', amount, category, date, note: null, created_at: '', updated_at: '' }
}

describe('safeRatio', () => {
  it('divides normally', () => {
    expect(safeRatio(70, 100)).toBe(0.7)
  })

  it('returns null instead of Infinity/NaN when the denominator is zero', () => {
    expect(safeRatio(50, 0)).toBeNull()
    expect(safeRatio(0, 0)).toBeNull()
  })
})

describe('averageDailyProfitThisMonth', () => {
  it('averages profit over active days only, ignoring zero-filled gap days', () => {
    const earnings = [earning(1000, '2026-09-01'), earning(2000, '2026-09-03')]
    const petrolEntries = [petrol(200, '2026-09-01'), petrol(200, '2026-09-03')]
    const breakdown = buildDailyBreakdown(earnings, petrolEntries, [], '2026-09-01', '2026-09-05')

    // Sep 1: profit 800, Sep 2: no activity (skipped), Sep 3: profit 1800 -> avg over 2 active days = 1300
    expect(averageDailyProfitThisMonth(breakdown, '2026-09-05')).toBe(1300)
  })

  it('returns null when there is no activity yet', () => {
    const breakdown = buildDailyBreakdown([], [], [], '2026-09-01', '2026-09-05')
    expect(averageDailyProfitThisMonth(breakdown, '2026-09-05')).toBeNull()
  })
})

describe('buildMonthlyProjection', () => {
  it('projects the month from the average daily profit', () => {
    const monthSummary = buildFinancialSummary([earning(1300, '2026-09-01')], [], [])
    const projection = buildMonthlyProjection(monthSummary, 1300, 30)
    expect(projection).toEqual({
      averageDailyProfit: 1300,
      monthProfitSoFar: 1300,
      estimatedMonthlyProfit: 39000,
      daysInMonth: 30,
    })
  })

  it('is null when there is no average yet', () => {
    const monthSummary = buildFinancialSummary([], [], [])
    expect(buildMonthlyProjection(monthSummary, null, 30)).toBeNull()
  })
})

describe('buildTodayVsAverage', () => {
  it('reports a positive difference when today beats the average', () => {
    const todaySummary = buildFinancialSummary([earning(1300, '2026-09-05')], [], [])
    const result = buildTodayVsAverage(todaySummary, 1120)
    expect(result?.difference).toBe(180)
    expect(result?.percentDifference).toBeCloseTo(180 / 1120)
  })

  it('is null when there is not enough history yet', () => {
    const todaySummary = buildFinancialSummary([earning(1300, '2026-09-05')], [], [])
    expect(buildTodayVsAverage(todaySummary, null)).toBeNull()
  })
})

describe('buildBestDayDetail', () => {
  it('looks up that date’s expenses and computes profit', () => {
    const detail = buildBestDayDetail(
      { date: '2026-09-12', amount: 2450 },
      [petrol(320, '2026-09-12'), petrol(50, '2026-09-11')],
      [expense(200, 'Food', '2026-09-12')],
    )
    expect(detail).toEqual({ date: '2026-09-12', earnings: 2450, expenses: 520, profit: 1930 })
  })
})

describe('buildSpendingBreakdown', () => {
  it('combines petrol with per-category expenses, sorted highest first', () => {
    const result = buildSpendingBreakdown(
      [petrol(450, '2026-09-01')],
      [expense(100, 'Food', '2026-09-01'), expense(50, 'Parking', '2026-09-01')],
    )
    expect(result.total).toBe(600)
    expect(result.largest).toEqual({ category: 'Petrol', amount: 450 })
    expect(result.items).toEqual([
      { category: 'Petrol', amount: 450 },
      { category: 'Food', amount: 100 },
      { category: 'Parking', amount: 50 },
    ])
  })

  it('omits the petrol line entirely when there is none', () => {
    const result = buildSpendingBreakdown([], [expense(100, 'Food', '2026-09-01')])
    expect(result.items).toEqual([{ category: 'Food', amount: 100 }])
  })
})
