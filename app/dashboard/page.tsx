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

export default function DashboardPage() {
  const recentActivities = [
    { icon: Users, text: "New contact 'John Doe' added.", time: "2m ago" },
    { icon: Briefcase, text: "Deal 'Alpha Project' moved to 'Negotiation'.", time: "1h ago" },
    { icon: DollarSign, text: "Payment of $1,200 received from 'Beta Corp'.", time: "3h ago" },
    { icon: Activity, text: "AI Insight: 'Q3 revenue projected to grow 15%'.", time: "5h ago" },
    { icon: Users, text: "Task 'Follow up with Jane Smith' completed.", time: "1d ago" },
  ];

  return (
    <div className="space-y-8 px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          description="+20.1% from last month"
          trend="+ $2,300 this week"
          trendDirection="up"
        />
        <KpiCard
          title="Active Clients"
          value="235"
          icon={Users}
          description="+180.1% from last month"
          trend="+ 12 new clients"
          trendDirection="up"
        />
        <KpiCard
          title="Open Deals"
          value="72"
          icon={Briefcase}
          description="Value: $120,500"
          trend="-3 from last week"
          trendDirection="down"
        />
        <KpiCard
          title="Conversion Rate"
          value="12.5%"
          icon={TrendingUp}
          description="+2.5% from last month"
          trend="Improved lead quality"
          trendDirection="neutral"
        />
      </div>

      {/* Chart + Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SampleChart />

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your CRM.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-4">
              {recentActivities.map((item, index) => (
                <li key={index} className="flex items-start sm:items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}
