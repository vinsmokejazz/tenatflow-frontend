"use client"

import { TrendingUp, DollarSign } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, LineChart, Area, AreaChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueData {
  month: string;
  revenue: number;
  deals: number;
  conversionRate: number;
}

interface RevenueChartProps {
  data?: RevenueData[];
  chartType?: 'bar' | 'line' | 'area';
  onChartTypeChange?: (type: 'bar' | 'line' | 'area') => void;
}

// Sample data for demonstration
const sampleData: RevenueData[] = [
  { month: "Jan", revenue: 12500, deals: 8, conversionRate: 65 },
  { month: "Feb", revenue: 18200, deals: 12, conversionRate: 72 },
  { month: "Mar", revenue: 15800, deals: 10, conversionRate: 68 },
  { month: "Apr", revenue: 22100, deals: 15, conversionRate: 75 },
  { month: "May", revenue: 19300, deals: 13, conversionRate: 70 },
  { month: "Jun", revenue: 25600, deals: 18, conversionRate: 78 },
  { month: "Jul", revenue: 28900, deals: 20, conversionRate: 82 },
  { month: "Aug", revenue: 31200, deals: 22, conversionRate: 85 },
  { month: "Sep", revenue: 27500, deals: 19, conversionRate: 80 },
  { month: "Oct", revenue: 29800, deals: 21, conversionRate: 83 },
  { month: "Nov", revenue: 32400, deals: 23, conversionRate: 87 },
  { month: "Dec", revenue: 35600, deals: 25, conversionRate: 90 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  deals: {
    label: "Deals",
    color: "hsl(var(--chart-2))",
  },
}

export function RevenueChart({ data, chartType = 'bar', onChartTypeChange }: RevenueChartProps) {
  // Only use real data, never fallback to sampleData
  const chartData = Array.isArray(data) ? data : [];

  // Check if all data points are zero or there is only one data point
  const allZero = chartData.length > 0 && chartData.every(d => d.revenue === 0 && d.deals === 0);
  const hasData = chartData.length > 0 && !allZero;
  const singlePoint = chartData.length === 1;
  
  // Calculate trends safely
  let revenueGrowth: string = 'N/A';
  let dealsGrowth: string = 'N/A';
  let currentMonth = chartData[chartData.length - 1];
  let previousMonth = chartData[chartData.length - 2];
  
  if (chartData.length > 1 && previousMonth && currentMonth) {
    if (previousMonth.revenue === 0) {
      revenueGrowth = currentMonth.revenue === 0 ? '0%' : 'N/A';
    } else {
      const growth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100);
      revenueGrowth = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    }
    if (previousMonth.deals === 0) {
      dealsGrowth = currentMonth.deals === 0 ? '0%' : 'N/A';
    } else {
      const growth = ((currentMonth.deals - previousMonth.deals) / previousMonth.deals * 100);
      dealsGrowth = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    }
  } else if (chartData.length === 1 && currentMonth) {
    revenueGrowth = '0%';
    dealsGrowth = '0%';
  }

  // Get status message
  const getStatusMessage = () => {
    if (chartData.length === 0) {
      return 'No revenue data available. Create deals to see your revenue performance.';
    }
    if (allZero) {
      return 'No revenue generated in the last 12 months. Close deals to see revenue data.';
    }
    if (singlePoint) {
      return 'Limited data available. More months of data will provide better insights.';
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue and deals performance</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Chart Type:</span>
            <select 
              className="px-2 py-1 border rounded text-xs"
              onChange={(e) => {
                const newType = e.target.value as 'bar' | 'line' | 'area';
                onChartTypeChange?.(newType);
              }}
              value={chartType}
              disabled={!hasData}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {statusMessage ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-center p-6">
            <div className="space-y-2">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="font-medium">{statusMessage}</p>
              {chartData.length === 0 && (
                <p className="text-sm">
                  Go to <strong>Deals</strong> section to create your first deal.
                </p>
              )}
              {allZero && (
                <p className="text-sm">
                  Change deal stages to <strong>closed_won</strong>, <strong>closed</strong>, <strong>won</strong>, or <strong>completed</strong> to see revenue.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <ChartContainer 
              // @ts-ignore
              config={chartConfig} 
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  switch (chartType) {
                    case 'line':
                      return (
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--chart-1))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="deals" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      );
                    case 'area':
                      return (
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--chart-1))" 
                            fill="hsl(var(--chart-1))" 
                            fillOpacity={0.3}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="deals" 
                            stroke="hsl(var(--chart-2))" 
                            fill="hsl(var(--chart-2))" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      );
                    default:
                      return (
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                          <Legend />
                          <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
                          <Bar dataKey="deals" fill="hsl(var(--chart-2))" radius={4} />
                        </BarChart>
                      );
                  }
                })()}
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Debug: Show data in a simple format to verify it's working */}
            <div className="mt-4 p-4 bg-gray-50 rounded text-xs">
              <p className="font-bold mb-2">Debug: Chart Data (showing non-zero values only):</p>
              {chartData.filter(d => d.revenue > 0 || d.deals > 0).map((item, index) => (
                <div key={index} className="mb-1">
                  {item.month}: Revenue=${item.revenue}, Deals={item.deals}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {hasData && currentMonth && (
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <div className="flex gap-2 font-medium leading-none">
                Revenue: ${currentMonth.revenue?.toLocaleString?.() ?? 0}
                {revenueGrowth !== 'N/A' && revenueGrowth !== '0%' && revenueGrowth.startsWith('+') && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                {revenueGrowth} from last month
              </div>
            </div>
            <div className="flex-1">
              <div className="flex gap-2 font-medium leading-none">
                Deals: {currentMonth.deals ?? 0}
                {dealsGrowth !== 'N/A' && dealsGrowth !== '0%' && dealsGrowth.startsWith('+') && (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                {dealsGrowth} from last month
              </div>
            </div>
          </div>
        )}
        {hasData && currentMonth && (
          <div className="leading-none text-muted-foreground">
            Conversion Rate: {currentMonth.conversionRate ?? 0}%
          </div>
        )}
        {!hasData && (
          <div className="leading-none text-muted-foreground">
            {statusMessage}
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 