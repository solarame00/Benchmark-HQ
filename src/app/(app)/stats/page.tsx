
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Benchmark } from '@/lib/types';
import { getBenchmarks } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

  const marketDistribution = useMemo(() => {
    if (loading) return [];
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
      counts[b.primaryMarket] = (counts[b.primaryMarket] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
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
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(b => ({
        name: new URL(b.url).hostname.replace('www.',''),
        Score: b.score,
        'Organic Traffic (K)': b.organicTraffic,
      }));
  }, [benchmarks]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
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
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Score vs. Organic Traffic</CardTitle>
            <CardDescription>Comparing competitor scores and their monthly organic traffic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={scoreAndTrafficData} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#3F51B5" />
                <YAxis yAxisId="right" orientation="right" stroke="#009688" />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar yAxisId="left" dataKey="Score" fill="#3F51B5" />
                <Bar yAxisId="right" dataKey="Organic Traffic (K)" fill="#009688" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Market Distribution</CardTitle>
             <CardDescription>Breakdown of competitors by their main market.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={marketDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {marketDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                   <LabelList dataKey="name" position="outside" offset={15} stroke="black" fontSize={12} />
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
                    <Legend />
                    <Bar dataKey="count" fill="#FFBB28" name="Number of Sites" />
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
