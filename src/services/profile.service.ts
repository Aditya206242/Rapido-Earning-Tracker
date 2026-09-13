import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export interface ProfileInput {
  name?: string | null
  mobile?: string | null
  upi_id?: string | null
  qr_image_url?: string | null
  avatar_url?: string | null
  daily_reminder_enabled?: boolean
  timezone?: string
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}

/** Creates the profile row on first login, or updates it if it already exists. */
export async function upsertProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, ...input, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

const QR_BUCKET = 'qr-codes'
const AVATAR_BUCKET = 'avatars'

async function uploadImage(bucket: string, userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'png'
  const path = `${userId}/${bucket}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function uploadQrImage(userId: string, file: File) {
  return uploadImage(QR_BUCKET, userId, file)
}

export function uploadAvatarImage(userId: string, file: File) {
  return uploadImage(AVATAR_BUCKET, userId, file)
}
