
import { getBenchmarks } from '@/lib/actions';
import { DashboardClient } from '@/components/dashboard-client';
import { Suspense } from 'react';

// This is now a Server Component. It fetches data on the server and passes it to the client.
export default async function DashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  
  const benchmarks = await getBenchmarks();
  
  const marketCounts = (() => {
    const counts: Record<string, number> = {};
    benchmarks.forEach(b => {
        if (b.primaryMarket) {
            counts[b.primaryMarket] = (counts[b.primaryMarket] || 0) + 1;
        }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  return (
    // The Suspense boundary is good practice for Server Components, especially when dealing with search params.
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><p>Loading dashboard...</p></div>}>
      <DashboardClient 
        initialBenchmarks={benchmarks}
        initialMarketCounts={marketCounts}
      />
    </Suspense>
  );
}
