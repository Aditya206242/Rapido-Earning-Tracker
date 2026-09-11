import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { formatDisplayDate, formatShortDate } from '@/utils/date'
import { formatINRForPdf } from '@/utils/currency'
import { buildFinancialSummary, buildTransactionList } from '@/utils/calculations'
import type { Earning, Expense, PetrolEntry } from '@/types'

// jspdf-autotable's default export has known interop issues under Vite/esbuild's
// CJS->ESM conversion (resolves to a non-callable module namespace object), so we
// use the documented `applyPlugin` + instance-method (`doc.autoTable(...)`) form
// instead of the free `autoTable(doc, ...)` function form.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
applyPlugin(jsPDF as any)

interface GenerateReportPdfInput {
  userName: string
  startDate: string
  endDate: string
  earnings: Earning[]
  petrolEntries: PetrolEntry[]
  expenses: Expense[]
}

const INK = '#0f172a'
const MUTED = '#64748b'
const PROFIT = '#16a34a'
const LOSS = '#dc2626'

/**
 * Builds a professional, printable PDF financial report — summary totals plus
 * a date-wise transaction table. Deliberately excludes any ride/distance/time
 * metrics, matching the rest of the app.
 */
export function generateReportPdf({
  userName,
  startDate,
  endDate,
  earnings,
  petrolEntries,
  expenses,
}: GenerateReportPdfInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 50

  const summary = buildFinancialSummary(earnings, petrolEntries, expenses)
  const transactions = buildTransactionList(earnings, petrolEntries, expenses)

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(INK)
  doc.text('PROFITGO REPORT', margin, y)
  y += 26

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(MUTED)
  doc.text(userName, margin, y)
  y += 16
  doc.text(`Report Period: ${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`, margin, y)
  y += 10

  doc.setDrawColor(226, 232, 240)
  y += 12
  doc.line(margin, y, pageWidth - margin, y)
  y += 26

  // Summary
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  doc.text('SUMMARY', margin, y)
  y += 20

  const summaryRows: [string, string][] = [
    ['Total Earnings', formatINRForPdf(summary.totalEarnings)],
    ['Petrol Expense', formatINRForPdf(summary.totalPetrol)],
    ['Other Expenses', formatINRForPdf(summary.totalOtherExpenses)],
    ['Total Expenses', formatINRForPdf(summary.totalExpenses)],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  for (const [label, value] of summaryRows) {
    doc.setTextColor(MUTED)
    doc.text(label, margin, y)
    doc.setTextColor(INK)
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 18
  }

  y += 8
  doc.setFillColor(summary.netProfit >= 0 ? '#f0fdf4' : '#fef2f2')
  doc.roundedRect(margin, y - 16, pageWidth - margin * 2, 34, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  doc.text('NET PROFIT', margin + 12, y + 6)
  doc.setTextColor(summary.netProfit >= 0 ? PROFIT : LOSS)
  doc.text(formatINRForPdf(summary.netProfit), pageWidth - margin - 12, y + 6, { align: 'right' })
  y += 40

  // Transaction table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  doc.text('DATE-WISE TRANSACTIONS', margin, y)
  y += 12

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoTableDoc = doc as any
  autoTableDoc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date', 'Type', 'Description', 'Amount']],
    body: transactions.map((t) => [
      formatShortDate(t.date),
      t.type === 'earning' ? 'Earning' : t.type === 'petrol' ? 'Petrol' : 'Expense',
      t.description,
      t.type === 'earning' ? formatINRForPdf(t.amount) : `-${formatINRForPdf(t.amount)}`,
    ]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { halign: 'right' } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const isEarning = !String(data.cell.raw).startsWith('-')
        data.cell.styles.textColor = isEarning ? [22, 163, 74] : [220, 38, 38]
      }
    },
  })

  const finalY = autoTableDoc.lastAutoTable?.finalY ?? y + 20
  let footerY = finalY + 30

  if (footerY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage()
    footerY = 60
  }

  doc.setDrawColor(226, 232, 240)
  doc.line(margin, footerY - 16, pageWidth - margin, footerY - 16)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.text(`TOTAL INCOME: ${formatINRForPdf(summary.totalEarnings)}`, margin, footerY)
  footerY += 16
  doc.text(`TOTAL EXPENSE: ${formatINRForPdf(summary.totalExpenses)}`, margin, footerY)
  footerY += 16
  doc.setTextColor(summary.netProfit >= 0 ? PROFIT : LOSS)
  doc.text(`NET PROFIT: ${formatINRForPdf(summary.netProfit)}`, margin, footerY)

  return doc
}

export function downloadReportPdf(input: GenerateReportPdfInput) {
  const doc = generateReportPdf(input)
  doc.save(`ProfitGo-Report-${input.startDate}-to-${input.endDate}.pdf`)
}
