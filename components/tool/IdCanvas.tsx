'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface PersonData {
  image: Blob | null
  name: string
  stack: string
}

interface IdCanvasProps {
  mode: 'solo' | 'squad'
  people: PersonData[]
  onImageReady: (blob: Blob) => void
}

export default function IdCanvas({ mode, people, onImageReady }: IdCanvasProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const genRef = useRef(0)
  const urlRef = useRef<string | null>(null)

  const validPeople = people.filter(p => p.image && p.name)
  const hasEnough = mode === 'solo' ? validPeople.length >= 1 : validPeople.length >= 2

  useEffect(() => {
    if (!hasEnough) {
      setPreviewUrl(null)
      setIsComposing(false)
      setError(null)
      return
    }

    const gen = ++genRef.current
    setIsComposing(true)
    setError(null)

    const timer = setTimeout(async () => {
      if (gen !== genRef.current) return

      try {
        console.log('[compose] START', { mode, people: validPeople.map(p => p.name) })
        const { composeSoloId, composeSquadId } = await import('@/lib/canvasCompose')

        if (gen !== genRef.current) return

        let blob: Blob
        if (mode === 'solo') {
          const p = validPeople[0]
          blob = await composeSoloId({
            photo: p.image!,
            name: p.name,
            stack: p.stack,
          })
        } else {
          blob = await composeSquadId({
            people: validPeople.map(p => ({
              photo: p.image!,
              name: p.name,
              stack: p.stack,
            }))
          })
        }

        if (gen !== genRef.current) return

        console.log('[compose] DONE, blob size:', blob.size)
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setPreviewUrl(url)
        setIsComposing(false)
        onImageReady(blob)
      } catch (err) {
        console.error('[compose] ERROR:', err)
        if (gen === genRef.current) {
          setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
          setIsComposing(false)
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [mode, hasEnough, validPeople.length,
    ...validPeople.map(p => `${p.image?.size || 0}-${p.name}-${p.stack}`)
  ])

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }
  }, [])

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-center max-w-md">
          <p className="text-red-700 font-mono-label text-sm mb-2">{error}</p>
          <button onClick={() => { setError(null); genRef.current++ }} className="text-hh-pink underline text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!hasEnough) return null

  return (
    <div className="flex justify-center py-8">
      <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '420px', width: '100%' }}>
        {isComposing && (
          <div className="flex items-center justify-center bg-hh-cream rounded-lg" style={{ aspectRatio: '4 / 5' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-hh-pink mx-auto mb-3" />
              <p className="font-mono-label text-hh-ink text-xs uppercase tracking-widest">
                Generating your ID...
              </p>
            </div>
          </div>
        )}

        {previewUrl && (
          <img
            key={previewUrl}
            src={previewUrl}
            alt="Generated HH Goa 2026 ID"
            className="w-full h-auto rounded-lg"
            onLoad={() => console.log('[compose] image rendered')}
          />
        )}
      </div>
    </div>
  )
}
