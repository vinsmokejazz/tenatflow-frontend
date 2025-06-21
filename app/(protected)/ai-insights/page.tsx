'use client';

import React from 'react';
import { Sparkles, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AIInsightsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [insights, setInsights] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();

  // Fetch AI insights from backend
  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAIInsights();
      // The backend returns an object with different insight types, not an array
      const allInsights = [
        data.clientInsights,
        data.leadInsights,
        data.followUpInsights,
        data.performanceInsights,
        ...(data.recommendations || [])
      ].filter(Boolean); // Remove any undefined/null values
      setInsights(allInsights);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI insights');
      toast({ title: 'Error', description: err.message || 'Failed to fetch AI insights', variant: 'destructive' });
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchInsights(); }, []);

  // Filtered insights
  const filteredInsights = insights.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> AI Insights
        </h1>
        <Input
          placeholder="Search insights..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:w-64"
        />
      </div>
      {loading ? (
        <div className="p-6 text-muted-foreground">Loading AI insights...</div>
      ) : error ? (
        <div className="p-6 text-red-500">{error}</div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-6 text-muted-foreground">No AI insights found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInsights.map((insight: any) => (
            <Card key={insight.id} className="bg-card border border-border rounded-lg shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  {insight.title}
                </CardTitle>
                <CardDescription>{insight.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground mb-2">{insight.description}</div>
                {/* Render more details, charts, or tables as needed */}
                {insight.chartData && (
                  <div className="mt-4">
                    {/* You can use your SampleChart or another chart component here */}
                    {/* <SampleChart data={insight.chartData} /> */}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPage; 