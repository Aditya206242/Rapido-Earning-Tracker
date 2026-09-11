/** Indian Rupee currency formatting utilities (₹1,250 / ₹1,25,000 style). */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const inrFormatterDecimal = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

/** Formats a number as ₹1,25,000 (no decimals — amounts are stored as whole rupees). */
export function formatINR(amount: number): string {
  return inrFormatter.format(Math.round(amount))
}

/** Formats a number as ₹1,25,000.00 with decimals, used for per-litre pricing etc. */
export function formatINRDecimal(amount: number): string {
  return inrFormatterDecimal.format(amount)
}

/** Formats a signed amount, e.g. +₹850 / -₹250, for transaction lists. */
export function formatSignedINR(amount: number, sign: '+' | '-'): string {
  return `${sign}${formatINR(Math.abs(amount))}`
}

const inrGroupingFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

/**
 * PDF-safe currency formatting. jsPDF's standard fonts (Helvetica etc.) only
 * support WinAnsi/Latin-1 encoding and cannot render the ₹ (U+20B9) glyph —
 * it silently renders as a broken superscript character instead. PDF reports
 * use "Rs." in place of ₹ for reliable rendering with no extra font embedding.
 */
export function formatINRForPdf(amount: number): string {
  return `Rs. ${inrGroupingFormatter.format(Math.round(amount))}`
}
