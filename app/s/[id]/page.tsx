import { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

async function getShareData(id: string) {
  // In a real implementation, this would fetch from Vercel Blob
  // For now, we'll return a placeholder
  return {
    url: `https://vercel-storage.com/share/${id}.png`,
    title: 'HH Goa 2026 Builder ID'
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  const shareData = await getShareData(id)
  
  return {
    title: shareData.title,
    description: 'Built with the HH Goa 2026 ID Generator — make yours',
    openGraph: {
      title: shareData.title,
      description: 'Built with the HH Goa 2026 ID Generator — make yours',
      images: [
        {
          url: shareData.url,
          width: 1080,
          height: 1350,
          alt: 'HH Goa 2026 Builder ID'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: shareData.title,
      description: 'Built with the HH Goa 2026 ID Generator — make yours',
      images: [shareData.url]
    }
  }
}

export default async function SharePage({ params }: PageProps) {
  const { id } = params
  const shareData = await getShareData(id)
  
  return (
    <main className="min-h-screen bg-hh-green-deep flex items-center justify-center">
      <div className="container mx-auto px-4 py-20 text-center">
        <img
          src={shareData.url}
          alt="HH Goa 2026 Builder ID"
          className="max-w-full h-auto mx-auto rounded-lg shadow-lg mb-8"
          style={{ maxHeight: '600px' }}
        />
        
        <h1 className="font-display text-4xl text-hh-cream uppercase mb-4">
          {shareData.title}
        </h1>
        
        <p className="font-body text-hh-cream/60 text-xl mb-8">
          Built with the HH Goa 2026 ID Generator — make yours
        </p>
        
        <a
          href="/"
          className="inline-block bg-hh-pink text-hh-cream font-bold py-4 px-8 rounded-full text-lg uppercase tracking-wider hover:bg-hh-pink/90 transition-colors"
        >
          CREATE YOUR OWN
        </a>
      </div>
    </main>
  )
}