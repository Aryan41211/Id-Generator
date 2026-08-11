'use client'

import { useState } from 'react'
import TickerBar from '@/components/landing/TickerBar'
import Hero from '@/components/landing/Hero'
import HowItWorksStrip from '@/components/landing/HowItWorksStrip'
import FeatureTagCard from '@/components/landing/FeatureTagCard'
import SiteFooter from '@/components/landing/SiteFooter'
import ModeToggle from '@/components/tool/ModeToggle'
import UploadSlot from '@/components/tool/UploadSlot'

export default function Home() {
  const [mode, setMode] = useState<'solo' | 'squad'>('solo')
  const [images, setImages] = useState<Blob[]>([])

  const handleModeChange = (newMode: 'solo' | 'squad') => {
    setMode(newMode)
    // Reset images when switching modes
    if (newMode === 'solo') {
      setImages(images.slice(0, 1))
    } else {
      // Keep existing images for squad mode
    }
  }

  const handleImageReady = (imageBlob: Blob, index?: number) => {
    if (mode === 'solo') {
      setImages([imageBlob])
    } else {
      if (index !== undefined) {
        const newImages = [...images]
        newImages[index] = imageBlob
        setImages(newImages)
      } else {
        setImages([...images, imageBlob])
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  const addTeammate = () => {
    if (images.length < 4) {
      // Add an empty slot by adding a placeholder
      setImages([...images, null as unknown as Blob])
    }
  }

  console.log('Images state:', images)

  return (
    <main className="min-h-screen">
      <TickerBar />
      <Hero />
      <HowItWorksStrip />
      <FeatureTagCard />
      
      {/* Tool section */}
      <section id="tool" className="py-20 bg-hh-green-deep">
        <div className="container mx-auto px-4 max-w-4xl">
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          
          <div className="bg-hh-cream rounded-lg p-8 shadow-lg">
            <h2 className="font-display text-3xl text-hh-ink uppercase mb-6 text-center">
              {mode === 'solo' ? 'Upload Your Photo' : 'Upload Crew Photos'}
            </h2>
            
            {mode === 'solo' ? (
              <div className="max-w-md mx-auto">
                <UploadSlot 
                  onImageReady={(blob) => handleImageReady(blob)} 
                />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {images.map((_, index) => (
                    <div key={index} className="relative">
                      <div className="text-sm font-mono-label text-hh-ink mb-2">
                        Crew member {index + 1}
                      </div>
                      <UploadSlot
                        onImageReady={(blob) => handleImageReady(blob, index)}
                        onRemove={() => handleRemoveImage(index)}
                        showRemove={true}
                      />
                    </div>
                  ))}
                </div>
                
                {images.length < 4 && (
                  <button
                    onClick={addTeammate}
                    className="w-full border-2 border-hh-pink text-hh-pink py-3 rounded-lg font-mono-label uppercase tracking-wider hover:bg-hh-pink hover:text-hh-cream transition-colors"
                  >
                    + Add teammate ({images.length}/4)
                  </button>
                )}
                
                {images.length > 0 && (
                  <div className="text-center mt-4 text-sm font-mono-label text-hh-ink">
                    {images.length}/4 crew members added
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </main>
  )
}