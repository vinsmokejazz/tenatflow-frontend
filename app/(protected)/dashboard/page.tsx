'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SampleChart } from '@/components/dashboard/SampleChart';
import { DollarSign, Users, Briefcase, TrendingUp, Activity, Clock, AlertTriangle, CheckCircle, Calendar, Target, User, RefreshCw } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useDashboardUpdates } from '@/hooks/use-dashboard-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { user, backendUser, hasRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Auto-refresh interval
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_INTERVAL = 30000; // 30 seconds

  const fetchDashboard = useCallback(async (showLoading = false) => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    if (showLoading) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Get user data from backend to get the correct business ID
      const userData = await apiClient.getUser();
      const businessId = userData.businessId;
      
      if (!businessId) {
        setError('No business ID found for user');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch all data in parallel for better performance
      const [stats, analytics, tasksData, clientsData] = await Promise.all([
        apiClient.getDashboardStats(businessId),
        apiClient.getAnalytics(),
        apiClient.getDashboardTasks(),
        apiClient.getClients()
      ]);
      
      setKpi(stats.kpi || {});
      setChartData(stats.chartData || []);
      setActivities(analytics.activities || []);
      setClients(clientsData || []);
      setOverdueTasks(tasksData.overdue || []);
      setUpcomingTasks(tasksData.upcoming || []);
      setLastUpdate(new Date());
      
      // Show toast for manual refresh only
      if (showLoading) {
        toast({
          title: 'Dashboard Updated',
          description: 'All data has been refreshed successfully.',
        });
      }
      
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    }
    
    setLoading(false);
    setRefreshing(false);
  }, [user, backendUser, hasRole, toast]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Set up real-time updates
  const { notifyDataChange } = useDashboardUpdates({
    onDataChange: () => {
      fetchDashboard(false);
    },
    enabled: !loading && !!user
  });

  // Set up auto-refresh
  useEffect(() => {
    if (user && !loading) {
      // Clear existing interval
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
      
      // Set up new interval
      autoRefreshInterval.current = setInterval(() => {
        fetchDashboard(false);
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [user, loading, fetchDashboard]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, []);

  // Get task status badge
  const getTaskStatusBadge = (dueDate: string, completed: boolean) => {
    if (completed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  return (
    <div className="space-y-8 px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {refreshing && (
              <span className="ml-2 text-blue-600 flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-8">
          {/* Skeleton KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg animate-pulse">
                    <div className="h-6 w-6 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Tasks Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg shadow-sm">
                <div className="p-6 border-b border-border">
                  <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="p-1 bg-muted rounded-full animate-pulse">
                        <div className="h-3 w-3 bg-muted rounded"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Chart + Activity Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="h-6 bg-muted rounded w-24 animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded w-40 animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="h-64 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full animate-pulse">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton Quick Actions */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="h-6 bg-muted rounded w-24 animate-pulse mb-2"></div>
              <div className="h-4 bg-muted rounded w-40 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-red-600">Error Loading Dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* KPI Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Revenue"
              value={kpi?.totalRevenue || '$0'}
              icon={DollarSign}
              description={kpi?.revenueDescription}
              trend={kpi?.revenueTrend}
              trendDirection={kpi?.revenueTrendDirection}
            />
            <KpiCard
              title="Active Clients"
              value={kpi?.activeClients?.toString() || '0'}
              icon={Users}
              description={kpi?.clientsDescription}
              trend={kpi?.clientsTrend}
              trendDirection={kpi?.clientsTrendDirection}
            />
            <KpiCard
              title="Open Deals"
              value={kpi?.openDeals?.toString() || '0'}
              icon={Briefcase}
              description={kpi?.dealsDescription}
              trend={kpi?.dealsTrend}
              trendDirection={kpi?.dealsTrendDirection}
            />
            <KpiCard
              title="Conversion Rate"
              value={kpi?.conversionRate || '0%'}
              icon={TrendingUp}
              description={kpi?.conversionDescription}
              trend={kpi?.conversionTrend}
              trendDirection={kpi?.conversionTrendDirection}
            />
          </div>

          {/* Tasks Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Overdue Tasks */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-red-50 dark:bg-red-950/20">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Tasks ({overdueTasks.length})
                </h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">Tasks that are past their due date</p>
              </div>
              <div className="p-6">
                {overdueTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">No overdue tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex-1">
                          <p className="font-medium text-red-900 dark:text-red-100">{task.notes}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-red-700 dark:text-red-300">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.client?.name || 'Unknown Client'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => router.push('/follow-ups')}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {overdueTasks.length > 5 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/follow-ups')}
                        >
                          View all {overdueTasks.length} overdue tasks
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border bg-blue-50 dark:bg-blue-950/20">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                  Upcoming Tasks ({upcomingTasks.length})
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Tasks due in the next 7 days</p>
              </div>
              <div className="p-6">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <p className="font-medium">No upcoming tasks</p>
                    <p className="text-sm">You're all set for the week</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.slice(0, 5).map((task) => {
                      const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isToday = daysUntilDue === 0;
                      const isTomorrow = daysUntilDue === 1;
                      
                      return (
                        <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                          isToday 
                            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' 
                            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        }`}>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              isToday 
                                ? 'text-orange-900 dark:text-orange-100' 
                                : 'text-blue-900 dark:text-blue-100'
                            }`}>
                              {task.notes}
                            </p>
                            <div className={`flex items-center gap-4 mt-1 text-sm ${
                              isToday 
                                ? 'text-orange-700 dark:text-orange-300' 
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.client?.name || 'Unknown Client'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${daysUntilDue} days`}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push('/follow-ups')}
                            className={isToday ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                          >
                            View
                          </Button>
                        </div>
                      );
                    })}
                    {upcomingTasks.length > 5 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/follow-ups')}
                        >
                          View all {upcomingTasks.length} upcoming tasks
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart + Activity Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SampleChart data={chartData} />

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your CRM.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-4">
                  {activities.length === 0 ? (
                    <li className="text-muted-foreground">No recent activity.</li>
                  ) : activities.map((item, index) => (
                    <li key={index} className="flex items-start sm:items-center space-x-3">
                      <div className="p-2 bg-muted rounded-full">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-snug">{item.text}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => window.location.href = '/leads'}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Target className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium">Add Lead</p>
                  <p className="text-sm text-muted-foreground">Create new lead</p>
                </button>
                
                <button
                  onClick={() => window.location.href = '/clients'}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium">Add Client</p>
                  <p className="text-sm text-muted-foreground">Create new client</p>
                </button>
                
                <button
                  onClick={() => window.location.href = '/follow-ups'}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Calendar className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="font-medium">Add Follow-up</p>
                  <p className="text-sm text-muted-foreground">Schedule task</p>
                </button>
                
                <button
                  onClick={() => window.location.href = '/deals'}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Briefcase className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium">Add Deal</p>
                  <p className="text-sm text-muted-foreground">Create new deal</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </React.Fragment>
      )}
    </div>
  );
} 