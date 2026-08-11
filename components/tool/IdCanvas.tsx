'use client'

import { useState, useEffect } from 'react'
import { composeSoloId, composeSquadId } from '@/lib/canvasCompose'

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

export default function IdCanvas({ mode, people, onImageReady }: IdCanvasProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const generateImage = async () => {
      // Check if we have all required data
      const validPeople = people.filter(p => p.image && p.name && p.builderClass)
      
      if (validPeople.length === 0) {
        setPreviewUrl(null)
        return
      }
      
      // For solo mode, we need exactly one person
      if (mode === 'solo' && validPeople.length < 1) {
        setPreviewUrl(null)
        return
      }
      
      // For squad mode, we need at least two people
      if (mode === 'squad' && validPeople.length < 2) {
        setPreviewUrl(null)
        return
      }
      
      setIsLoading(true)
      
      try {
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
        
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        onImageReady(blob)
      } catch (error) {
        console.error('Error generating image:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    generateImage()
  }, [mode, people, onImageReady])

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hh-pink"></div>
      </div>
    )
  }

  if (!previewUrl) {
    return null
  }

  return (
    <div className="flex justify-center py-8">
      <div className="relative">
        <div className="border-2 border-dashed border-hh-pink rounded-lg p-4">
          <img
            src={previewUrl}
            alt="Generated HH Goa 2026 ID"
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>
    </div>
  )
}