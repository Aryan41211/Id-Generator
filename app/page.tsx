import dynamic from 'next/dynamic'

const ToolSection = dynamic(() => import('@/components/ToolSection'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-hh-green-deep flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hh-pink mx-auto mb-4"></div>
        <p className="text-hh-cream font-body text-lg">Loading Builder ID Generator...</p>
      </div>
    </main>
  )
})

export default function Home() {
  return <ToolSection />
}