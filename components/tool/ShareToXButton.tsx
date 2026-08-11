'use client'

import { useState } from 'react'
import { buildShareCaption } from '@/lib/shareCaption'

interface ShareToXButtonProps {
  imageBlob: Blob | null
  mode: 'solo' | 'squad'
  builderClass?: { title: string; tier: string }
}

export default function ShareToXButton({ imageBlob, mode, builderClass }: ShareToXButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    if (!imageBlob) return
    
    setIsSharing(true)
    setError(null)
    
    try {
      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        // Create a File from the Blob
        const fileName = mode === 'solo' ? 'hh-goa-2026-id.png' : 'hh-goa-2026-squad-id.png'
        const file = new File([imageBlob], fileName, { type: 'image/png' })
        
        const caption = buildShareCaption({ mode, builderClass })
        
        // Try to share with the file
        await navigator.share({
          files: [file],
          text: caption
        })
      } else {
        // Desktop fallback: POST to server and get OG link
        const formData = new FormData()
        const fileName = mode === 'solo' ? 'hh-goa-2026-id.png' : 'hh-goa-2026-squad-id.png'
        formData.append('image', imageBlob, fileName)
        
        const response = await fetch('/api/share', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload image')
        }
        
        const { id, url } = await response.json()
        
        // Build the share URL
        const shareUrl = `${window.location.origin}/s/${id}`
        // Get caption with actual origin
        const caption = buildShareCaption({ mode, builderClass }).replace('https://hh-goa-id.vercel.app', window.location.origin)
        
        // Open Twitter intent in a new tab
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, '_blank')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share error:', err)
        setError('Failed to share. Please try again.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  if (!imageBlob) return null

  return (
    <div>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="w-full border-2 border-hh-pink text-hh-pink py-4 px-8 rounded-full text-lg uppercase tracking-wider hover:bg-hh-pink hover:text-hh-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSharing ? 'SHARING...' : 'SHARE TO X'}
      </button>
      {error && (
        <div className="text-hh-pink text-sm mt-2 font-body text-center">
          {error}
        </div>
      )}
    </div>
  )
}