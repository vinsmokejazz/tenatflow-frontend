'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    clients: number;
    users: number;
    deals: number;
    leads: number;
    aiInsights: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
  };
}

interface UsageData {
  plan: SubscriptionPlan;
  usage: {
    clients: { current: number; limit: number };
    users: { current: number; limit: number };
    deals: { current: number; limit: number };
    leads: { current: number; limit: number };
  };
  features: {
    aiInsights: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
  };
}

export default function SubscriptionPage() {
  const { backendUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse, usageResponse] = await Promise.all([
        apiClient.get('/subscription/plans'),
        apiClient.get('/subscription/current'),
        apiClient.get('/subscription/usage'),
      ]);

      setPlans(plansResponse.plans);
      setCurrentSubscription(subscriptionResponse);
      setUsageData(usageResponse);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(planId);
      
      // Create payment intent
      const { clientSecret } = await apiClient.post('/subscription/payment-intent', {
        planId,
      });

      // Redirect to Stripe Checkout or handle payment
      // For now, we'll just show a success message
      toast({
        title: 'Upgrade Initiated',
        description: `Starting upgrade to ${planId} plan...`,
      });

      // In a real implementation, you would:
      // 1. Redirect to Stripe Checkout
      // 2. Handle the payment confirmation
      // 3. Update the subscription status
      
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate upgrade',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(null);
    }
  };

  const handleDowngrade = async () => {
    try {
      await apiClient.post('/subscription/downgrade');
      toast({
        title: 'Success',
        description: 'Successfully downgraded to free plan',
      });
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to downgrade subscription',
        variant: 'destructive',
      });
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing preferences
          </p>
        </div>

        {/* Current Plan Status */}
        {currentSubscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(currentSubscription.subscription?.subscription || 'free')}
                Current Plan: {currentSubscription.plan?.name || 'Free'}
              </CardTitle>
              <CardDescription>
                {currentSubscription.subscription?.subscriptionStatus === 'active' 
                  ? 'Your subscription is active' 
                  : 'Your subscription status: ' + currentSubscription.subscription?.subscriptionStatus}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Billing Email</p>
                  <p className="font-medium">
                    {currentSubscription.subscription?.billingEmail || backendUser?.email || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="font-medium">
                    {currentSubscription.subscription?.subscriptionEndDate 
                      ? new Date(currentSubscription.subscription.subscriptionEndDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Overview */}
        {usageData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>
                Current usage for your {usageData.plan.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(usageData.usage).map(([key, data]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.current}/{data.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(data.current, data.limit))}`}
                        style={{ width: `${Math.min(getUsagePercentage(data.current, data.limit), 100)}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs ${getUsageColor(getUsagePercentage(data.current, data.limit))}`}>
                      {getUsagePercentage(data.current, data.limit)}% used
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.subscription?.subscription === plan.id;
            const isUpgrading = upgrading === plan.id;

            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                {isCurrentPlan && (
                  <Badge className="absolute top-4 right-4" variant="secondary">
                    Current Plan
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getPlanIcon(plan.id)}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                  <CardDescription>
                    {plan.id === 'free' ? 'Perfect for getting started' : 
                     plan.id === 'pro' ? 'Great for growing businesses' : 
                     'For large enterprises'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clients:</span>
                      <span className="font-medium">{plan.limits.clients}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Users:</span>
                      <span className="font-medium">{plan.limits.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Deals:</span>
                      <span className="font-medium">{plan.limits.deals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads:</span>
                      <span className="font-medium">{plan.limits.leads}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Insights:</span>
                      <Badge variant={plan.limits.aiInsights ? 'default' : 'secondary'}>
                        {plan.limits.aiInsights ? 'Included' : 'Not included'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Advanced Reports:</span>
                      <Badge variant={plan.limits.advancedReports ? 'default' : 'secondary'}>
                        {plan.limits.advancedReports ? 'Included' : 'Not included'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priority Support:</span>
                      <Badge variant={plan.limits.prioritySupport ? 'default' : 'secondary'}>
                        {plan.limits.prioritySupport ? 'Included' : 'Not included'}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleDowngrade}
                        disabled={isCurrentPlan}
                      >
                        Downgrade to Free
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Upgrading...
                          </>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing History */}
        {currentSubscription?.history && currentSubscription.history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Recent subscription changes and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentSubscription.history.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{item.eventType}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.amount > 0 ? `$${item.amount}` : 'Free'}
                      </p>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 