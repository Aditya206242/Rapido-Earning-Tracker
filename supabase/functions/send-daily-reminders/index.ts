// Supabase Edge Function: send-daily-reminders
//
// Triggered on a schedule (every ~15 minutes) by a pg_cron job — see
// ../../cron-setup.sql. On each run it finds every user whose local time is
// currently 10 PM in their own timezone, whose daily reminder is enabled,
// and who hasn't already been sent today's reminder — then sends a Web Push
// notification to every device (push_subscriptions row) they've registered.
//
// Required secrets (set via `supabase secrets set ...`, never in frontend code):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. "mailto:you@example.com")
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by the
// Supabase Edge Runtime for every function — do not set them manually.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { getLocalDateAndHour, isProfileDueForReminder } from '../_shared/reminder-schedule.ts'

const REMINDER_HOUR = 22 // 10 PM, in the user's own timezone
const NOTIFICATION_TITLE = 'ProfitGo Reminder 💰'
const NOTIFICATION_BODY = "Add today's earnings & expenses"

interface ProfileRow {
  id: string
  user_id: string
  timezone: string
  last_reminder_sent_date: string | null
}

interface PushSubscriptionRow {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT')

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return new Response(JSON.stringify({ error: 'Missing required environment secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const now = new Date()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, user_id, timezone, last_reminder_sent_date')
    .eq('daily_reminder_enabled', true)

  if (profilesError) {
    return new Response(JSON.stringify({ error: profilesError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const duePeople = (profiles ?? []).filter((p: ProfileRow) => isProfileDueForReminder(p, now, REMINDER_HOUR))

  let notificationsSent = 0
  let subscriptionsRemoved = 0
  const errors: string[] = []

  for (const profile of duePeople as ProfileRow[]) {
    const { localDate } = getLocalDateAndHour(profile.timezone || 'Asia/Kolkata', now)

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', profile.user_id)

    if (subsError) {
      errors.push(`user ${profile.user_id}: ${subsError.message}`)
      continue
    }

    const results = await Promise.allSettled(
      (subscriptions ?? []).map((sub: PushSubscriptionRow) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          JSON.stringify({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY, url: '/dashboard' }),
        ).then(
          () => ({ sub, ok: true as const }),
          (err) => ({ sub, ok: false as const, err }),
        ),
      ),
    )

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const outcome = result.value
      if (outcome.ok) {
        notificationsSent++
        continue
      }
      // 404/410 = the browser/OS has invalidated this subscription (uninstalled, expired, etc).
      const statusCode = outcome.err?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', outcome.sub.id)
        subscriptionsRemoved++
      } else {
        errors.push(`subscription ${outcome.sub.id}: ${outcome.err?.message ?? 'unknown error'}`)
      }
    }

    // Mark as sent for today even if the user had zero subscriptions, so we
    // don't keep re-checking them every 15 minutes for the rest of the hour.
    await supabase.from('profiles').update({ last_reminder_sent_date: localDate }).eq('id', profile.id)
  }

  return new Response(
    JSON.stringify({
      profilesChecked: profiles?.length ?? 0,
      profilesDue: duePeople.length,
      notificationsSent,
      subscriptionsRemoved,
      errors,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
