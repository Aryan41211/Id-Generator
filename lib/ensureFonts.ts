let fontsReady = false

export async function ensureFonts(): Promise<void> {
  if (fontsReady) return
  await document.fonts.ready

  // Force browser to decode each font by measuring text
  const test = document.createElement('span')
  test.style.cssText = 'position:absolute;left:-9999px;white-space:nowrap'
  document.body.appendChild(test)

  const families = ['Anton', 'Space Grotesk', 'JetBrains Mono']
  for (const f of families) {
    test.style.fontFamily = f
    test.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    // Force layout/decode
    void test.offsetWidth
  }
  document.body.removeChild(test)
  fontsReady = true
  console.log('[fonts] all custom fonts decoded and ready for canvas')
}
