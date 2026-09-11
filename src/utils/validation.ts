export interface ValidationResult {
  valid: boolean
  error?: string
}

/** Amount must be a positive, finite number (greater than 0). */
export function validateAmount(value: string | number): ValidationResult {
  const amount = typeof value === 'string' ? Number(value) : value
  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: 'Amount is required' }
  }
  if (Number.isNaN(amount) || !Number.isFinite(amount)) {
    return { valid: false, error: 'Enter a valid amount' }
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  if (amount > 10000000) {
    return { valid: false, error: 'Amount seems too large' }
  }
  return { valid: true }
}

/** Rejects empty/whitespace-only dates and dates that don't parse. */
export function validateDate(value: string): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Date is required' }
  }
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (!isValidFormat) {
    return { valid: false, error: 'Invalid date format' }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' }
  }
  return { valid: true }
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true }
}

/** Optional positive-number field (litres, price per litre). Empty is allowed. */
export function validateOptionalPositiveNumber(value: string): ValidationResult {
  if (!value || !value.trim()) return { valid: true }
  const num = Number(value)
  if (Number.isNaN(num) || num < 0) {
    return { valid: false, error: 'Enter a valid number' }
  }
  return { valid: true }
}
