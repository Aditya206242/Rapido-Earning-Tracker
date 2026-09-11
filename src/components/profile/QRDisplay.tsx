import { QrCode } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface QRDisplayProps {
  qrImageUrl: string | null
  upiId: string | null
}

/** Large, clear QR display meant to be shown to customers for payment — separate from the small edit thumbnail. */
export function QRDisplay({ qrImageUrl, upiId }: QRDisplayProps) {
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      {qrImageUrl ? (
        <img src={qrImageUrl} alt="UPI QR Code" className="h-56 w-56 rounded-xl object-contain" />
      ) : (
        <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-400">
          <QrCode className="h-12 w-12" />
          <p className="text-sm">No QR code uploaded yet</p>
        </div>
      )}
      {upiId && (
        <div>
          <p className="text-xs font-medium text-slate-500">UPI ID</p>
          <p className="text-base font-semibold text-slate-900">{upiId}</p>
        </div>
      )}
    </Card>
  )
}
