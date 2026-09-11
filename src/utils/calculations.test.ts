import { describe, expect, it } from 'vitest'
import { buildDailyBreakdown, buildFinancialSummary, buildTransactionList } from './calculations'
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
