/**
 * Supabase auth errors come back as raw technical strings (e.g. "email rate
 * limit exceeded", "Invalid login credentials"). This maps the common ones
 * to plain-language messages so users aren't shown backend jargon.
 */
export function getAuthErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  const lower = raw.toLowerCase()

  if (lower.includes('email rate limit exceeded')) {
    return 'Too many signup/reset emails have been sent recently. Please wait a while before trying again.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many attempts right now. Please wait a few minutes and try again.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before logging in — check your inbox for the confirmation link.'
  }
  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }

  return raw || 'Something went wrong. Please try again.'
}
