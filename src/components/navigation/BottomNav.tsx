import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isAdd = to === '/add'
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-brand-600' : 'text-slate-500',
                )
              }
            >
              {({ isActive }) =>
                isAdd ? (
                  <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                    <Icon className="h-6 w-6" />
                  </span>
                ) : (
                  <>
                    <Icon className={clsx('h-5 w-5', isActive && 'text-brand-600')} />
                    <span>{label}</span>
                  </>
                )
              }
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
