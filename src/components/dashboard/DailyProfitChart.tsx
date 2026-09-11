import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { chartTooltipFormatter, chartXAxisTick } from './chartUtils'
import type { DailyBreakdownPoint } from '@/types'

export function DailyProfitChart({ data }: { data: DailyBreakdownPoint[] }) {
  return (
    <ChartCard title="Daily Profit">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={chartXAxisTick} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={chartTooltipFormatter} labelFormatter={chartXAxisTick} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
