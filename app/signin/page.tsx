'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, user, backendUser, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated (check both Supabase and backend user)
  useEffect(() => {
    if (!authLoading && (user || backendUser)) {
      router.replace('/dashboard')
    }
  }, [user, backendUser, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a17] via-[#131324] to-[#18182a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the form if user is already authenticated
  if (user || backendUser) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a17] via-[#131324] to-[#18182a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-purple-400/10 blur-[2px]" />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-yellow-400 flex items-center justify-center" />
                <span className="text-2xl font-bold text-white">TenantFlow</span>
              </Link>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-[#cfcfd6]">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#cfcfd6]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#cfcfd6]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10 bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-semibold text-md rounded-lg py-3 transition duration-200 mt-2 shadow-md"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#cfcfd6]">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}