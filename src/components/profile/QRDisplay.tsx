import { useState } from 'react'
import { QrCode, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface QRDisplayProps {
  qrImageUrl: string | null
  upiId: string | null
}

/** Large, clear QR display meant to be shown to customers for payment — separate from the small edit thumbnail. */
export function QRDisplay({ qrImageUrl, upiId }: QRDisplayProps) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      {qrImageUrl ? (
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Zoom in on QR code"
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <img
            src={qrImageUrl}
            alt="UPI QR Code"
            className="h-56 w-56 rounded-xl object-contain active:opacity-90"
          />
        </button>
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

      {zoomed && qrImageUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/80"
            onClick={() => setZoomed(false)}
          />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={qrImageUrl}
            alt="UPI QR Code (zoomed)"
            className="relative z-10 max-h-[85vh] w-full max-w-md rounded-2xl bg-white object-contain p-4 shadow-2xl"
          />
        </div>
      )}
    </Card>
  )
}
