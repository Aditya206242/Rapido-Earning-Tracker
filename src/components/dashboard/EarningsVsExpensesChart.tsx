import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { chartTooltipFormatter, chartXAxisTick } from './chartUtils'
import type { DailyBreakdownPoint } from '@/types'

export function EarningsVsExpensesChart({ data }: { data: DailyBreakdownPoint[] }) {
  return (
    <ChartCard title="Earnings vs Expenses">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={chartXAxisTick} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={chartTooltipFormatter} labelFormatter={chartXAxisTick} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="earnings" name="Earnings" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
