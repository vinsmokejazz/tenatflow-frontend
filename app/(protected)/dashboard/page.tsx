'use client';
import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SampleChart } from '@/components/dashboard/SampleChart';
import { DollarSign, Users, Briefcase, TrendingUp, Activity } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Get user data from backend to get the correct business ID
        const userData = await apiClient.getUser();
        const businessId = userData.businessId;
        
        if (!businessId) {
          setError('No business ID found for user');
          setLoading(false);
          return;
        }

        console.log('Fetching dashboard data for businessId:', businessId);
        console.log('DASHBOARD: businessId from backend user:', businessId);
        
        const stats = await apiClient.getDashboardStats(businessId);
        console.log('Dashboard stats:', stats);
        setKpi(stats.kpi || {});
        setChartData(stats.chartData || []);
        
        const analytics = await apiClient.getAnalytics();
        console.log('Analytics data:', analytics);
        setActivities(analytics.activities || []);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      }
      setLoading(false);
    }
    fetchDashboard();
  }, [user]);

  return (
    <div className="space-y-8 px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
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
                      {/* Use icon mapping if available, fallback to Activity */}
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
        </>
      )}
    </div>
  );
}
