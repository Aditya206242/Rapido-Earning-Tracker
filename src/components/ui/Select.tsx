import clsx from 'clsx'
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, children, ...props },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-lg text-slate-900',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error && 'border-loss-500 focus:border-loss-500 focus:ring-loss-100',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-loss-600">{error}</p>}
    </div>
  )
})
