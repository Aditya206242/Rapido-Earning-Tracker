import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatINR } from '@/utils/currency'
import { formatDisplayDate } from '@/utils/date'
import type { BestDayStats } from '@/types'

interface BestDayCardProps {
  title: string
  icon: LucideIcon
  stats: BestDayStats
  emptyMessage: string
}

/** One period's Best Earning Day + Average Daily Earning — reused for All Time / This Week / This Month. */
export function BestDayCard({ title, icon: Icon, stats, emptyMessage }: BestDayCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>

      {stats.bestDay ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Best Earning Day</p>
            <p className="text-xl font-bold text-profit-600">{formatINR(stats.bestDay.amount)}</p>
            <p className="text-xs text-slate-400">{formatDisplayDate(stats.bestDay.date)}</p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500">Average Daily Earning</p>
            <p className="text-base font-semibold text-slate-900">
              {stats.averageDailyEarning !== null ? formatINR(stats.averageDailyEarning) : '--'}
            </p>
            <p className="text-xs text-slate-400">across {stats.activeDays} earning day{stats.activeDays === 1 ? '' : 's'}</p>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-slate-400">{emptyMessage}</p>
      )}
    </Card>
  )
}
