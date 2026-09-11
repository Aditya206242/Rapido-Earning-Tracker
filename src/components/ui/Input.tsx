import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, prefix, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-lg text-slate-900',
            'placeholder:text-slate-400',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error && 'border-loss-500 focus:border-loss-500 focus:ring-loss-100',
            prefix && 'pl-9',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-loss-600">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
    </div>
  )
})
