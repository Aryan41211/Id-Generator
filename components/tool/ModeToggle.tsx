'use client'

interface ModeToggleProps {
  mode: 'solo' | 'squad'
  onModeChange: (mode: 'solo' | 'squad') => void
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-hh-cream rounded-full p-1 inline-flex">
        <button
          onClick={() => onModeChange('solo')}
          className={`px-6 py-2 rounded-full font-mono-label text-sm uppercase tracking-wider transition-colors ${
            mode === 'solo'
              ? 'bg-hh-pink text-hh-cream'
              : 'text-hh-ink hover:text-hh-pink'
          }`}
        >
          SOLO
        </button>
        <button
          onClick={() => onModeChange('squad')}
          className={`px-6 py-2 rounded-full font-mono-label text-sm uppercase tracking-wider transition-colors ${
            mode === 'squad'
              ? 'bg-hh-pink text-hh-cream'
              : 'text-hh-ink hover:text-hh-pink'
          }`}
        >
          SQUAD
        </button>
      </div>
    </div>
  )
}