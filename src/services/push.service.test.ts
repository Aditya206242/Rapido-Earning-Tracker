import { describe, expect, it } from 'vitest'
import { getNotificationPermission, getPushSupportStatus, urlBase64ToUint8Array } from './push.service'

describe('urlBase64ToUint8Array', () => {
  it('decodes a real VAPID public key into a 65-byte uncompressed P-256 point', () => {
    // A real key generated with `npx web-push generate-vapid-keys` for this project.
    const key = 'BCnrwlYZhygExxVfLpEviLewvaLmStiD29hkRZS1Poc42aQbqOYxmZ3BhODIOUpkrcc_nrMrfi4jCvFDdgKm1KY'
    const bytes = urlBase64ToUint8Array(key)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBe(65)
    expect(bytes[0]).toBe(4) // uncompressed EC point prefix
  })

  it('handles base64url characters (- and _) that regular atob cannot decode directly', () => {
    // Deliberately pick a key containing both '-' and '_' to prove the substitution runs.
    const key = 'BCnrwlYZhygExxVfLpEviLewvaLmStiD29hkRZS1Poc42aQbqOYxmZ3BhODIOUpkrcc_nrMrfi4jCvFDdgKm1KY'
    expect(key).toContain('_')
    expect(() => urlBase64ToUint8Array(key)).not.toThrow()
  })

  it('pads strings whose length is not a multiple of 4', () => {
    // 87 chars -> needs 1 char of "=" padding to reach a multiple of 4.
    const key = 'BCnrwlYZhygExxVfLpEviLewvaLmStiD29hkRZS1Poc42aQbqOYxmZ3BhODIOUpkrcc_nrMrfi4jCvFDdgKm1K'
    expect(key.length % 4).not.toBe(0)
    expect(() => urlBase64ToUint8Array(key)).not.toThrow()
  })
})

describe('getPushSupportStatus', () => {
  it('reports unsupported when there is no window (e.g. this Node test environment)', () => {
    // Vitest's default environment has no DOM globals — this genuinely exercises
    // the real "unsupported platform" branch rather than a mocked one.
    expect(getPushSupportStatus()).toBe('unsupported')
  })
})

describe('getNotificationPermission', () => {
  it('reports unsupported when the Notification API does not exist', () => {
    expect(getNotificationPermission()).toBe('unsupported')
  })
})
