
'use client';

import { useMemo, useState } from 'react';
import type { Benchmark } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722', '#607D8B', '#9C27B0'];
const PIE_PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722'];

export function StatsCharts({ benchmarks }: { benchmarks: Benchmark[] }) {
  const [chartViewMode, setChartViewMode] = useState('top10_traffic');

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

  const primaryMarkets = useMemo(() => Array.from(new Set(benchmarks.map(b => b.primaryMarket).filter(Boolean))).sort(), [benchmarks]);

  const marketDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
      if (b.primaryMarket) {
        counts[b.primaryMarket] = (counts[b.primaryMarket] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [benchmarks]);

  const featureAdoption = useMemo(() => {
     const features = {
        'Offers Trial': benchmarks.filter(b => b.offerTrial).length,
        'Has Blog': benchmarks.filter(b => b.hasBlog).length,
        'Has Resell Panel': benchmarks.filter(b => b.hasResellPanel).length,
        'Requires Account': benchmarks.filter(b => b.requiresAccount).length
     };
     return Object.entries(features).map(([name, count]) => ({ name, count }));
  }, [benchmarks]);
  
  const scoreAndTrafficData = useMemo(() => {
    let filteredBenchmarks = benchmarks;

    if (chartViewMode === 'top10_traffic') {
        filteredBenchmarks = [...benchmarks]
            .sort((a, b) => (b.organicTraffic || 0) - (a.organicTraffic || 0))
            .slice(0, 10);
    } else if (chartViewMode !== 'all') {
        filteredBenchmarks = benchmarks.filter(b => b.primaryMarket === chartViewMode);
    }
    
    return filteredBenchmarks
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(b => ({
        name: getHostname(b.url),
        Score: b.score,
        'Traffic': b.organicTraffic,
      }));
  }, [benchmarks, chartViewMode]);

  const paymentStrategyDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
        if(b.paymentStrategy) {
            counts[b.paymentStrategy] = (counts[b.paymentStrategy] || 0) + 1;
        }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [benchmarks]);

  const paymentMethodAdoption = useMemo(() => {
    const counts: { [key: string]: number } = {};
    benchmarks.forEach(b => {
        b.paymentMethods?.forEach(method => {
            counts[method] = (counts[method] || 0) + 1;
        });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [benchmarks]);


    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>Score vs. Organic Traffic</CardTitle>
                    <CardDescription>Comparing competitor scores and their monthly organic traffic.</CardDescription>
                </div>
                <Select onValueChange={setChartViewMode} defaultValue={chartViewMode}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter view..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="top10_traffic">Top 10 by Traffic</SelectItem>
                        <SelectItem value="all">All Markets</SelectItem>
                        {primaryMarkets.map(market => (
                            <SelectItem key={market} value={market}>{market}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop View Chart */}
            <div className="hidden md:block">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={scoreAndTrafficData} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" orientation="left" stroke={PALETTE[0]} />
                  <YAxis yAxisId="right" orientation="right" stroke={PALETTE[1]} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar yAxisId="left" dataKey="Score" fill={PALETTE[0]} />
                  <Bar yAxisId="right" dataKey="Traffic" fill={PALETTE[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Mobile View Chart */}
            <div className="block md:hidden">
               <ResponsiveContainer width="100%" height={scoreAndTrafficData.length * 50}>
                <BarChart data={scoreAndTrafficData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} interval={0}/>
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="Score" fill={PALETTE[0]} />
                </BarChart>
             </ResponsiveContainer>
            </div>
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

         <Card className="md:col-span-2 lg:col-span-3">
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
}
