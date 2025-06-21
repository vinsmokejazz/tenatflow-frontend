"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ThreeDCardDemo from "@/components/ui/3d-card-demo";

export function Hero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* ✨ Background Gradient with Opacity */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-slate-700 via-emerald-100 to-emerald-500 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 opacity-20 z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <div className="flex-1 text-center lg:text-left">
          {/* Headline & Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Streamline Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                Customer Relationships
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              TenantFlow helps you manage leads, close deals, and grow your
              business with AI-powered insights and automation. Perfect for
              modern sales teams.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl 
    bg-indigo-600 text-white hover:bg-indigo-700 
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 
    transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <span className="relative z-10 group-hover:underline">
                  Start Free Trial
                </span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg hover:shadow-md"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto lg:mx-0"
          >
            {/* Card 1 */}
            <div className="group transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl hover:brightness-105 bg-gradient-to-br from-white/70 to-blue-50/30 dark:from-slate-800/70 dark:to-slate-700/30 rounded-xl backdrop-blur-sm shadow-lg p-6 flex items-center justify-center space-x-4">
              <BarChart3 className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Businesses Trust Us
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl hover:brightness-105 bg-gradient-to-br from-white/70 to-emerald-50/30 dark:from-slate-800/70 dark:to-slate-700/30 rounded-xl backdrop-blur-sm shadow-lg p-6 flex items-center justify-center space-x-4">
              <Users className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  10K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Users
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl hover:brightness-105 bg-gradient-to-br from-white/70 to-purple-50/30 dark:from-slate-800/70 dark:to-slate-700/30 rounded-xl backdrop-blur-sm shadow-lg p-6 flex items-center justify-center space-x-4">
              <TrendingUp className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  95%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3D Card Visual */}
        <div className="flex-1 hidden lg:flex items-center justify-center z-10">
          <ThreeDCardDemo />
        </div>
      </div>
    </section>
  );
}
