import { describe, expect, it } from 'vitest'
import {
  buildBestDayStats,
  buildDailyBreakdown,
  buildFinancialSummary,
  buildTransactionList,
  calculateAverageDailyEarning,
  filterEarningsByRange,
  findBestEarningDay,
  groupEarningsByDate,
} from './calculations'
import { currentMonthRange, resolvePresetRange, todayISO } from './date'
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

describe('buildFinancialSummary', () => {
  it('matches the spec sample data exactly', () => {
    const earnings = [earning(500, '2026-09-01'), earning(750, '2026-09-02'), earning(900, '2026-09-03')]
    const petrolEntries = [petrol(200, '2026-09-01'), petrol(250, '2026-09-02'), petrol(300, '2026-09-03')]
    const expenses = [expense(100, 'Food', '2026-09-01'), expense(80, 'Parking', '2026-09-02')]

    const summary = buildFinancialSummary(earnings, petrolEntries, expenses)

    expect(summary.totalEarnings).toBe(2150)
    expect(summary.totalPetrol).toBe(750)
    expect(summary.totalOtherExpenses).toBe(180)
    expect(summary.totalExpenses).toBe(930)
    expect(summary.netProfit).toBe(1220)
    expect(summary.status).toBe('PROFIT')
    expect(summary.earningCount).toBe(3)
    expect(summary.petrolCount).toBe(3)
    expect(summary.expenseCount).toBe(2)
  })

  it('reports LOSS when expenses exceed earnings', () => {
    const summary = buildFinancialSummary([earning(100, '2026-09-01')], [petrol(150, '2026-09-01')], [])
    expect(summary.netProfit).toBe(-50)
    expect(summary.status).toBe('LOSS')
  })

  it('reports BREAK EVEN when profit is exactly zero', () => {
    const summary = buildFinancialSummary([earning(100, '2026-09-01')], [petrol(100, '2026-09-01')], [])
    expect(summary.netProfit).toBe(0)
    expect(summary.status).toBe('BREAK EVEN')
  })

  it('handles empty data without errors', () => {
    const summary = buildFinancialSummary([], [], [])
    expect(summary.totalEarnings).toBe(0)
    expect(summary.netProfit).toBe(0)
    expect(summary.status).toBe('BREAK EVEN')
  })
})

describe('buildDailyBreakdown', () => {
  it('fills every date in range, including days with no transactions', () => {
    const earnings = [earning(500, '2026-09-01'), earning(900, '2026-09-03')]
    const breakdown = buildDailyBreakdown(earnings, [], [], '2026-09-01', '2026-09-03')

    expect(breakdown).toHaveLength(3)
    expect(breakdown[0]).toMatchObject({ date: '2026-09-01', earnings: 500, profit: 500 })
    expect(breakdown[1]).toMatchObject({ date: '2026-09-02', earnings: 0, profit: 0 })
    expect(breakdown[2]).toMatchObject({ date: '2026-09-03', earnings: 900, profit: 900 })
  })
})

describe('buildTransactionList', () => {
  it('merges and sorts all transaction types newest-first', () => {
    const list = buildTransactionList(
      [earning(500, '2026-09-01')],
      [petrol(200, '2026-09-03')],
      [expense(80, 'Food', '2026-09-02')],
    )
    expect(list.map((t) => t.date)).toEqual(['2026-09-03', '2026-09-02', '2026-09-01'])
    expect(list.map((t) => t.type)).toEqual(['petrol', 'expense', 'earning'])
  })
})

describe('groupEarningsByDate', () => {
  it('combines multiple earnings on the same date into a single total', () => {
    const byDate = groupEarningsByDate([
      earning(500, '2026-09-10'),
      earning(700, '2026-09-10'),
      earning(300, '2026-09-10'),
    ])
    expect(byDate.get('2026-09-10')).toBe(1500)
    expect(byDate.size).toBe(1)
  })
})

