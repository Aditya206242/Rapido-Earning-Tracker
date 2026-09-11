import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="h-52 w-full">{children}</div>
    </Card>
  )
}
