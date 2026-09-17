import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Sidebar } from '@/components/navigation/Sidebar'
import { CoachButton } from '@/components/coach/CoachButton'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:ml-64 md:max-w-3xl md:px-8 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
      <CoachButton />
    </div>
  )
}
