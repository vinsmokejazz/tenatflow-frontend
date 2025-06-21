'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    skills: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, user, backendUser, loading: authLoading } = useAuth()
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
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1f] via-[#161625] to-[#1e1e30] flex items-center justify-center">
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
    if (!formData.agree) return toast.error('You must agree to terms & conditions')
    if (formData.password !== formData.confirmPassword)
      return toast.error('Passwords do not match')
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(formData.password))
      return toast.error('Password must contain upper, lower, number & special char')
    setLoading(true)
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        business_name: formData.businessName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        skills: formData.skills,
      }
      const { data, error } = await signUp(formData.email, formData.password, userData)
      if (error) toast.error(error.message)
      else if (data?.backend) {
        toast.success('Account created! You can now sign in.')
        router.push('/signin')
      } else toast.error('Registration failed. Try again.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1f] via-[#161625] to-[#1e1e30] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
        {/* Illustration */}
        <div className="hidden md:flex items-center justify-center bg-[#1a1a2e]">
          <img
            src="images/Screenshot 2025-06-21 222848.png"
            alt="Signup Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/10 rounded-none md:rounded-r-3xl flex flex-col justify-center p-8 md:p-12 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-yellow-400 flex items-center justify-center" />
            <span className="text-white text-xl font-bold">TenantFlow</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-sm text-[#cfcfd6] mb-8">Start your free trial today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-[#cfcfd6]">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="eg. Bruce"
                  className="mt-2 bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[#cfcfd6]">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="eg. Wayne"
                  className="mt-2 bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="businessName" className="text-[#cfcfd6]">Business Name</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                placeholder="eg. Wayne Enterprises"
                className="mt-2 bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#cfcfd6]">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                type="email"
                placeholder="you@example.com"
                className="mt-2 bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] focus:ring-1 focus:ring-purple-500"
              />
            </div>
    
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-[#cfcfd6]">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] pr-10 focus:ring-1 focus:ring-purple-500"
                    placeholder="Password"
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
              <div>
                <Label htmlFor="confirmPassword" className="text-[#cfcfd6]">Confirm</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-transparent border border-[#33334d] text-white placeholder-[#8888aa] pr-10 focus:ring-1 focus:ring-purple-500"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={formData.agree}
                onChange={handleInputChange}
                className="accent-purple-500 w-4 h-4 rounded"
                required
              />
              <Label htmlFor="agree" className="text-[#b0b0c3] text-sm">
                I agree to the terms & conditions
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-semibold text-md rounded-lg py-3 transition duration-200 mt-2 shadow-md"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>

          <p className="text-xs text-center text-[#cfcfd6] mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-purple-400 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
