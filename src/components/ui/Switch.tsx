import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  label?: string
}

/** A large, touch-friendly ON/OFF toggle — used for settings like the daily reminder. */
export function Switch({ checked, onChange, disabled, loading, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || loading}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-brand-600' : 'bg-slate-300',
      )}
    >
      <span
        className={clsx(
          'inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform duration-150',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </span>
    </button>
  )
}
