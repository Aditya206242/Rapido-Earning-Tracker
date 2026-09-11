/**
 * Core domain types for ProfitGo.
 * Intentionally excludes any ride/distance/time metrics — this app tracks
 * money only (earnings, petrol, other expenses).
 */

export type TransactionType = 'earning' | 'petrol' | 'expense'

export interface Earning {
  id: string
  user_id: string
  amount: number
  date: string // ISO date string (YYYY-MM-DD)
  note: string | null
  created_at: string
  updated_at: string
}

export interface PetrolEntry {
  id: string
  user_id: string
  amount: number
  date: string
  litres: number | null
  price_per_litre: number | null
  petrol_station: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Bike Maintenance',
  'Puncture',
  'Parking',
  'Service',
  'Other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number] | string

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: ExpenseCategory
  date: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string | null
  mobile: string | null
  upi_id: string | null
  qr_image_url: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/** A unified shape used for history lists and PDF reports. */
export interface Transaction {
  id: string
  type: TransactionType
  date: string
  description: string
  amount: number // positive for earnings, positive magnitude for petrol/expense (sign applied at render time)
  category?: string | null
  note?: string | null
  /** The original record, kept for edit/delete actions in the History page. */
  raw: Earning | PetrolEntry | Expense
}

export interface FinancialSummary {
  totalEarnings: number
  totalPetrol: number
  totalOtherExpenses: number
  totalExpenses: number
  netProfit: number
  status: 'PROFIT' | 'LOSS' | 'BREAK EVEN'
  earningCount: number
  petrolCount: number
  expenseCount: number
}

export interface DailyBreakdownPoint {
  date: string
  earnings: number
  petrol: number
  otherExpenses: number
  expenses: number
  profit: number
}

/** A single day's combined earning total, used for best-day/average calculations. */
export interface EarningDay {
  date: string
  amount: number
}

/** Earnings-only performance stats for a period (all time / this week / this month). */
export interface BestDayStats {
  /** Highest-earning day in the period, or null if there are no earnings. Ties resolve to the most recent date. */
  bestDay: EarningDay | null
  /** Total earnings ÷ number of unique days with at least one earning. Null if there are no earnings. */
  averageDailyEarning: number | null
  /** Number of unique calendar dates with at least one earning in the period. */
  activeDays: number
  totalEarnings: number
}
