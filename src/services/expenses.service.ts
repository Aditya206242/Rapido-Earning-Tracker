import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types'

export interface ExpenseInput {
  amount: number
  category: string
  date: string
  note?: string | null
}

export async function fetchExpenses(userId: string, start?: string, end?: string) {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (start) query = query.gte('date', start)
  if (end) query = query.lte('date', end)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Expense[]
}

export async function createExpense(userId: string, input: ExpenseInput) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      amount: input.amount,
      category: input.category,
      date: input.date,
      note: input.note ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>) {
  const { data, error } = await supabase
    .from('expenses')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

const CUSTOM_CATEGORY_STORAGE_KEY = 'rapido_custom_expense_categories'

/** Custom categories are kept client-side (localStorage) — no schema change needed for v1. */
export function getCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addCustomCategory(category: string) {
  const existing = getCustomCategories()
  if (!existing.includes(category)) {
    localStorage.setItem(CUSTOM_CATEGORY_STORAGE_KEY, JSON.stringify([...existing, category]))
  }
}
