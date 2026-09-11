import { AlertTriangle } from 'lucide-react'

/** Shown instead of the app when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. */
export function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Supabase setup required</h1>
        </div>
        <p className="text-sm text-slate-600">
          This app needs Supabase credentials to run. Create a{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env</code> file in the project root
          (copy from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.example</code>) and set:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
        </pre>
        <p className="mt-3 text-sm text-slate-600">
          Find these under Supabase Dashboard → Project Settings → API, then restart the dev server.
        </p>
      </div>
    </div>
  )
}
