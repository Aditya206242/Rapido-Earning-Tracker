import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2 py-10', className)}>
      <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}
