import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  detectTimezone,
  getNotificationPermission,
  getPushSupportStatus,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupportStatus,
} from '@/services/push.service'
import { upsertProfile } from '@/services/profile.service'

export interface UsePushNotificationsResult {
  supportStatus: PushSupportStatus
  permission: NotificationPermission | 'unsupported'
  /** Whether this call is in flight — disable the toggle while true. */
  loading: boolean
  /** True once the user has enabled the reminder AND granted permission on this device. */
  enabled: boolean
  /** Requests permission (if needed), subscribes this device, and turns the reminder on. */
  enableReminder: () => Promise<void>
  /** Turns the reminder off and removes this device's subscription. */
  disableReminder: () => Promise<void>
}

/**
 * Bridges the browser's Push API with the user's `daily_reminder_enabled`
 * profile flag. The actual 10 PM send happens server-side (Supabase Edge
 * Function on a cron schedule) — this hook only manages permission,
 * subscribing this device, and keeping the profile flag in sync.
 */
export function usePushNotifications(reminderEnabledOnProfile: boolean): UsePushNotificationsResult {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [loading, setLoading] = useState(false)

  const supportStatus = getPushSupportStatus()

  useEffect(() => {
    setPermission(getNotificationPermission())
  }, [])

  const enableReminder = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await subscribeToPush(user.id)
      setPermission(result)
      if (result === 'granted') {
        await upsertProfile(user.id, { daily_reminder_enabled: true, timezone: detectTimezone() })
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  const disableReminder = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      await unsubscribeFromPush(user.id)
      await upsertProfile(user.id, { daily_reminder_enabled: false })
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    supportStatus,
    permission,
    loading,
    enabled: reminderEnabledOnProfile && permission === 'granted',
    enableReminder,
    disableReminder,
  }
}
