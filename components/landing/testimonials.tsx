'use client'

import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Sales Director',
    company: 'TechCorp Solutions',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'TenantFlow transformed our sales process completely. We increased our conversion rate by 45% in just 3 months. The AI insights are game-changing.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'Growth Dynamics',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'The best CRM investment we\'ve made. The automation features save us 20+ hours per week, and the multi-tenant support is perfect for our agency.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Operations Manager',
    company: 'Scale Ventures',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Incredible platform! The analytics dashboard gives us insights we never had before. Customer support is exceptional and the interface is intuitive.',
    rating: 5
  },
  {
    name: 'David Thompson',
    role: 'Business Development',
    company: 'Innovate Labs',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'TenantFlow helped us organize our entire sales pipeline. The follow-up automation ensures we never miss an opportunity. Highly recommended!',
    rating: 5
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by industry leaders
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about their experience with TenantFlow.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-8 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>

              <p className="text-foreground text-lg mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}