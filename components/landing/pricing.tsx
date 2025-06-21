'use client'

import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import Link from 'next/link'

const plans = [
  {
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
    popular: false
  },
  {
    name: 'Professional',
    price: '$79',
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
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$199',
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
    popular: false
  }
]

export function Pricing() {
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

              <Link href="/signup" className="block">
                <Button 
                  className={`w-full transition-transform duration-200 group-hover:scale-105
                    ${plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg' 
                      : ''
                    }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Need a custom plan?
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}