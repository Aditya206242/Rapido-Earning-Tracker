import { useState } from 'react'
import { FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { fetchEarnings } from '@/services/earnings.service'
import { fetchPetrolEntries } from '@/services/petrol.service'
import { fetchExpenses } from '@/services/expenses.service'
import { currentMonthRange, todayISO } from '@/utils/date'

interface GetBillButtonProps {
  userId: string
  userName: string
}

export function GetBillButton({ userId, userName }: GetBillButtonProps) {
  const [open, setOpen] = useState(false)
  const monthRange = currentMonthRange()
  const [start, setStart] = useState(monthRange.start)
  const [end, setEnd] = useState(monthRange.end)
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    if (start > end) {
      toast.error('Start date must be before end date')
      return
    }
    setGenerating(true)
    try {
      const [{ downloadReportPdf }, earnings, petrolEntries, expenses] = await Promise.all([
        import('@/lib/pdf/generateReportPdf'),
        fetchEarnings(userId, start, end),
        fetchPetrolEntries(userId, start, end),
        fetchExpenses(userId, start, end),
      ])
      downloadReportPdf({ userName, startDate: start, endDate: end, earnings, petrolEntries, expenses })
      toast.success('Report generated')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)} className="shadow-lg shadow-brand-600/20">
        <FileDown className="h-5 w-5" />
        GET BILL
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Generate PDF Bill">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Select the period for your financial report.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={start} max={todayISO()} onChange={(e) => setStart(e.target.value)} />
            <Input label="End Date" type="date" value={end} max={todayISO()} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button size="lg" fullWidth onClick={handleGenerate} loading={generating}>
            Download PDF
          </Button>
        </div>
      </Sheet>
    </>
  )
}
