import clsx from 'clsx'
import { Input } from '@/components/ui/Input'
import type { ReportPreset } from '@/utils/date'

interface DateRangeSelectorProps {
  preset: ReportPreset
  start: string
  end: string
  onPresetChange: (preset: ReportPreset) => void
  onCustomChange: (start: string, end: string) => void
}

const presets: { key: ReportPreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
]

export function DateRangeSelector({ preset, start, end, onPresetChange, onCustomChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onPresetChange(p.key)}
            className={clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              preset === p.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={start} onChange={(e) => onCustomChange(e.target.value, end)} />
          <Input label="End Date" type="date" value={end} onChange={(e) => onCustomChange(start, e.target.value)} />
        </div>
      )}
    </div>
  )
}
