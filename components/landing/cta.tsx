'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CTA() {
  const [loading, setLoading] = useState(false)
  const { user, backendUser } = useAuth()
  const { toast } = useToast()

  const handleStartTrial = async () => {
    try {
      setLoading(true)

      // If user is not authenticated, redirect to signup
      if (!user && !backendUser) {
        window.location.href = '/signup'
        return
      }

      // If user is authenticated, start with Pro plan
      const response = await apiClient.createCheckoutSession(
        'pro',
        `${window.location.origin}/subscription?success=true`,
        `${window.location.origin}/subscription?canceled=true`
      )

      const { sessionId } = response

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }

    } catch (error: any) {
      console.error('Trial start error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to start trial',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-950 via-purple-800 to-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold  mb-6 bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
              Ready to transform your business?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of businesses already using TenantFlow to streamline their operations and grow faster.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              onClick={handleStartTrial}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                Schedule Demo
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center text-blue-100"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}