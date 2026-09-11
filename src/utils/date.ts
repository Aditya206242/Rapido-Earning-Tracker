import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'

/**
 * All dates in this app are stored and compared as plain 'YYYY-MM-DD' strings
 * (local calendar dates), never as full timestamps/UTC — this avoids
 * timezone-shift bugs where "today" could roll to yesterday/tomorrow.
 */

/** Today's date as YYYY-MM-DD in the user's local timezone. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Parses a YYYY-MM-DD string into a local Date object (midnight local time). */
export function parseLocalDate(isoDate: string): Date {
  return parseISO(isoDate)
}

/** Formats a YYYY-MM-DD string for display, e.g. "11 Sep 2026". */
export function formatDisplayDate(isoDate: string): string {
  return format(parseLocalDate(isoDate), 'dd MMM yyyy')
}

/** Formats a YYYY-MM-DD string for compact display, e.g. "11 Sep". */
export function formatShortDate(isoDate: string): string {
  return format(parseLocalDate(isoDate), 'dd MMM')
}

export type ReportPreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export interface DateRange {
  start: string
  end: string
}

/** Resolves a report preset into a concrete { start, end } ISO date range. */
export function resolvePresetRange(preset: ReportPreset): DateRange {
  const now = new Date()
  switch (preset) {
    case 'today': {
      const d = format(now, 'yyyy-MM-dd')
      return { start: d, end: d }
    }
    case 'yesterday': {
      const d = format(subDays(now, 1), 'yyyy-MM-dd')
      return { start: d, end: d }
    }
    case 'week': {
      return {
        start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      }
    }
    case 'month': {
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    }
    case 'custom':
    default:
      return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
  }
}

/** Current month's date range, used by the dashboard. */
export function currentMonthRange(): DateRange {
  const now = new Date()
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

/** Time-of-day greeting with a matching emoji: "Good morning ☀️" / "Good afternoon 🌤️" / "Good evening 🌆". */
export function timeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning ☀️'
  if (hour < 17) return 'Good afternoon 🌤️'
  return 'Good evening 🌆'
}

/** Builds an array of all YYYY-MM-DD dates between start and end (inclusive). */
export function eachDateInRange(start: string, end: string): string[] {
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end)
  const dates: string[] = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    dates.push(format(cursor, 'yyyy-MM-dd'))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}
