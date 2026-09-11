import clsx from 'clsx'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { formatINR } from '@/utils/currency'
import type { FinancialSummary } from '@/types'

interface ProfitStatusBannerProps {
  netProfit: number
  status: FinancialSummary['status']
  periodLabel: string
}

const statusConfig = {
  PROFIT: {
    icon: TrendingUp,
    bg: 'bg-gradient-to-br from-profit-500 to-profit-700',
    badge: 'bg-white/20 text-white',
  },
  LOSS: {
    icon: TrendingDown,
    bg: 'bg-gradient-to-br from-loss-500 to-loss-700',
    badge: 'bg-white/20 text-white',
  },
  'BREAK EVEN': {
    icon: Minus,
    bg: 'bg-gradient-to-br from-slate-500 to-slate-700',
    badge: 'bg-white/20 text-white',
  },
} as const

export function ProfitStatusBanner({ netProfit, status, periodLabel }: ProfitStatusBannerProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={clsx('rounded-2xl p-6 text-white shadow-lg', config.bg)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">{periodLabel} Net Profit</p>
        <span className={clsx('flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold', config.badge)}>
          <Icon className="h-3.5 w-3.5" />
          {status}
        </span>
      </div>
      <p className="mt-2 text-4xl font-extrabold tracking-tight">
        {netProfit < 0 ? '-' : ''}
        {formatINR(Math.abs(netProfit))}
      </p>
    </div>
  )
}
