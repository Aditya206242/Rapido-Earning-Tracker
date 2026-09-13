import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ImageUploadField } from '@/components/profile/ImageUploadField'
import { QRDisplay } from '@/components/profile/QRDisplay'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { NotificationSettings } from '@/components/profile/NotificationSettings'
import { upsertProfile, uploadAvatarImage, uploadQrImage } from '@/services/profile.service'
import { signOut } from '@/services/auth.service'

export function Profile() {
  const { user } = useAuth()
  const { profile, loading, refresh } = useProfile()

  if (loading) return <LoadingSpinner label="Loading profile..." />
  if (!user) return null

  async function handleSaveProfile(input: { name: string; mobile: string; upi_id: string }) {
    await upsertProfile(user!.id, input)
    await refresh()
  }

  async function handleAvatarUpload(file: File) {
    const url = await uploadAvatarImage(user!.id, file)
    await upsertProfile(user!.id, { avatar_url: url })
    await refresh()
    toast.success('Photo updated')
  }

  async function handleQrUpload(file: File) {
    const url = await uploadQrImage(user!.id, file)
    await upsertProfile(user!.id, { qr_image_url: url })
    await refresh()
    toast.success('QR code updated')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
      </div>

      <Card className="flex flex-col items-center gap-4 p-6">
        <ImageUploadField label="Profile Photo" imageUrl={profile?.avatar_url ?? null} onUpload={handleAvatarUpload} />
        <div className="w-full">
          <ProfileForm profile={profile} onSave={handleSaveProfile} />
        </div>
      </Card>

      <NotificationSettings profile={profile} onChange={refresh} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">UPI QR Code</h2>
        <div className="flex flex-col gap-4">
          <QRDisplay qrImageUrl={profile?.qr_image_url ?? null} upiId={profile?.upi_id ?? null} />
          <Card className="flex items-center justify-center p-4">
            <ImageUploadField
              label="Upload / Change QR Code"
              imageUrl={profile?.qr_image_url ?? null}
              shape="square"
              onUpload={handleQrUpload}
            />
          </Card>
        </div>
      </div>

      <Button variant="secondary" fullWidth onClick={() => signOut()} className="md:hidden">
        <LogOut className="h-5 w-5" />
        Log Out
      </Button>
    </div>
  )
}
