'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
      <html>
        <body>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive">Something went wrong!</CardTitle>
              <CardDescription>
                An unexpected error occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {error.message || 'An unexpected error occurred. Please try again.'}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={reset}>
                  Try Again
                </Button>
                {user || backendUser ? (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/')}
                  >
                    Go to Home
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
} 