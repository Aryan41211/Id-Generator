'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center grain-overlay bg-hh-green-deep">
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono-label text-hh-yellow text-sm uppercase tracking-widest mb-6"
        >
          TASK #1 · 🌴 BUILDER ID
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl text-hh-cream uppercase leading-none mb-8"
        >
          BUILD YOUR
          <br />
          HH GOA ID
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-body text-hh-cream/60 text-xl md:text-2xl max-w-2xl mx-auto mb-12"
        >
          One photo. Your crew if you've got one. A generated builder class.
          Out in seconds.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-4 mb-16"
        >
          {/* Flat sun circle */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-hh-yellow">
            <circle cx="30" cy="30" r="25" fill="currentColor" />
          </svg>
          
          {/* Palm tree silhouette */}
          <svg width="80" height="60" viewBox="0 0 80 60" className="text-hh-pink">
            <path d="M40 60 L40 30 M40 30 C30 20 20 25 15 15 M40 30 C50 20 60 25 65 15 M40 30 C35 15 25 10 20 5 M40 30 C45 15 55 10 60 5" 
                  stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
          
          {/* Another palm tree */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-hh-yellow">
            <path d="M30 60 L30 35 M30 35 C22 28 15 32 10 22 M30 35 C38 28 45 32 50 22 M30 35 C26 22 18 18 14 12 M30 35 C34 22 42 18 46 12" 
                  stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-hh-pink text-hh-cream font-bold py-4 px-8 rounded-full text-lg uppercase tracking-wider hover:bg-hh-pink/90 transition-colors"
          onClick={() => {
            document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          START BUILDING ↓
        </motion.button>
      </div>
    </section>
  )
}