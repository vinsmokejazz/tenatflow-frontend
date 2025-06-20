'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Streamline Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                Customer Relationships
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TenantFlow helps you manage leads, close deals, and grow your business with 
              AI-powered insights and automation. Perfect for modern sales teams.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Learn More
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-3 p-6 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Businesses Trust Us</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <Users className="h-8 w-8 text-emerald-600" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}