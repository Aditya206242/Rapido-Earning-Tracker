import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { Bike, LogOut } from 'lucide-react'
import { navItems } from './navItems'
import { signOut } from '@/services/auth.service'

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2 pt-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Bike className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-slate-900">Rapido Profit</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-5 w-5" />
        Log out
      </button>
    </aside>
  )
}
