# ProfitGo

Your Daily Earnings & Expense Tracker — a simple, mobile-first financial tracker for
Rapido drivers. Tracks earnings, petrol expenses, and other expenses — and nothing
else. No kilometres, ride counts, driving time, or ride duration anywhere in the app,
by design.

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage, with Row Level Security)
- Recharts (charts)
- Lucide React (icons)
- jsPDF + jspdf-autotable (client-side PDF report generation)
- React Router, react-hot-toast

## Project Structure

```
src/
  components/    Reusable UI: dashboard cards/charts, transaction list, forms,
                 navigation, profile widgets, auth guard, generic ui/ primitives
  pages/         One component per route (Dashboard, Add, History, Reports, Profile,
                 Login, SignUp, ForgotPassword, ResetPassword)
  layouts/       AppLayout (sidebar + bottom nav shell), AuthLayout
  context/       AuthContext (Supabase session state)
  hooks/         useFinancialData, useProfile — centralized data fetching
  services/      Supabase queries, one file per table (earnings/petrol/expenses/
                 profile/auth), fully typed CRUD functions
  lib/           supabase client, PDF report generator
  utils/         calculations.ts (single source of truth for every financial
                 formula), currency.ts, date.ts, validation.ts
  types/         Shared TypeScript types
supabase/
  schema.sql     Full DB schema, indexes, RLS policies, storage buckets
  seed.sql       Optional sample data matching the spec's worked example
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then open
**SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
This creates the `profiles`, `earnings`, `petrol_entries`, and `expenses` tables,
all indexes, Row Level Security policies (every user can only read/write their own
rows), and the `avatars` / `qr-codes` storage buckets with owner-scoped policies.

### 3. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then open **Supabase Dashboard → Project Settings → API** and paste in:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Only the public **anon** key is ever used client-side — the service-role key is
never referenced anywhere in this codebase. Row Level Security is what actually
protects each user's data.

If `.env` is missing or empty, the app boots into a clear "Supabase setup required"
screen instead of crashing, so you'll always know what's missing.

### 4. (Optional) Load sample data

Sign up once through the app, find your user id under
**Supabase Dashboard → Authentication → Users**, paste it into
[`supabase/seed.sql`](supabase/seed.sql) in place of `YOUR_USER_ID`, and run it in
the SQL Editor. It seeds the exact worked example from the spec (₹2,150 earnings,
₹750 petrol, ₹180 other expenses → ₹1,220 net profit), which is also covered by the
automated test in `src/utils/calculations.test.ts`.

### 5. Run the dev server

```bash
npm run dev
```

Open the printed local URL, sign up, and start adding transactions.

## Other Commands

```bash
npm run build     # type-check (tsc -b) + production build to dist/
npm run preview   # preview the production build locally
npm run lint       # oxlint
npm test           # vitest — calculation/formula correctness tests
```

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import it in Vercel (framework preset: Vite is auto-detected).
3. Add the two environment variables from step 3 above in
   **Vercel → Project Settings → Environment Variables**.
4. Deploy. `vercel.json` is already set up to rewrite all routes to `index.html`
   so client-side routing (React Router) works correctly on refresh/deep links.

## Notes on Scope (v1)

- UPI QR code and UPI ID are stored and displayed for manual payment collection.
  There is no automatic bank/UPI transaction import — earnings are always entered
  manually. The `services/` layer is structured so a future payment-provider API
  integration could plug in without touching UI code.
- Custom expense categories are currently stored per-browser (`localStorage`);
  the default categories (Food, Bike Maintenance, Puncture, Parking, Service,
  Other) live in `src/types/index.ts`.
