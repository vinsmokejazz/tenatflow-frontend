'use client'

import { 
  Users, 
  BarChart3, 
  Brain, 
  MessageSquare, 
  Calendar, 
  Shield,
  Zap,
  Target,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Organize and track all your customer interactions in one centralized platform with advanced filtering and search capabilities.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get deep insights into your sales performance with comprehensive reports, charts, and real-time dashboards.'
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Leverage artificial intelligence to predict customer behavior, optimize sales strategies, and automate routine tasks.'
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Centralize all customer communications including emails, calls, and messages with automatic activity tracking.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automated follow-up reminders and meeting scheduling to ensure no opportunity falls through the cracks.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with role-based access control, data encryption, and compliance with industry standards.'
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Streamline repetitive tasks with powerful automation tools that save time and increase productivity.'
  },
  {
    icon: Target,
    title: 'Sales Pipeline',
    description: 'Visual pipeline management with drag-and-drop functionality to track deals from lead to closure.'
  },
  {
    icon: Globe,
    title: 'Multi-Tenant Support',
    description: 'Perfect for agencies and enterprises managing multiple clients with separate data isolation and branding.'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to grow your business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage customers, close deals, and scale your operations efficiently.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/20"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg mr-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}