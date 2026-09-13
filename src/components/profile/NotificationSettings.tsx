import { useState } from 'react'
import { Bell, BellOff, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import type { Profile } from '@/types'

interface NotificationSettingsProps {
  profile: Profile | null
  onChange: () => Promise<void>
}

export function NotificationSettings({ profile, onChange }: NotificationSettingsProps) {
  const reminderEnabledOnProfile = profile?.daily_reminder_enabled ?? false
  const { supportStatus, permission, loading, enabled, enableReminder, disableReminder } =
    usePushNotifications(reminderEnabledOnProfile)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleToggle(next: boolean) {
    setActionError(null)
    try {
      if (next) {
        await enableReminder()
        // enableReminder only turns the reminder on if permission ends up granted —
        // check the live browser state rather than assuming success.
        if (Notification.permission === 'granted') {
          toast.success('Daily reminder turned on')
        } else if (Notification.permission === 'denied') {
          toast.error('Notifications are blocked for this site')
        }
      } else {
        await disableReminder()
        toast.success('Daily reminder turned off')
      }
      await onChange()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
      toast.error('Failed to update notification setting')
    }
  }

  const statusMessage = (() => {
    if (supportStatus === 'unsupported') return "Notifications aren't supported in this browser."
    if (supportStatus === 'needs-ios-install') {
      return 'Install ProfitGo to your Home Screen (Share → Add to Home Screen) to enable notifications.'
    }
    if (permission === 'denied') {
      return 'Notifications are blocked for ProfitGo. Enable them in your browser/site settings to turn this on.'
    }
    if (actionError) return actionError
    return null
  })()

  const toggleDisabled = supportStatus !== 'ready' || permission === 'denied' || loading

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Notifications</h2>
      <div className="flex items-center gap-3">
        <span
          className={
            enabled
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400'
          }
        >
          {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Daily Reminder</p>
          <p className="text-xs text-slate-500">Get a 10 PM nudge to log today's earnings</p>
        </div>
        <Switch checked={enabled} onChange={handleToggle} disabled={toggleDisabled} loading={loading} label="Daily Reminder" />
      </div>

      {statusMessage && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {statusMessage}
        </p>
      )}
    </Card>
  )
}
