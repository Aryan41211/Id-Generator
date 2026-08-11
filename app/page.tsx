import TickerBar from '@/components/landing/TickerBar'
import Hero from '@/components/landing/Hero'
import HowItWorksStrip from '@/components/landing/HowItWorksStrip'
import FeatureTagCard from '@/components/landing/FeatureTagCard'
import SiteFooter from '@/components/landing/SiteFooter'

export default function Home() {
  return (
    <main className="min-h-screen">
      <TickerBar />
      <Hero />
      <HowItWorksStrip />
      <FeatureTagCard />
      
      {/* Tool section placeholder */}
      <section id="tool" className="py-20 bg-hh-green-deep">
        <div className="container mx-auto px-4 text-center">
          <p className="text-hh-cream/60 font-body text-xl">
            Tool section coming in next prompt...
          </p>
        </div>
      </section>
      
      <SiteFooter />
    </main>
  )
}