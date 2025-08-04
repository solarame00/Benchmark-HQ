
import { getBenchmarks } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCharts } from '@/components/stats-charts';
import { StatsDashboard } from '@/components/stats-dashboard';

export default async function StatsPage() {
  const benchmarks = await getBenchmarks();

  const primaryMarkets = Array.from(new Set(benchmarks.map(b => b.primaryMarket).filter(Boolean as (value: string | undefined) => value is string))).sort();

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>
        {benchmarks.length === 0 ? (
             <Card>
                <CardHeader>
                    <CardTitle>No Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There is no benchmark data to analyze. Add some benchmarks to see statistics here.</p>
                </CardContent>
            </Card>
        ) : (
            <>
                <StatsCharts benchmarks={benchmarks} primaryMarkets={primaryMarkets} />
                <StatsDashboard benchmarks={benchmarks} primaryMarkets={primaryMarkets} />
            </>
        )}
    </div>
  );
}
