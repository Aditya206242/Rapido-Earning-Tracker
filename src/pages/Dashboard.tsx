import { useMemo } from 'react'
import { Wallet, Fuel, ReceiptText, TrendingUp } from 'lucide-react'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/context/AuthContext'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProfitStatusBanner } from '@/components/dashboard/ProfitStatusBanner'
import { DailyEarningsChart } from '@/components/dashboard/DailyEarningsChart'
import { DailyPetrolChart } from '@/components/dashboard/DailyPetrolChart'
import { DailyProfitChart } from '@/components/dashboard/DailyProfitChart'
import { EarningsVsExpensesChart } from '@/components/dashboard/EarningsVsExpensesChart'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { buildDailyBreakdown, buildFinancialSummary } from '@/utils/calculations'
import { currentMonthRange, timeOfDayGreeting, todayISO } from '@/utils/date'

export function Dashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { start, end } = currentMonthRange()
  const { earnings, petrolEntries, expenses, loading, error, refresh } = useFinancialData(start, end)
  const fullDisplayName = profile?.name?.trim() || user?.email?.split('@')[0] || 'Driver'
  const displayName = fullDisplayName.split(/\s+/)[0]

  const today = todayISO()

  const todaySummary = useMemo(
    () =>
      buildFinancialSummary(
        earnings.filter((e) => e.date === today),
        petrolEntries.filter((p) => p.date === today),
        expenses.filter((x) => x.date === today),
      ),
    [earnings, petrolEntries, expenses, today],
  )

  const monthSummary = useMemo(
    () => buildFinancialSummary(earnings, petrolEntries, expenses),
    [earnings, petrolEntries, expenses],
  )

  const dailyBreakdown = useMemo(
    () => buildDailyBreakdown(earnings, petrolEntries, expenses, start, end),
    [earnings, petrolEntries, expenses, start, end],
  )

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {timeOfDayGreeting()}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Track your money, know your profit</p>
      </div>

      <ProfitStatusBanner netProfit={monthSummary.netProfit} status={monthSummary.status} periodLabel="This Month" />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Today</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Today's Earnings" amount={todaySummary.totalEarnings} icon={Wallet} tone="positive" />
          <StatCard label="Today's Petrol" amount={todaySummary.totalPetrol} icon={Fuel} tone="negative" />
          <StatCard label="Other Expenses" amount={todaySummary.totalOtherExpenses} icon={ReceiptText} tone="negative" />
          <StatCard
            label="Today's Net Profit"
            amount={todaySummary.netProfit}
            icon={TrendingUp}
            tone={todaySummary.netProfit >= 0 ? 'positive' : 'negative'}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">This Month</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Earnings" amount={monthSummary.totalEarnings} icon={Wallet} tone="positive" />
          <StatCard label="Total Petrol" amount={monthSummary.totalPetrol} icon={Fuel} tone="negative" />
          <StatCard label="Other Expenses" amount={monthSummary.totalOtherExpenses} icon={ReceiptText} tone="negative" />
          <StatCard label="Total Expenses" amount={monthSummary.totalExpenses} icon={ReceiptText} tone="negative" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">This Month's Trends</h2>
        <DailyEarningsChart data={dailyBreakdown} />
        <DailyPetrolChart data={dailyBreakdown} />
        <DailyProfitChart data={dailyBreakdown} />
        <EarningsVsExpensesChart data={dailyBreakdown} />
      </section>
    </div>
  )
}
