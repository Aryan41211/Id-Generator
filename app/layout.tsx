import type { Metadata } from 'next'
import { Anton, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-label',
})

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Builder ID Generator',
  description: 'Build your HH Goa 2026 Builder ID. Solo or squad. Seconds from upload to shareable.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}