'use client'

import { useState, useCallback } from 'react'
import TickerBar from '@/components/landing/TickerBar'
import Hero from '@/components/landing/Hero'
import HowItWorksStrip from '@/components/landing/HowItWorksStrip'
import FeatureTagCard from '@/components/landing/FeatureTagCard'
import SiteFooter from '@/components/landing/SiteFooter'
import ModeToggle from '@/components/tool/ModeToggle'
import UploadSlot from '@/components/tool/UploadSlot'
import PersonalizeForm from '@/components/tool/PersonalizeForm'
import IdCanvas from '@/components/tool/IdCanvas'
import BuilderClassReveal from '@/components/tool/BuilderClassReveal'
import DownloadButton from '@/components/tool/DownloadButton'
import ShareToXButton from '@/components/tool/ShareToXButton'

interface PersonData {
  image: Blob | null
  name: string
  stack: string
  builderClass: { title: string; tier: string } | null
}

export default function Home() {
  const [mode, setMode] = useState<'solo' | 'squad'>('solo')
  const [people, setPeople] = useState<PersonData[]>([
    { image: null, name: '', stack: '', builderClass: null }
  ])
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null)

  const handleModeChange = (newMode: 'solo' | 'squad') => {
    setMode(newMode)
    if (newMode === 'solo') {
      setPeople(people.slice(0, 1))
    } else {
      // Ensure at least one person for squad mode
      if (people.length === 0) {
        setPeople([{ image: null, name: '', stack: '', builderClass: null }])
      }
    }
    setGeneratedImage(null)
  }

  const handleImageReady = (imageBlob: Blob, index: number) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], image: imageBlob }
    setPeople(newPeople)
    setGeneratedImage(null)
  }

  const handleRemoveImage = (index: number) => {
    const newPeople = people.filter((_, i) => i !== index)
    setPeople(newPeople)
    setGeneratedImage(null)
  }

  const addTeammate = () => {
    if (people.length < 4) {
      setPeople([...people, { image: null, name: '', stack: '', builderClass: null }])
    }
  }

  const handlePersonalize = useCallback((index: number, data: { name: string; stack: string; builderClass: { title: string; tier: string } }) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], ...data }
    setPeople(newPeople)
    setGeneratedImage(null)
  }, [people])

  const handleImageGenerated = useCallback((blob: Blob) => {
    setGeneratedImage(blob)
  }, [])

  // Get the first person's builder class for the reveal animation
  const firstPersonBuilderClass = people[0]?.builderClass

  console.log('People state:', people)

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
              <div className="max-w-md mx-auto space-y-8">
                <UploadSlot 
                  onImageReady={(blob) => handleImageReady(blob, 0)} 
                />
                <PersonalizeForm 
                  onPersonalize={(data) => handlePersonalize(0, data)}
                />
              </div>
            ) : (
              <div>
                <div className="space-y-8 mb-6">
                  {people.map((person, index) => (
                    <div key={index} className="border border-hh-cream-line rounded-lg p-6">
                      <div className="text-sm font-mono-label text-hh-ink mb-4 uppercase tracking-wider">
                        Crew member {index + 1}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UploadSlot
                          onImageReady={(blob) => handleImageReady(blob, index)}
                          onRemove={() => handleRemoveImage(index)}
                          showRemove={people.length > 1}
                        />
                        <PersonalizeForm 
                          onPersonalize={(data) => handlePersonalize(index, data)}
                          label={`Crew member ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {people.length < 4 && (
                  <button
                    onClick={addTeammate}
                    className="w-full border-2 border-hh-pink text-hh-pink py-3 rounded-lg font-mono-label uppercase tracking-wider hover:bg-hh-pink hover:text-hh-cream transition-colors"
                  >
                    + Add teammate ({people.length}/4)
                  </button>
                )}
                
                {people.length > 0 && (
                  <div className="text-center mt-4 text-sm font-mono-label text-hh-ink">
                    {people.length}/4 crew members added
                  </div>
                )}
              </div>
            )}
            
            {/* Builder Class Reveal */}
            <BuilderClassReveal builderClass={firstPersonBuilderClass} />
            
            {/* Generated Image Preview */}
            <IdCanvas 
              mode={mode}
              people={people}
              onImageReady={handleImageGenerated}
            />
            
            {/* Download and Share Buttons */}
            {generatedImage && (
              <div className="mt-8 space-y-4">
                <DownloadButton imageBlob={generatedImage} mode={mode} />
                <ShareToXButton 
                  imageBlob={generatedImage} 
                  mode={mode} 
                  builderClass={firstPersonBuilderClass || undefined}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </main>
  )
}