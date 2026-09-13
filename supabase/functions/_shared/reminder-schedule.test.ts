import { describe, expect, it } from 'vitest'
import { getLocalDateAndHour, isProfileDueForReminder } from './reminder-schedule'

describe('getLocalDateAndHour', () => {
  it('computes 10 PM IST correctly from a UTC instant (IST is UTC+5:30)', () => {
    // 16:30 UTC + 5:30 = 22:00 IST, same calendar day
    const { localDate, localHour } = getLocalDateAndHour('Asia/Kolkata', new Date('2026-09-11T16:30:00Z'))
    expect(localHour).toBe(22)
    expect(localDate).toBe('2026-09-11')
  })

  it('rolls over to the next calendar day when the timezone offset pushes past midnight', () => {
    // 22:00 UTC + 5:30 = 03:30 the next day in IST
    const { localDate, localHour } = getLocalDateAndHour('Asia/Kolkata', new Date('2026-09-11T22:00:00Z'))
    expect(localHour).toBe(3)
    expect(localDate).toBe('2026-09-12')
  })

  it('the same UTC instant resolves to different local times in different timezones', () => {
    const now = new Date('2026-09-11T22:00:00Z')
    const utc = getLocalDateAndHour('UTC', now)
    const ist = getLocalDateAndHour('Asia/Kolkata', now)
    expect(utc.localHour).toBe(22)
    expect(ist.localHour).toBe(3)
  })
})

describe('isProfileDueForReminder', () => {
  const REMINDER_HOUR = 22
  const tenPmInKolkataUtc = new Date('2026-09-11T16:30:00Z') // = 22:00 Asia/Kolkata

  it('is due when local time is the reminder hour and nothing was sent today', () => {
    const due = isProfileDueForReminder(
      { timezone: 'Asia/Kolkata', last_reminder_sent_date: null },
      tenPmInKolkataUtc,
      REMINDER_HOUR,
    )
    expect(due).toBe(true)
  })

  it('is NOT due when local time is not the reminder hour', () => {
    const notYet = new Date('2026-09-11T10:00:00Z') // ~15:30 IST
    const due = isProfileDueForReminder(
      { timezone: 'Asia/Kolkata', last_reminder_sent_date: null },
      notYet,
      REMINDER_HOUR,
    )
    expect(due).toBe(false)
  })

  it('is NOT due again once already sent for that local date (prevents duplicates within the 10 PM hour)', () => {
    const due = isProfileDueForReminder(
      { timezone: 'Asia/Kolkata', last_reminder_sent_date: '2026-09-11' },
      tenPmInKolkataUtc,
      REMINDER_HOUR,
    )
    expect(due).toBe(false)
  })

  it('is due again on a new local day even if last_reminder_sent_date is set to a previous date', () => {
    const due = isProfileDueForReminder(
      { timezone: 'Asia/Kolkata', last_reminder_sent_date: '2026-09-10' },
      tenPmInKolkataUtc, // local date is 2026-09-11
      REMINDER_HOUR,
    )
    expect(due).toBe(true)
  })

  it('defaults to Asia/Kolkata when timezone is empty', () => {
    const due = isProfileDueForReminder({ timezone: '', last_reminder_sent_date: null }, tenPmInKolkataUtc, REMINDER_HOUR)
    expect(due).toBe(true)
  })

  it('evaluates two users in different timezones independently at the same instant', () => {
    const now = new Date('2026-09-11T22:00:00Z') // 22:00 UTC == 03:30 next day IST
    const utcUser = isProfileDueForReminder({ timezone: 'UTC', last_reminder_sent_date: null }, now, REMINDER_HOUR)
    const istUser = isProfileDueForReminder({ timezone: 'Asia/Kolkata', last_reminder_sent_date: null }, now, REMINDER_HOUR)
    expect(utcUser).toBe(true) // it's 22:00 in UTC
    expect(istUser).toBe(false) // it's 03:30 in IST, not their 10 PM yet
  })
})
