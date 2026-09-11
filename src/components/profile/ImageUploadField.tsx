import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ImageUploadFieldProps {
  label: string
  imageUrl: string | null
  shape?: 'circle' | 'square'
  onUpload: (file: File) => Promise<void>
}

const MAX_FILE_SIZE_MB = 5

export function ImageUploadField({ label, imageUrl, shape = 'circle', onUpload }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    setUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={clsx(
          'relative flex h-28 w-28 items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-brand-400',
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-8 w-8 text-slate-400" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {error && <p className="text-xs font-medium text-loss-600">{error}</p>}
    </div>
  )
}
