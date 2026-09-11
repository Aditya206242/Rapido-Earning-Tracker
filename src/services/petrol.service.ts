import { supabase } from '@/lib/supabase'
import type { PetrolEntry } from '@/types'

export interface PetrolInput {
  amount: number
  date: string
  litres?: number | null
  price_per_litre?: number | null
  petrol_station?: string | null
  note?: string | null
}

export async function fetchPetrolEntries(userId: string, start?: string, end?: string) {
  let query = supabase
    .from('petrol_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (start) query = query.gte('date', start)
  if (end) query = query.lte('date', end)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as PetrolEntry[]
}

export async function createPetrolEntry(userId: string, input: PetrolInput) {
  const { data, error } = await supabase
    .from('petrol_entries')
    .insert({
      user_id: userId,
      amount: input.amount,
      date: input.date,
      litres: input.litres ?? null,
      price_per_litre: input.price_per_litre ?? null,
      petrol_station: input.petrol_station ?? null,
      note: input.note ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as PetrolEntry
}

export async function updatePetrolEntry(id: string, input: Partial<PetrolInput>) {
  const { data, error } = await supabase
    .from('petrol_entries')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as PetrolEntry
}

export async function deletePetrolEntry(id: string) {
  const { error } = await supabase.from('petrol_entries').delete().eq('id', id)
  if (error) throw error
}
