-- =====================================================================
-- ProfitGo — Daily reminder scheduling setup
--
-- This schedules the `send-daily-reminders` Edge Function to run every
-- 15 minutes. The function itself figures out, per user, whether it's
-- currently 10 PM in *their* timezone and whether they've already been
-- sent today's reminder — running every 15 minutes just gives it enough
-- chances to catch everyone's 10 PM as it rolls through timezones.
--
-- Run this ONCE in the Supabase SQL Editor, AFTER you have:
--   1. Deployed the Edge Function:
--        supabase functions deploy send-daily-reminders
--   2. Set its secrets:
--        supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
--
-- Replace the two placeholders below before running:
--   <PROJECT_REF>   — your Supabase project ref (from Project Settings -> General)
--   <SERVICE_ROLE_KEY> — Project Settings -> API -> service_role key (SECRET — never
--                          put this in frontend code; it's fine here because this SQL
--                          runs entirely inside your own Postgres database)
-- =====================================================================

-- Required extensions (usually already enabled on Supabase projects).
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Store the service-role key as an encrypted secret rather than inlining it
-- in the cron job body, so it never shows up in plain text in `cron.job`.
select vault.create_secret('<SERVICE_ROLE_KEY>', 'profitgo_service_role_key');

select cron.schedule(
  'profitgo-send-daily-reminders',
  '*/15 * * * *', -- every 15 minutes, every day
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'profitgo_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To check it's registered:
--   select * from cron.job where jobname = 'profitgo-send-daily-reminders';
-- To see run history:
--   select * from cron.job_run_details order by start_time desc limit 20;
-- To remove it later:
--   select cron.unschedule('profitgo-send-daily-reminders');
