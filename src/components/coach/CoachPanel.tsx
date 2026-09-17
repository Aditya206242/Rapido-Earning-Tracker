import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCoachData } from '@/hooks/useCoachData'
import { CoachSnapshot } from './CoachSnapshot'
import { CoachAnswer } from './CoachAnswer'
import { COACH_QUESTIONS, COACH_QUESTIONS_INITIAL_COUNT, type CoachQuestionId } from './questions'

/** Sheet content: today's snapshot, the tappable question list ("See more" reveals the rest), and the answer view. */
export function CoachPanel() {
  const data = useCoachData()
  const [selected, setSelected] = useState<CoachQuestionId | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (data.loading) return <LoadingSpinner label="Loading your Coach insights..." />
  if (data.error) return <ErrorState message={data.error} onRetry={data.refresh} />

  if (selected) {
    const question = COACH_QUESTIONS.find((q) => q.id === selected)!
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 self-start text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-base font-semibold text-slate-900">
          {question.emoji} {question.label}
        </p>
        <CoachAnswer questionId={selected} data={data} />
      </div>
    )
  }

  const visibleQuestions = showAll ? COACH_QUESTIONS : COACH_QUESTIONS.slice(0, COACH_QUESTIONS_INITIAL_COUNT)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">What do you want to know?</p>
      </div>

      <CoachSnapshot todaySummary={data.todaySummary} daysInMonth={data.daysInMonth} />

      <div className="flex flex-col gap-2">
        {visibleQuestions.map((question) => (
          <button
            key={question.id}
            type="button"
            onClick={() => setSelected(question.id)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <span className="text-xl">{question.emoji}</span>
            <span className="flex-1 text-sm font-medium text-slate-800">{question.label}</span>
          </button>
        ))}

        {!showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="self-center py-2 text-sm font-semibold text-brand-600"
          >
            See more →
          </button>
        )}
      </div>
    </div>
  )
}
