-- =====================================================================
-- ProfitGo — Supabase schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Table: profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text,
  mobile text,
  upi_id text,
  qr_image_url text,
  avatar_url text,
  daily_reminder_enabled boolean not null default false,
  timezone text not null default 'Asia/Kolkata',
  last_reminder_sent_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Columns added after the table's initial release — safe no-ops on a fresh create above.
alter table public.profiles add column if not exists daily_reminder_enabled boolean not null default false;
alter table public.profiles add column if not exists timezone text not null default 'Asia/Kolkata';
alter table public.profiles add column if not exists last_reminder_sent_date date;

create index if not exists idx_profiles_user_id on public.profiles (user_id);
-- Used by the daily-reminders Edge Function to cheaply find everyone who might be due.
create index if not exists idx_profiles_daily_reminder_enabled
  on public.profiles (daily_reminder_enabled)
  where daily_reminder_enabled = true;

-- ---------------------------------------------------------------------
-- Table: earnings
-- ---------------------------------------------------------------------
create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_earnings_user_id on public.earnings (user_id);
create index if not exists idx_earnings_user_date on public.earnings (user_id, date desc);

-- ---------------------------------------------------------------------
-- Table: petrol_entries
-- ---------------------------------------------------------------------
create table if not exists public.petrol_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  litres numeric(8, 2) check (litres is null or litres >= 0),
  price_per_litre numeric(8, 2) check (price_per_litre is null or price_per_litre >= 0),
  petrol_station text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_petrol_user_id on public.petrol_entries (user_id);
create index if not exists idx_petrol_user_date on public.petrol_entries (user_id, date desc);

-- ---------------------------------------------------------------------
-- Table: expenses
-- ---------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_user_id on public.expenses (user_id);
create index if not exists idx_expenses_user_date on public.expenses (user_id, date desc);

-- ---------------------------------------------------------------------
-- Table: push_subscriptions
-- One row per browser/device a user has enabled push notifications on.
-- Written by the client (via the authenticated anon key + RLS below);
-- read only by the send-daily-reminders Edge Function using the
-- service-role key, which bypasses RLS entirely and never runs client-side.
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions (user_id);

-- ---------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.earnings;
create trigger set_updated_at before update on public.earnings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.petrol_entries;
create trigger set_updated_at before update on public.petrol_entries
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.expenses;
create trigger set_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.push_subscriptions;
create trigger set_updated_at before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Row Level Security
-- Every table: a user may only SELECT / INSERT / UPDATE / DELETE rows
-- where user_id matches their own auth.uid(). No cross-user access.
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.earnings enable row level security;
alter table public.petrol_entries enable row level security;
alter table public.expenses enable row level security;
alter table public.push_subscriptions enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

-- earnings policies
drop policy if exists "earnings_select_own" on public.earnings;
create policy "earnings_select_own" on public.earnings
  for select using (auth.uid() = user_id);

drop policy if exists "earnings_insert_own" on public.earnings;
create policy "earnings_insert_own" on public.earnings
  for insert with check (auth.uid() = user_id);

drop policy if exists "earnings_update_own" on public.earnings;
create policy "earnings_update_own" on public.earnings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "earnings_delete_own" on public.earnings;
create policy "earnings_delete_own" on public.earnings
  for delete using (auth.uid() = user_id);

-- petrol_entries policies
drop policy if exists "petrol_select_own" on public.petrol_entries;
create policy "petrol_select_own" on public.petrol_entries
  for select using (auth.uid() = user_id);

drop policy if exists "petrol_insert_own" on public.petrol_entries;
create policy "petrol_insert_own" on public.petrol_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "petrol_update_own" on public.petrol_entries;
create policy "petrol_update_own" on public.petrol_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "petrol_delete_own" on public.petrol_entries;
create policy "petrol_delete_own" on public.petrol_entries
  for delete using (auth.uid() = user_id);

-- expenses policies
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- push_subscriptions policies
-- Note: the send-daily-reminders Edge Function reads this table with the
-- service_role key, which bypasses RLS entirely — these policies only
-- govern what the browser (anon key + logged-in user) can do.
drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Storage buckets for profile photo and UPI QR code images
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('qr-codes', 'qr-codes', true)
on conflict (id) do nothing;

-- Files are stored under a path prefixed with the owner's user id,
-- e.g. "<user_id>/avatars-<timestamp>.png", so ownership is enforced by
-- checking that the first path segment equals auth.uid().

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "qr_public_read" on storage.objects;
create policy "qr_public_read" on storage.objects
  for select using (bucket_id = 'qr-codes');

drop policy if exists "qr_owner_write" on storage.objects;
create policy "qr_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'qr-codes' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "qr_owner_update" on storage.objects;
create policy "qr_owner_update" on storage.objects
  for update using (
    bucket_id = 'qr-codes' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "qr_owner_delete" on storage.objects;
create policy "qr_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'qr-codes' and (storage.foldername(name))[1] = auth.uid()::text
  );
