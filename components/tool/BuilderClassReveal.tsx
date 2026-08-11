'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface BuilderClassRevealProps {
  builderClass: { title: string; tier: string } | null
}

export default function BuilderClassReveal({ builderClass }: BuilderClassRevealProps) {
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
    <AnimatePresence>
      {builderClass && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.5
          }}
          className="flex justify-center my-8"
        >
          <div className="relative">
            {/* Glow effect for Elite/Legendary */}
            {(builderClass.tier === 'Elite' || builderClass.tier === 'Legendary') && (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-hh-yellow rounded-full blur-xl opacity-50"
              />
            )}
            
            {/* Main pill */}
            <div className={`relative px-8 py-4 rounded-full font-mono-label text-lg uppercase tracking-wider ${getTierColor(builderClass.tier)}`}>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {builderClass.tier} · {builderClass.title}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}