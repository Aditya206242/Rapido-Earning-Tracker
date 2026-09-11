import { useMemo, useState } from 'react'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { ReportSummary } from '@/components/reports/ReportSummary'
import { GetBillButton } from '@/components/reports/GetBillButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { buildFinancialSummary } from '@/utils/calculations'
import { resolvePresetRange, todayISO, type ReportPreset } from '@/utils/date'

export function Reports() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [preset, setPreset] = useState<ReportPreset>('month')
  const [customRange, setCustomRange] = useState({ start: todayISO(), end: todayISO() })

  const range = preset === 'custom' ? customRange : resolvePresetRange(preset)
  const { earnings, petrolEntries, expenses, loading, error, refresh } = useFinancialData(range.start, range.end)

  const summary = useMemo(
    () => buildFinancialSummary(earnings, petrolEntries, expenses),
    [earnings, petrolEntries, expenses],
  )

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Analyze your earnings and expenses by period</p>
      </div>

      <DateRangeSelector
        preset={preset}
        start={customRange.start}
        end={customRange.end}
        onPresetChange={setPreset}
        onCustomChange={(start, end) => {
          setPreset('custom')
          setCustomRange({ start, end })
        }}
      />

      {loading ? (
        <LoadingSpinner label="Crunching numbers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <ReportSummary summary={summary} />
      )}

      {user && <GetBillButton userId={user.id} userName={profile?.name || user.email || 'Rapido Driver'} />}
    </div>
  )
}
