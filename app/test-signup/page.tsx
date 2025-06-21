'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function TestSignupPage() {
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    business_name: 'Test Business'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing signup with:', formData)
      const response = await apiClient.register(formData)
      setResult({ success: true, data: response })
      toast.success('Signup test successful!')
    } catch (error) {
      console.error('Signup test failed:', error)
      setResult({ success: false, error: error instanceof Error ? error.message : String(error) })
      toast.error('Signup test failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Test Signup</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                name="business_name"
                type="text"
                value={formData.business_name}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </Button>
          </form>

          {result && (
            <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h3 className="font-semibold">{result.success ? 'Success' : 'Error'}</h3>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 