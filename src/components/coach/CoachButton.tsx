import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { CoachPanel } from './CoachPanel'

/** Floating "ProfitGo Coach" entry point, mounted once in AppLayout so it's available on every authenticated page. */
export function CoachButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform active:scale-95 md:bottom-6"
      >
        <span className="text-base">🧠</span>
        Coach
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="🧠 ProfitGo Coach">
        {open && <CoachPanel />}
      </Sheet>
    </>
  )
}
