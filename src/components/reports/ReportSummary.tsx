import { Card } from '@/components/ui/Card'
import { formatINR } from '@/utils/currency'
import type { FinancialSummary } from '@/types'

export function ReportSummary({ summary }: { summary: FinancialSummary }) {
  const rows: { label: string; value: string; bold?: boolean; tone?: 'positive' | 'negative' | 'neutral' }[] = [
    { label: 'Total Earnings', value: formatINR(summary.totalEarnings), tone: 'positive' },
    { label: 'Petrol Expense', value: formatINR(summary.totalPetrol), tone: 'negative' },
    { label: 'Other Expenses', value: formatINR(summary.totalOtherExpenses), tone: 'negative' },
    { label: 'Total Expenses', value: formatINR(summary.totalExpenses), tone: 'negative' },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-col divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-600">{row.label}</span>
            <span
              className={
                row.tone === 'positive'
                  ? 'font-semibold text-profit-600'
                  : row.tone === 'negative'
                    ? 'font-semibold text-loss-600'
                    : 'font-semibold text-slate-900'
              }
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-slate-700">Net Profit</p>
          <p className="text-xs text-slate-400">{summary.status}</p>
        </div>
        <p className={`text-xl font-extrabold ${summary.netProfit >= 0 ? 'text-profit-600' : 'text-loss-600'}`}>
          {formatINR(summary.netProfit)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-slate-900">{summary.earningCount}</p>
          <p className="text-xs text-slate-500">Earnings</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{summary.petrolCount}</p>
          <p className="text-xs text-slate-500">Petrol</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{summary.expenseCount}</p>
          <p className="text-xs text-slate-500">Expenses</p>
        </div>
      </div>
    </Card>
  )
}
