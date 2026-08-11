import type { Metadata, Viewport } from 'next'
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
  openGraph: {
    title: 'HH Goa 2026 — Builder ID Generator',
    description: 'Build your HH Goa 2026 Builder ID. Solo or squad. Seconds from upload to shareable.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'HH Goa 2026 Builder ID Generator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH Goa 2026 — Builder ID Generator',
    description: 'Build your HH Goa 2026 Builder ID. Solo or squad. Seconds from upload to shareable.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${anton.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}