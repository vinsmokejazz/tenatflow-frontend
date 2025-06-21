'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'

export default function LandingPage() {
  const { user, backendUser, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && (user || backendUser)) {
      router.replace('/dashboard')
    }
  }, [user, backendUser, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render landing page if user is authenticated
  if (user || backendUser) {
    return null
  }

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