'use client'

import { motion } from 'framer-motion'

export default function TickerBar() {
  const tickerContent = "HH GOA 2026 · BUILDER ID GENERATOR · GOA, INDIA · #FrameInGoa · "
  const repeatedContent = tickerContent.repeat(10)

  return (
    <div className="sticky top-0 z-50 bg-hh-green-mid py-2 overflow-hidden">
      <motion.div
        className="whitespace-nowrap font-mono-label text-hh-cream text-sm uppercase tracking-widest"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {repeatedContent}
      </motion.div>
    </div>
  )
}