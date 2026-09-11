import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { Card } from '@/components/ui/Card'
import { formatINR } from '@/utils/currency'

interface StatCardProps {
  label: string
  amount: number
  icon: LucideIcon
  tone?: 'neutral' | 'positive' | 'negative'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  positive: 'bg-profit-50 text-profit-600',
  negative: 'bg-loss-50 text-loss-600',
}

export function StatCard({ label, amount, icon: Icon, tone = 'neutral' }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="truncate text-lg font-bold text-slate-900">{formatINR(amount)}</p>
        </div>
      </div>
    </Card>
  )
}
