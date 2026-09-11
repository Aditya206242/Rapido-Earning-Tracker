import { supabase } from '@/lib/supabase'
import type { Earning } from '@/types'

export interface EarningInput {
  amount: number
  date: string
  note?: string | null
}

export async function fetchEarnings(userId: string, start?: string, end?: string) {
  let query = supabase
    .from('earnings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (start) query = query.gte('date', start)
  if (end) query = query.lte('date', end)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Earning[]
}

export async function createEarning(userId: string, input: EarningInput) {
  const { data, error } = await supabase
    .from('earnings')
    .insert({ user_id: userId, amount: input.amount, date: input.date, note: input.note ?? null })
    .select()
    .single()
  if (error) throw error
  return data as Earning
}

export async function updateEarning(id: string, input: Partial<EarningInput>) {
  const { data, error } = await supabase
    .from('earnings')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Earning
}

export async function deleteEarning(id: string) {
  const { error } = await supabase.from('earnings').delete().eq('id', id)
  if (error) throw error
}
