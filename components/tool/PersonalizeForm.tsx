'use client'

import { useState, useEffect } from 'react'
import { generateBuilderClass } from '@/lib/builderClass'

interface PersonalizeFormProps {
  onPersonalize: (data: { name: string; stack: string; builderClass: { title: string; tier: string } }) => void
  label?: string
}

export default function PersonalizeForm({ onPersonalize, label }: PersonalizeFormProps) {
  const [name, setName] = useState('')
  const [stack, setStack] = useState('')
  const [builderClass, setBuilderClass] = useState<{ title: string; tier: string } | null>(null)

  useEffect(() => {
    if (name.trim()) {
      const seed = `${name.trim()}-${stack.trim()}`
      const generated = generateBuilderClass(seed)
      setBuilderClass(generated)
      onPersonalize({
        name: name.trim(),
        stack: stack.trim(),
        builderClass: generated
      })
    } else {
      setBuilderClass(null)
    }
  }, [name, stack, onPersonalize])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Common':
      case 'Rare':
        return 'bg-hh-yellow text-hh-ink'
      case 'Elite':
      case 'Legendary':
        return 'bg-hh-pink text-hh-cream'
      default:
        return 'bg-hh-yellow text-hh-ink'
    }
  }

  return (
    <div className="bg-hh-cream border border-hh-cream-line rounded-lg p-6 shadow-md">
      {label && (
        <div className="text-sm font-mono-label text-hh-ink mb-4 uppercase tracking-wider">
          {label}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono-label text-hh-ink mb-2 uppercase tracking-wider">
            Your name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-hh-cream-line rounded-lg font-body text-hh-ink focus:outline-none focus:border-hh-pink transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-mono-label text-hh-ink mb-2 uppercase tracking-wider">
            Your stack / role
          </label>
          <input
            type="text"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            maxLength={28}
            placeholder="Rust · Solidity or Product / Design"
            className="w-full px-4 py-3 border border-hh-cream-line rounded-lg font-body text-hh-ink focus:outline-none focus:border-hh-pink transition-colors"
          />
        </div>
        
        {builderClass && (
          <div className="mt-6">
            <div className="text-sm font-mono-label text-hh-ink mb-2 uppercase tracking-wider">
              Your Builder Class
            </div>
            <div className={`inline-block px-4 py-2 rounded-full font-mono-label text-sm uppercase tracking-wider ${getTierColor(builderClass.tier)}`}>
              {builderClass.tier} · {builderClass.title}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}