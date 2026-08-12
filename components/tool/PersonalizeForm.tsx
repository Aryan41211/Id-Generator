'use client'

import { useState, useEffect, useRef } from 'react'

interface PersonalizeFormProps {
  onPersonalize: (data: { name: string; stack: string }) => void
  label?: string
}

export default function PersonalizeForm({ onPersonalize, label }: PersonalizeFormProps) {
  const [name, setName] = useState('')
  const [stack, setStack] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPersonalizeRef = useRef(onPersonalize)
  onPersonalizeRef.current = onPersonalize

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (name.trim()) {
        onPersonalizeRef.current({
          name: name.trim(),
          stack: stack.trim(),
        })
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [name, stack])

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
      </div>
    </div>
  )
}
