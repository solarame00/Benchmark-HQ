import { getBenchmarks } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCharts } from '@/components/stats-charts';

export default async function StatsPage() {
  const benchmarks = await getBenchmarks();

  const renderContent = () => {
    if (benchmarks.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>No Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There is no benchmark data to analyze. Add some benchmarks to see statistics here.</p>
                </CardContent>
            </Card>
        )
    }
    return <StatsCharts benchmarks={benchmarks} />;
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>
        {renderContent()}
    </div>
  );
}
