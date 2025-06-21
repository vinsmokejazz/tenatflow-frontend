'use client'

import { useState } from 'react'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small businesses and startups',
    features: [
      'Up to 10 tenants',
      'Basic CRM features',
      'Email integration',
      'Mobile app access',
      'Standard support',
      '5 GB storage'
    ],
    popular: false,
    stripePriceId: null
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Best for growing teams and businesses',
    features: [
      'Up to 50 tenants',
      'Advanced analytics',
      'AI-powered insights',
      'Workflow automation',
      'Priority support',
      '50 GB storage',
      'Custom integrations',
      'Advanced reporting'
    ],
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations with complex needs',
    features: [
      'Unlimited tenants',
      'Full feature access',
      'Custom AI models',
      'Advanced security',
      'Dedicated support',
      'Unlimited storage',
      'White-label solution',
      'Custom development',
    ],
    popular: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
  }
]

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const { user, backendUser } = useAuth()
  const { toast } = useToast()

  const handleSubscribe = async (planId: string, planName: string) => {
    try {
      setLoading(planId)

      // If user is not authenticated, redirect to signup
      if (!user && !backendUser) {
        window.location.href = `/signup?plan=${planId}`
        return
      }

      // If it's a free plan, handle differently
      if (planId === 'free') {
        // For free plan, just show success message
        toast({
          title: 'Success',
          description: 'You are already on the free plan!',
        })
        return
      }

      // Create checkout session
      const response = await apiClient.createCheckoutSession(
        planId,
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
      console.error('Subscription error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const getButtonText = (planId: string, isLoading: boolean) => {
    if (isLoading) {
      return 'Processing...'
    }
    
    if (planId === 'free') {
      return 'Current Plan'
    }
    
    return 'Start Free Trial'
  }

  const getButtonVariant = (plan: any) => {
    if (plan.id === 'free') {
      return 'outline'
    }
    return plan.popular ? 'default' : 'outline'
  }

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your business. Start with a 14-day free trial, no credit card required.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 bg-card rounded-2xl border transition-all duration-300 group
                ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border hover:border-primary/20 hover:shadow-xl'}
              `}
              style={plan.popular ? { boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)' } : {}}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-1 shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full transition-transform duration-200 group-hover:scale-105
                  ${plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg' 
                    : ''
                  }`}
                variant={getButtonVariant(plan)}
                onClick={() => handleSubscribe(plan.id, plan.name)}
                disabled={loading === plan.id || plan.id === 'free'}
              >
                {loading === plan.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  getButtonText(plan.id, false)
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Pro plan includes a 14-day free trial. No credit card required.{' '}
          </p>
        </div>
      </div>
    </section>
  )
}