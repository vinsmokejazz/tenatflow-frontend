"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ApiTest } from "@/components/debug/ApiTest";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { user, backendUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && (user || backendUser)) {
      router.replace('/dashboard');
    }
  }, [user, backendUser, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render debug page if user is authenticated
  if (user || backendUser) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
        <p className="text-muted-foreground mb-8">
          This page is for testing API endpoints and debugging authentication issues.
        </p>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
                <p><strong>Supabase User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
                <p><strong>Backend User:</strong> {backendUser ? 'Logged In' : 'Not Logged In'}</p>
              </div>
              <Button onClick={handleSignOut} className="mt-4">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        <ApiTest />
      </div>
    </div>
  );
} 