import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { chartTooltipFormatter, chartXAxisTick } from './chartUtils'
import type { DailyBreakdownPoint } from '@/types'

export function DailyEarningsChart({ data }: { data: DailyBreakdownPoint[] }) {
  return (
    <ChartCard title="Daily Earnings">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={chartXAxisTick} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={chartTooltipFormatter} labelFormatter={chartXAxisTick} />
          <Bar dataKey="earnings" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
