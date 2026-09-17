import { Card } from '@/components/ui/Card'
import { formatINR } from '@/utils/currency'
import { safeRatio } from '@/utils/coach'
import type { FinancialSummary } from '@/types'

interface CoachSnapshotProps {
  todaySummary: FinancialSummary
  daysInMonth: number
}

/** Compact "today at a glance" card shown above the question list, only when today has an earning logged. */
export function CoachSnapshot({ todaySummary, daysInMonth }: CoachSnapshotProps) {
  if (todaySummary.totalEarnings === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-slate-500">Add today's earning to see your ProfitGo Coach insights.</p>
      </Card>
    )
  }

  const marginRatio = safeRatio(todaySummary.netProfit, todaySummary.totalEarnings)
  const pace = todaySummary.netProfit * daysInMonth

  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">👋 Today's Snapshot</p>
      <p className="text-sm font-semibold text-slate-900">
        You earned {formatINR(todaySummary.totalEarnings)} today and kept {formatINR(todaySummary.netProfit)} as profit.
      </p>
      {marginRatio !== null && (
        <p className="text-sm text-slate-600">{(marginRatio * 100).toFixed(1)}% profit margin</p>
      )}
      <p className="text-sm text-brand-600">📅 At this pace → ≈ {formatINR(pace)}/month</p>
    </Card>
  )
}
