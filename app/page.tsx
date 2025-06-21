import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background scroll-smooth pt-24">
      <Navbar />
      <main className="flex flex-col gap-0">
        <Hero />
        <div className="w-full h-px bg-border my-0" />
        <Features />
        <div className="w-full h-px bg-border my-0" />
        <Pricing />
        <div className="w-full h-px bg-border my-0" />
        <Testimonials />
        <div className="w-full h-px bg-border my-0" />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}