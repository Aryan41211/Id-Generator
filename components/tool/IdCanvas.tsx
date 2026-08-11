'use client'

import { useState, useEffect, useRef } from 'react'

interface PersonData {
  image: Blob | null
  name: string
  stack: string
  builderClass: { title: string; tier: string } | null
}

interface IdCanvasProps {
  mode: 'solo' | 'squad'
  people: PersonData[]
  onImageReady: (blob: Blob) => void
}

type Phase = 'idle' | 'developing' | 'ready'

export default function IdCanvas({ mode, people, onImageReady }: IdCanvasProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null)
  const [finalPreviewUrl, setFinalPreviewUrl] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const generate = async () => {
      if (typeof window === 'undefined') return

      const validPeople = people.filter(p => p.image && p.name && p.builderClass)

      if (mode === 'solo' && validPeople.length < 1) {
        setPhase('idle')
        setRawPreviewUrl(null)
        setFinalPreviewUrl(null)
        return
      }
      if (mode === 'squad' && validPeople.length < 2) {
        setPhase('idle')
        setRawPreviewUrl(null)
        setFinalPreviewUrl(null)
        return
      }
      if (validPeople.length === 0) {
        setPhase('idle')
        setRawPreviewUrl(null)
        setFinalPreviewUrl(null)
        return
      }

      // Create instant raw preview from first person's image blob
      const firstBlob = validPeople[0].image!
      const rawUrl = URL.createObjectURL(firstBlob)
      setRawPreviewUrl(rawUrl)
      setFinalPreviewUrl(null)
      setPhase('developing')
      setShowHint(false)
      startTimeRef.current = Date.now()

      // Show hint after 1.5s
      hintTimerRef.current = setTimeout(() => setShowHint(true), 1500)

      try {
        const { composeSoloId, composeSquadId } = await import('@/lib/canvasCompose')

        let blob: Blob
        if (mode === 'solo') {
          const person = validPeople[0]
          blob = await composeSoloId({
            photo: person.image!,
            name: person.name,
            stack: person.stack,
            builderClass: person.builderClass!
          })
        } else {
          blob = await composeSquadId({
            people: validPeople.map(p => ({
              photo: p.image!,
              name: p.name,
              stack: p.stack,
              builderClass: p.builderClass!
            }))
          })
        }

        // Ensure developing phase shows for at least 500ms
        const elapsed = Date.now() - startTimeRef.current
        const remaining = Math.max(0, 500 - elapsed)
        await new Promise(r => setTimeout(r, remaining))

        const finalUrl = URL.createObjectURL(blob)
        setFinalPreviewUrl(finalUrl)
        setPhase('ready')
        onImageReady(blob)
      } catch (error) {
        console.error('Error generating image:', error)
        setPhase('idle')
      } finally {
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
        setShowHint(false)
      }
    }

    generate()

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      if (minTimerRef.current) clearTimeout(minTimerRef.current)
    }
  }, [mode, people, onImageReady])

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
      if (finalPreviewUrl) URL.revokeObjectURL(finalPreviewUrl)
    }
  }, [])

  if (phase === 'idle') return null

  return (
    <div className="flex justify-center py-8">
      <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '420px', width: '100%' }}>
        {/* Raw photo — developing phase */}
        {rawPreviewUrl && phase === 'developing' && (
          <div className="relative">
            <div
              className="w-full rounded-lg overflow-hidden developing-photo"
              style={{ aspectRatio: '4 / 5' }}
            >
              <img
                src={rawPreviewUrl}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
              {/* Developing overlay */}
              <div className="developing-overlay" />
            </div>
            {showHint && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-4 px-4">
                <p className="font-mono-label text-hh-cream text-xs uppercase tracking-widest text-center animate-pulse">
                  Developing your ID...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Final composited card — cross-fade in */}
        {finalPreviewUrl && (
          <div className={`rounded-lg overflow-hidden ${phase === 'ready' ? 'crossfade-in' : ''}`}>
            <img
              src={finalPreviewUrl}
              alt="Generated HH Goa 2026 ID"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .developing-photo {
          filter: saturate(0.4) contrast(0.85) brightness(1.05);
          opacity: 0.6;
          animation: develop-reveal 0.6s ease-out forwards;
        }

        .developing-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(11, 61, 36, 0.2) 0%,
            rgba(246, 239, 216, 0.15) 100%
          );
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        @keyframes develop-reveal {
          0% {
            filter: saturate(0.4) contrast(0.85) brightness(1.05);
            opacity: 0.6;
          }
          100% {
            filter: saturate(1) contrast(1) brightness(1);
            opacity: 1;
          }
        }

        .crossfade-in {
          animation: crossfade-in 0.25s ease-in-out;
        }

        @keyframes crossfade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}