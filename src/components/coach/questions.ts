export type CoachQuestionId =
  | 'earned-today'
  | 'profit-percent-today'
  | 'month-projection'
  | 'today-vs-average'
  | 'spending-breakdown'
  | 'petrol-spend'
  | 'best-day'
  | 'month-so-far'
  | 'monthly-target'
  | 'spent-today'

export interface CoachQuestion {
  id: CoachQuestionId
  emoji: string
  label: string
}

/** First 5 shown by default; the rest revealed by "See more". Order matches the product spec. */
export const COACH_QUESTIONS: CoachQuestion[] = [
  { id: 'earned-today', emoji: '💰', label: 'How much did I actually earn today?' },
  { id: 'profit-percent-today', emoji: '📊', label: "What's my profit percentage today?" },
  { id: 'month-projection', emoji: '📅', label: 'How much can I make this month?' },
  { id: 'best-day', emoji: '🔥', label: 'What was my best earning day?' },
  { id: 'spending-breakdown', emoji: '💸', label: 'Where is my money going?' },
  { id: 'petrol-spend', emoji: '⛽', label: 'How much am I spending on petrol?' },
  { id: 'today-vs-average', emoji: '📈', label: 'How was today compared to my average?' },
  { id: 'month-so-far', emoji: '📆', label: 'How much have I made this month?' },
  { id: 'monthly-target', emoji: '🎯', label: 'Am I on track to reach my monthly target?' },
  { id: 'spent-today', emoji: '🧾', label: 'What did I spend today?' },
]


export const COACH_QUESTIONS_INITIAL_COUNT = 5
