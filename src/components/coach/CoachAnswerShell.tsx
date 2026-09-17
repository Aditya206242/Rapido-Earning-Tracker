import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Card } from '@/components/ui/Card'

export interface CoachStatRow {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative'
}

interface CoachAnswerShellProps {
  headline: string
  headlineTone?: 'neutral' | 'positive' | 'negative'
  subheadline?: string
  rows?: CoachStatRow[]
  note?: ReactNode
}

const headlineToneClasses: Record<NonNullable<CoachAnswerShellProps['headlineTone']>, string> = {
  neutral: 'text-slate-900',
  positive: 'text-profit-600',
  negative: 'text-loss-600',
}

const rowToneClasses: Record<NonNullable<CoachStatRow['tone']>, string> = {
  neutral: 'text-slate-900',
  positive: 'text-profit-600',
  negative: 'text-loss-600',
}

/** Shared answer layout: one big headline number, a few supporting rows, one short explanation. */
export function CoachAnswerShell({ headline, headlineTone = 'neutral', subheadline, rows, note }: CoachAnswerShellProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <p className={clsx('text-3xl font-bold', headlineToneClasses[headlineTone])}>{headline}</p>
        {subheadline && <p className="mt-1 text-sm text-slate-500">{subheadline}</p>}
      </div>

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className={clsx('font-semibold', rowToneClasses[row.tone ?? 'neutral'])}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {note && <p className="text-sm text-slate-600">{note}</p>}
    </Card>
  )
}

/** Friendly empty-state card for when there isn't enough data to answer yet. */
export function CoachEmptyState({ message }: { message: string }) {
  return (
    <Card className="p-5 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </Card>
  )
}
