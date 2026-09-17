import { formatINR } from '@/utils/currency'
import { formatDisplayDate } from '@/utils/date'
import {
  buildBestDayDetail,
  buildMonthlyProjection,
  buildSpendingBreakdown,
  buildTodayVsAverage,
  safeRatio,
} from '@/utils/coach'
import { sumAmounts } from '@/utils/calculations'
import { CoachAnswerShell, CoachEmptyState, type CoachStatRow } from './CoachAnswerShell'
import type { CoachQuestionId } from './questions'
import type { CoachData } from '@/hooks/useCoachData'

interface CoachAnswerProps {
  questionId: CoachQuestionId
  data: CoachData
}

/** Renders the right answer body for the selected question, using only CoachData's already-derived numbers. */
export function CoachAnswer({ questionId, data }: CoachAnswerProps) {
  const { todaySummary, monthSummary, today } = data

  switch (questionId) {
    case 'earned-today': {
      if (todaySummary.totalEarnings === 0) {
        return <CoachEmptyState message="No data yet. Add today's earning to see your real profit." />
      }
      const margin = safeRatio(todaySummary.netProfit, todaySummary.totalEarnings)
      const rows: CoachStatRow[] = [
        { label: 'Earnings', value: formatINR(todaySummary.totalEarnings), tone: 'positive' },
        { label: 'Petrol', value: formatINR(todaySummary.totalPetrol), tone: 'negative' },
        { label: 'Other expenses', value: formatINR(todaySummary.totalOtherExpenses), tone: 'negative' },
      ]
      return (
        <CoachAnswerShell
          headline={formatINR(todaySummary.netProfit)}
          headlineTone={todaySummary.netProfit >= 0 ? 'positive' : 'negative'}
          subheadline="Real profit today"
          rows={rows}
          note={margin !== null ? `You kept ${(margin * 100).toFixed(1)}% of today's earnings as profit.` : undefined}
        />
      )
    }

    case 'profit-percent-today': {
      const margin = safeRatio(todaySummary.netProfit, todaySummary.totalEarnings)
      if (margin === null) {
        return <CoachEmptyState message="No earnings logged today yet, so there's no profit percentage to show." />
      }
      const perHundred = (margin * 100).toFixed(2)
      return (
        <CoachAnswerShell
          headline={`${(margin * 100).toFixed(1)}% Profit`}
          headlineTone={margin >= 0 ? 'positive' : 'negative'}
          rows={[
            { label: 'Earnings', value: formatINR(todaySummary.totalEarnings) },
            { label: 'Profit', value: formatINR(todaySummary.netProfit), tone: margin >= 0 ? 'positive' : 'negative' },
          ]}
          note={`For every ₹100 earned, ₹${perHundred} remained after expenses.`}
        />
      )
    }

    case 'month-projection': {
      const projection = buildMonthlyProjection(monthSummary, data.averageDailyProfit, data.daysInMonth)
      if (!projection) {
        return <CoachEmptyState message="Not enough data yet. Add a few days of earnings to see a monthly projection." />
      }
      return (
        <CoachAnswerShell
          headline={`≈ ${formatINR(projection.estimatedMonthlyProfit)}`}
          headlineTone={projection.estimatedMonthlyProfit >= 0 ? 'positive' : 'negative'}
          subheadline="Estimated monthly profit"
          rows={[
            { label: 'Average daily profit', value: formatINR(projection.averageDailyProfit) },
            { label: "This month's profit so far", value: formatINR(projection.monthProfitSoFar) },
          ]}
          note="This is a projection based on your average day, not guaranteed income."
        />
      )
    }

    case 'today-vs-average': {
      const comparison = buildTodayVsAverage(todaySummary, data.averageDailyProfit)
      if (!comparison) {
        return <CoachEmptyState message="Not enough data yet. Keep using ProfitGo to build your comparison." />
      }
      const better = comparison.difference >= 0
      return (
        <CoachAnswerShell
          headline={`${better ? '+' : ''}${formatINR(comparison.difference)}`}
          headlineTone={better ? 'positive' : 'negative'}
          subheadline={better ? 'above your average' : 'below your average'}
          rows={[
            { label: "Today's profit", value: formatINR(comparison.todayProfit) },
            { label: 'Average daily profit', value: formatINR(comparison.averageDailyProfit) },
          ]}
          note={
            comparison.percentDifference !== null
              ? `Today was ${Math.abs(comparison.percentDifference * 100).toFixed(0)}% ${better ? 'better' : 'worse'} than your average day.`
              : undefined
          }
        />
      )
    }

    case 'spending-breakdown': {
      const breakdown = buildSpendingBreakdown(data.monthPetrolEntries, data.monthExpenses)
      if (breakdown.items.length === 0) {
        return <CoachEmptyState message="No expenses logged this month yet." />
      }
      return (
        <CoachAnswerShell
          headline={formatINR(breakdown.total)}
          headlineTone="negative"
          subheadline="Total expenses this month"
          rows={breakdown.items.map((item) => ({ label: item.category, value: formatINR(item.amount), tone: 'negative' }))}
          note={breakdown.largest ? `${breakdown.largest.category} is your biggest expense this month.` : undefined}
        />
      )
    }

    case 'petrol-spend': {
      const todayPetrol = sumAmounts(data.monthPetrolEntries.filter((p) => p.date === today))
      const monthPetrol = monthSummary.totalPetrol
      const percentOfEarnings = safeRatio(monthPetrol, monthSummary.totalEarnings)
      return (
        <CoachAnswerShell
          headline={formatINR(monthPetrol)}
          headlineTone="negative"
          subheadline="Petrol spend this month"
          rows={[{ label: 'Today', value: formatINR(todayPetrol), tone: 'negative' }]}
          note={
            percentOfEarnings !== null
              ? `Petrol is ${(percentOfEarnings * 100).toFixed(0)}% of your earnings this month.`
              : undefined
          }
        />
      )
    }

    case 'best-day': {
      if (!data.bestDay) {
        return <CoachEmptyState message="No earnings yet. Add your first earning to see your best day." />
      }
      const detail = buildBestDayDetail(data.bestDay, data.allPetrolEntries, data.allExpenses)
      return (
        <CoachAnswerShell
          headline={formatDisplayDate(detail.date)}
          subheadline="🔥 Your best earning day"
          rows={[
            { label: 'Earnings', value: formatINR(detail.earnings), tone: 'positive' },
            { label: 'Expenses', value: formatINR(detail.expenses), tone: 'negative' },
            { label: 'Profit', value: formatINR(detail.profit), tone: detail.profit >= 0 ? 'positive' : 'negative' },
          ]}
        />
      )
    }

    case 'month-so-far': {
      if (monthSummary.totalEarnings === 0) {
        return <CoachEmptyState message="No earnings logged this month yet." />
      }
      return (
        <CoachAnswerShell
          headline={formatINR(monthSummary.netProfit)}
          headlineTone={monthSummary.netProfit >= 0 ? 'positive' : 'negative'}
          subheadline="Real profit this month"
          rows={[
            { label: 'Earnings', value: formatINR(monthSummary.totalEarnings), tone: 'positive' },
            { label: 'Petrol', value: formatINR(monthSummary.totalPetrol), tone: 'negative' },
            { label: 'Other expenses', value: formatINR(monthSummary.totalOtherExpenses), tone: 'negative' },
            { label: 'Total expenses', value: formatINR(monthSummary.totalExpenses), tone: 'negative' },
            ...(data.averageDailyProfit !== null
              ? [{ label: 'Average daily profit', value: formatINR(data.averageDailyProfit) } satisfies CoachStatRow]
              : []),
          ]}
        />
      )
    }

    case 'monthly-target': {
      return (
        <CoachEmptyState message="ProfitGo doesn't have a monthly target feature yet — this question needs that to be added first." />
      )
    }

    case 'spent-today': {
      const todayPetrolEntries = data.monthPetrolEntries.filter((p) => p.date === today)
      const todayExpenses = data.monthExpenses.filter((x) => x.date === today)
      const breakdown = buildSpendingBreakdown(todayPetrolEntries, todayExpenses)
      if (breakdown.items.length === 0) {
        return <CoachEmptyState message="No expenses logged today yet." />
      }
      return (
        <CoachAnswerShell
          headline={formatINR(breakdown.total)}
          headlineTone="negative"
          subheadline="Total expenses today"
          rows={breakdown.items.map((item) => ({ label: item.category, value: formatINR(item.amount), tone: 'negative' }))}
          note={breakdown.largest ? `${breakdown.largest.category} was your biggest expense today.` : undefined}
        />
      )
    }

    default:
      return null
  }
}