describe('findBestEarningDay', () => {
  it('picks the date with the highest combined total', () => {
    const best = findBestEarningDay([
      earning(500, '2026-09-01'),
      earning(700, '2026-09-01'),
      earning(300, '2026-09-01'), // 2026-09-01 = 1500
      earning(900, '2026-09-02'),
    ])
    expect(best).toEqual({ date: '2026-09-01', amount: 1500 })
  })

  it('breaks a tie by choosing the most recent date', () => {
    const best = findBestEarningDay([earning(1000, '2026-09-01'), earning(1000, '2026-09-05')])
    expect(best).toEqual({ date: '2026-09-05', amount: 1000 })
  })

  it('handles a single earning day', () => {
    expect(findBestEarningDay([earning(750, '2026-09-01')])).toEqual({ date: '2026-09-01', amount: 750 })
  })

  it('returns null when there are no earnings', () => {
    expect(findBestEarningDay([])).toBeNull()
  })
})

describe('calculateAverageDailyEarning', () => {
  it('divides by unique earning days, not calendar days', () => {
    // 8 distinct dates totalling 10,000 -> 1,250/day, even though one day has multiple entries
    const earnings = [
      earning(1800, '2026-09-01'),
      earning(1200, '2026-09-01'), // same day as above, combines to 3000
      earning(1000, '2026-09-02'),
      earning(1000, '2026-09-03'),
      earning(1000, '2026-09-04'),
      earning(1000, '2026-09-05'),
      earning(1000, '2026-09-06'),
      earning(1000, '2026-09-07'),
      earning(1000, '2026-09-08'), // 8th unique date
    ]
    expect(calculateAverageDailyEarning(earnings)).toBe(1250)
  })

  it('returns null when there are no earnings', () => {
    expect(calculateAverageDailyEarning([])).toBeNull()
  })

  it('returns the single day amount when there is only one earning day', () => {
    expect(calculateAverageDailyEarning([earning(500, '2026-09-01'), earning(250, '2026-09-01')])).toBe(750)
  })
})

describe('buildBestDayStats', () => {
  it('combines best day and average into one result', () => {
    const stats = buildBestDayStats([
      earning(500, '2026-09-01'),
      earning(700, '2026-09-01'),
      earning(300, '2026-09-01'),
      earning(900, '2026-09-02'),
    ])
    expect(stats.bestDay).toEqual({ date: '2026-09-01', amount: 1500 })
    expect(stats.totalEarnings).toBe(2400)
    expect(stats.activeDays).toBe(2)
    expect(stats.averageDailyEarning).toBe(1200)
  })

  it('returns an empty-state-friendly result when there are no earnings', () => {
    const stats = buildBestDayStats([])
    expect(stats).toEqual({ bestDay: null, averageDailyEarning: null, activeDays: 0, totalEarnings: 0 })
  })

  it('all-time totals are unaffected by earnings outside the current week/month', () => {
    // Two-year-old earning plus a today-dated one — all-time must see both regardless of period.
    const allTime = buildBestDayStats([earning(2000, '2024-01-15'), earning(500, todayISO())])
    expect(allTime.activeDays).toBe(2)
    expect(allTime.totalEarnings).toBe(2500)
    expect(allTime.bestDay).toEqual({ date: '2024-01-15', amount: 2000 })
  })
})

describe('period scoping (This Week / This Month) via filterEarningsByRange', () => {
  it('This Week stats only include earnings inside the current week, even across a month boundary', () => {
    const { start, end } = resolvePresetRange('week')
    const insideWeek = earning(400, start)
    const outsideWeek = earning(999999, '2000-01-01') // far outside any current week
    const stats = buildBestDayStats(filterEarningsByRange([insideWeek, outsideWeek], start, end))
    expect(stats.totalEarnings).toBe(400)
    expect(stats.bestDay?.date).toBe(start)
  })

  it('This Month stats only include earnings inside the current month', () => {
    const { start, end } = currentMonthRange()
    const insideMonth = earning(600, todayISO())
    const outsideMonth = earning(999999, '2000-01-01')
    const stats = buildBestDayStats(filterEarningsByRange([insideMonth, outsideMonth], start, end))
    expect(stats.totalEarnings).toBe(600)
    expect(stats.activeDays).toBe(1)
  })

  it('an earning that falls outside the requested range is excluded entirely', () => {
    const filtered = filterEarningsByRange(
      [earning(100, '2026-01-01'), earning(200, '2026-02-15'), earning(300, '2026-03-01')],
      '2026-02-01',
      '2026-02-28',
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].date).toBe('2026-02-15')
  })
})
