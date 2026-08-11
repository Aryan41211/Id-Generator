'use client'

interface DownloadButtonProps {
  imageBlob: Blob | null
  mode: 'solo' | 'squad'
}

export default function DownloadButton({ imageBlob, mode }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!imageBlob) return
    
    const url = URL.createObjectURL(imageBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'solo' ? 'hh-goa-2026-id.png' : 'hh-goa-2026-squad-id.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!imageBlob) return null

  return (
    <button
      onClick={handleDownload}
      className="w-full bg-hh-pink text-hh-cream font-bold py-4 px-8 rounded-full text-lg uppercase tracking-wider hover:bg-hh-pink/90 transition-colors"
    >
      DOWNLOAD {mode === 'solo' ? 'ID' : 'SQUAD ID'}
    </button>
  )
}