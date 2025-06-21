'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CatchAllPage() {
  const { user, backendUser, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect based on authentication status
  useEffect(() => {
    if (!authLoading) {
      if (user || backendUser) {
        // Authenticated users go to dashboard
        router.replace('/dashboard')
      } else {
        // Unauthenticated users go to landing page
        router.replace('/')
      }
    }
  }, [user, backendUser, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-muted-foreground">404</CardTitle>
          <CardDescription className="text-lg">
            Page not found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <div className="flex flex-col gap-2">
            {user || backendUser ? (
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 