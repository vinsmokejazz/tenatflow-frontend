'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  price: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StripeCheckout({ 
  planId, 
  planName, 
  price, 
  onSuccess, 
  onCancel 
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const response = await apiClient.customRequest('/subscription/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      const { sessionId } = response;

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : (
        `Subscribe to ${planName} - $${price}/month`
      )}
    </Button>
  );
} 