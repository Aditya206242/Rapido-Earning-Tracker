/**
 * Pure scheduling logic shared between the send-daily-reminders Edge Function
 * and its unit tests. Uses only standard Intl/Date APIs (no Deno-specific or
 * Node-specific globals), so this exact file runs correctly under both the
 * Deno Edge Runtime and Vitest — one source of truth, not a duplicated copy.
 */

export interface ReminderProfile {
  timezone: string
  last_reminder_sent_date: string | null
}

export interface LocalDateAndHour {
  localDate: string
  localHour: number
}

/** The current local date (YYYY-MM-DD) and hour (0-23) in the given IANA timezone. */
export function getLocalDateAndHour(timezone: string, now: Date): LocalDateAndHour {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const localDate = `${get('year')}-${get('month')}-${get('day')}`
  // Intl can format midnight as "24" instead of "0" depending on the runtime — normalize.
  const localHour = Number(get('hour')) % 24

  return { localDate, localHour }
}

/**
 * Whether this profile should be sent today's reminder right now: their
 * local time is currently the reminder hour, and they haven't already been
 * sent one today (compared in their own timezone, not the server's).
 */
export function isProfileDueForReminder(profile: ReminderProfile, now: Date, reminderHour: number): boolean {
  const { localDate, localHour } = getLocalDateAndHour(profile.timezone || 'Asia/Kolkata', now)
  return localHour === reminderHour && profile.last_reminder_sent_date !== localDate
}
