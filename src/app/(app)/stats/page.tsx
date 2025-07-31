
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Benchmark } from '@/lib/types';
import { getBenchmarks } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722', '#607D8B', '#9C27B0'];
const PIE_PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722'];

export default function StatsPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getBenchmarks();
      setBenchmarks(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const getHostname = (url: string) => {
    if (!url || !url.startsWith('http')) {
        return url || 'No URL';
    }
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch (error) {
        console.error('Invalid URL:', url, error);
        return url;
    }
  };

  const marketDistribution = useMemo(() => {
    if (loading) return [];
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
      counts[b.primaryMarket] = (counts[b.primaryMarket] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [benchmarks, loading]);

  const featureAdoption = useMemo(() => {
     if (loading) return [];
     const features = {
        'Offers Trial': benchmarks.filter(b => b.offerTrial).length,
        'Has Blog': benchmarks.filter(b => b.hasBlog).length,
        'Has Resell Panel': benchmarks.filter(b => b.hasResellPanel).length,
        'Requires Account': benchmarks.filter(b => b.requiresAccount).length
     };
     return Object.entries(features).map(([name, value]) => ({ name, count: value }));
  }, [benchmarks, loading]);
  
  const scoreAndTrafficData = useMemo(() => {
    return benchmarks
      .filter(b => (b.score || 0) > 0 || (b.organicTraffic || 0) > 0)
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(b => ({
        name: getHostname(b.url),
        Score: b.score,
        'Traffic (K)': b.organicTraffic,
      }));
  }, [benchmarks]);

  const paymentStrategyDistribution = useMemo(() => {
    if (loading) return [];
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
        if(b.paymentStrategy) {
            counts[b.paymentStrategy] = (counts[b.paymentStrategy] || 0) + 1;
        }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [benchmarks, loading]);

  const paymentMethodAdoption = useMemo(() => {
    if (loading) return [];
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
        b.paymentMethods?.forEach(method => {
            counts[method] = (counts[method] || 0) + 1;
        })
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [benchmarks, loading]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
           {Array.from({ length: 6 }).map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
           ))}
        </div>
      );
    }
    
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

    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Score vs. Organic Traffic</CardTitle>
            <CardDescription>Comparing competitor scores and their monthly organic traffic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={scoreAndTrafficData} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke={PALETTE[0]} />
                <YAxis yAxisId="right" orientation="right" stroke={PALETTE[1]} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar yAxisId="left" dataKey="Score" fill={PALETTE[0]} />
                <Bar yAxisId="right" dataKey="Traffic (K)" fill={PALETTE[1]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Market</CardTitle>
             <CardDescription>Breakdown of competitors by main market.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={marketDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill={PALETTE[0]} label>
                  {marketDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                 <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Payment Strategy</CardTitle>
             <CardDescription>Distribution of payment strategies used.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentStrategyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill={PALETTE[0]} label>
                  {paymentStrategyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                 <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption</CardTitle>
            <CardDescription>How many competitors offer key features.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureAdoption} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80}/>
                    <Tooltip />
                    <Bar dataKey="count" fill={PALETTE[2]} name="# of Sites" />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

         <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Payment Method Adoption</CardTitle>
            <CardDescription>Popularity of different payment methods offered.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodAdoption} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="count" fill={PALETTE[3]} name="# of Sites" />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>
        {renderContent()}
    </div>
  );
}
