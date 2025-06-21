'use client';

import { ApiTest } from '@/components/debug/ApiTest';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    // Test authentication status
    const testAuth = async () => {
      try {
        const session = await fetch('/api/auth/session').catch(() => null);
        setAuthStatus({
          user: user ? {
            id: user.id,
            email: user.email,
            hasMetadata: !!user.user_metadata
          } : null,
          loading,
          session: session ? 'Available' : 'Not available'
        });
      } catch (error) {
        setAuthStatus({ error: error instanceof Error ? error.message : String(error) });
      }
    };

    if (!loading) {
      testAuth();
    }
  }, [user, loading]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <pre className="text-sm">
          {JSON.stringify(authStatus, null, 2)}
        </pre>
      </div>

      {/* API Tests */}
      <ApiTest />
    </div>
  );
} 