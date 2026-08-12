'use client'

import { useEffect, useRef } from 'react'
import { ensureFonts } from '@/lib/ensureFonts'
import { preloadFrameAssets } from '@/lib/canvasCompose'

export function usePreload() {
  const preloaded = useRef(false)

  useEffect(() => {
    if (preloaded.current) return
    preloaded.current = true

    ensureFonts()
    preloadFrameAssets()

    import('heic2any').then(() => {
      console.log('[preload] heic2any WASM loaded')
    }).catch(() => {
      console.warn('[preload] heic2any preload failed')
    })
  }, [])
}
