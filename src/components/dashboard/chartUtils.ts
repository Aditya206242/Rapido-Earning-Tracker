import { formatShortDate } from '@/utils/date'
import { formatINR } from '@/utils/currency'

export function chartXAxisTick(value: string): string {
  return formatShortDate(value)
}

export function chartTooltipFormatter(value: number | string): [string, string] {
  return [formatINR(Number(value)), '']
}
