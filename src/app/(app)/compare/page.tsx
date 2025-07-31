
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Benchmark } from '@/lib/types';
import { getBenchmarks } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BenchmarkTable } from '@/components/benchmark-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CompareContent() {
    const searchParams = useSearchParams();
    const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBenchmarks = async () => {
            setLoading(true);
            setError(null);
            const idsParam = searchParams.get('ids');
            if (!idsParam) {
                setError("No benchmarks selected for comparison.");
                setLoading(false);
                return;
            }
            
            const ids = idsParam.split(',');

            try {
                const allBenchmarks = await getBenchmarks();
                const selected = allBenchmarks.filter(b => ids.includes(b.id));
                setBenchmarks(selected);
            } catch (e) {
                console.error("Failed to fetch benchmarks for comparison", e);
                setError("Could not load benchmark data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBenchmarks();
    }, [searchParams]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Comparison...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Fetching data for the selected benchmarks.</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (benchmarks.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>No Benchmarks Found</CardTitle>
                    <CardDescription>Could not find data for the selected benchmarks. They may have been deleted.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <Button asChild>
                        <Link href="/">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-6">
                 <BenchmarkTable benchmarks={benchmarks} isComparisonView={true} />
            </CardContent>
        </Card>
    );
}


export default function ComparePage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Compare Benchmarks</h1>
             <Button asChild variant="outline">
                <Link href="/">Back to Dashboard</Link>
            </Button>
        </div>
        <Suspense fallback={<p>Loading...</p>}>
            <CompareContent />
        </Suspense>
    </div>
  );
}
