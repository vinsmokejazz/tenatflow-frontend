import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export function KpiCard({ title, value, icon: Icon, description, trend, trendDirection = 'neutral' }: KpiCardProps) {
  const trendColor = trendDirection === 'up' ? 'text-green-500' : trendDirection === 'down' ? 'text-red-500' : 'text-muted-foreground';
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
        {trend && <p className={`text-xs ${trendColor} pt-1`}>{trend}</p>}
      </CardContent>
    </Card>
  );
}
