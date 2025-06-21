'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export function ApiTest() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const addResult = (endpoint: string, result: any) => {
    setResults(prev => [...prev, { endpoint, result, timestamp: new Date().toISOString() }])
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      // Test Supabase auth
      const { data: { session } } = await supabase.auth.getSession()
      addResult('Supabase Session', {
        hasSession: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        } : null,
        accessToken: session?.access_token ? 'Present' : 'Missing'
      })

      // Test API client token
      addResult('API Client Token', {
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0
      })

      // Test backend auth
      if (session?.access_token) {
        try {
          const userData = await apiClient.getUser()
          addResult('Backend User', { success: true, user: userData })
        } catch (error: any) {
          addResult('Backend User', { 
            success: false, 
            error: error.message,
            status: error.message.includes('403') ? 'Forbidden' : 'Other'
          })
        }
      }
    } catch (error: any) {
      addResult('Auth Test', { error: error.message })
    }
    setLoading(false)
  }

  const testEndpoints = async () => {
    setLoading(true)
    const endpoints = [
      { name: 'Business', method: () => apiClient.getBusiness() },
      { name: 'Clients', method: () => apiClient.getClients() },
      { name: 'Leads', method: () => apiClient.getLeads() },
      { name: 'Follow-ups', method: () => apiClient.getFollowUps() },
      { name: 'Deals', method: () => apiClient.getDeals() },
      { name: 'Reports', method: () => apiClient.getReports() },
      { name: 'AI Insights', method: () => apiClient.getAIInsights() },
      { name: 'Users', method: () => apiClient.getUsers() },
    ]

    for (const endpoint of endpoints) {
      try {
        const result = await endpoint.method()
        addResult(endpoint.name, { success: true, data: result })
      } catch (error: any) {
        addResult(endpoint.name, { 
          success: false, 
          error: error.message,
          status: error.message.includes('403') ? 'Forbidden' : 
                 error.message.includes('401') ? 'Unauthorized' : 'Other'
        })
      }
    }
    setLoading(false)
  }

  const testAnalytics = async () => {
    setLoading(true)
    try {
      // Get user data from backend to get the correct business ID
      const userData = await apiClient.getUser()
      const businessId = userData.businessId
      
      if (!businessId) {
        addResult('Analytics', { error: 'No business ID found' })
        setLoading(false)
        return
      }

      const endpoints = [
        { name: 'Dashboard Stats', method: () => apiClient.getDashboardStats(businessId) },
        { name: 'Sales Pipeline', method: () => apiClient.getSalesPipeline(businessId) },
        { name: 'Lead Conversion', method: () => apiClient.getLeadConversion(businessId) },
        { name: 'Predictions', method: () => apiClient.getPredictions(businessId) },
      ]

      for (const endpoint of endpoints) {
        try {
          const result = await endpoint.method()
          addResult(endpoint.name, { success: true, data: result })
        } catch (error: any) {
          addResult(endpoint.name, { 
            success: false, 
            error: error.message,
            businessId,
            status: error.message.includes('403') ? 'Forbidden' : 
                   error.message.includes('401') ? 'Unauthorized' : 'Other'
          })
        }
      }
    } catch (error: any) {
      addResult('Analytics', { error: error.message })
    }
    setLoading(false)
  }

  const testDealsAuth = async () => {
    setLoading(true);
    try {
      console.log('Testing deals authentication...');
      
      // Test if we can get deals (this should fail if auth is broken)
      const deals = await apiClient.getDeals();
      addResult('Deals Auth Test', { success: true, data: deals });
    } catch (error: any) {
      addResult('Deals Auth Test', { 
        success: false, 
        error: error.message,
        status: error.message.includes('401') ? 'Unauthorized' : 'Other'
      });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={testAuth} disabled={loading}>
              Test Authentication
            </Button>
            <Button onClick={testDealsAuth} disabled={loading}>
              Test Deals Auth
            </Button>
            <Button onClick={testEndpoints} disabled={loading}>
              Test All Endpoints
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <strong>Current User:</strong> {user?.email || 'Not authenticated'}
            </div>
            <Button variant="outline" onClick={clearResults} size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm">{result.endpoint}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs">
                <strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}
              </div>
              <Textarea
                value={JSON.stringify(result.result, null, 2)}
                readOnly
                className="mt-2 text-xs"
                rows={Math.min(10, JSON.stringify(result.result, null, 2).split('\n').length)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 