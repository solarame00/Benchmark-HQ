
'use client';

import { useMemo, useState } from 'react';
import type { Benchmark } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RankingTable } from './ranking-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useBenchmarkContext } from '@/app/(app)/layout';

const PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722', '#607D8B', '#9C27B0'];
const PIE_PALETTE = ['#3F51B5', '#009688', '#FFC107', '#FF5722'];

type StatsChartsProps = {
  benchmarks: Benchmark[];
  primaryMarkets: string[];
};

export function StatsCharts({ benchmarks, primaryMarkets }: StatsChartsProps) {
  const { setViewingBenchmark } = useBenchmarkContext();
  const [chartViewMode, setChartViewMode] = useState('top10_traffic');
  
  const [selectedMarketsForScore, setSelectedMarketsForScore] = useState<string[]>([]);
  const [selectedMarketsForTraffic, setSelectedMarketsForTraffic] = useState<string[]>([]);

  const [isScoreTableExpanded, setIsScoreTableExpanded] = useState(false);
  const [isTrafficTableExpanded, setIsTrafficTableExpanded] = useState(false);

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
  
  const handleMarketFilterChangeForScore = (market: string) => (checked: boolean) => {
    setSelectedMarketsForScore(prev =>
      checked ? [...prev, market] : prev.filter(m => m !== market)
    );
  };
  
  const handleMarketFilterChangeForTraffic = (market: string) => (checked: boolean) => {
    setSelectedMarketsForTraffic(prev =>
      checked ? [...prev, market] : prev.filter(m => m !== market)
    );
  };
  
  const filteredBenchmarksForScore = useMemo(() => {
    if (selectedMarketsForScore.length === 0) {
      return benchmarks;
    }
    return benchmarks.filter(b => selectedMarketsForScore.includes(b.primaryMarket));
  }, [benchmarks, selectedMarketsForScore]);
  
  const filteredBenchmarksForTraffic = useMemo(() => {
    if (selectedMarketsForTraffic.length === 0) {
      return benchmarks;
    }
    return benchmarks.filter(b => selectedMarketsForTraffic.includes(b.primaryMarket));
  }, [benchmarks, selectedMarketsForTraffic]);


  const topByScore = useMemo(() => {
    return [...filteredBenchmarksForScore]
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [filteredBenchmarksForScore]);

  const topByTraffic = useMemo(() => {
    return [...filteredBenchmarksForTraffic]
      .sort((a, b) => (b.organicTraffic || 0) - (a.organicTraffic || 0));
  }, [filteredBenchmarksForTraffic]);
  
  const displayedTopByScore = useMemo(() => {
    return isScoreTableExpanded ? topByScore : topByScore.slice(0, 5);
  }, [topByScore, isScoreTableExpanded]);

  const displayedTopByTraffic = useMemo(() => {
    return isTrafficTableExpanded ? topByTraffic : topByTraffic.slice(0, 5);
  }, [topByTraffic, isTrafficTableExpanded]);


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

  const renderFilterDropdown = (
    selectedMarkets: string[], 
    handler: (market: string) => (checked: boolean) => void
  ) => (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-xs md:w-auto md:text-sm">
            {selectedMarkets.length === 0
                ? 'Filter by Market...'
                : `${selectedMarkets.length} market(s) selected`}
            <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" onSelect={(e) => e.preventDefault()}>
            <DropdownMenuLabel>Filter by Primary Market</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {primaryMarkets.map(market => (
            <DropdownMenuCheckboxItem
                key={market}
                checked={selectedMarkets.includes(market)}
                onCheckedChange={handler(market)}
            >
                {market}
            </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
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

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Ranking by Score</CardTitle>
                        {renderFilterDropdown(selectedMarketsForScore, handleMarketFilterChangeForScore)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <RankingTable 
                        benchmarks={displayedTopByScore}
                        valueKey="score"
                        valueLabel="Score"
                        onRowClick={setViewingBenchmark}
                     />
                     {topByScore.length > 5 && (
                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={() => setIsScoreTableExpanded(!isScoreTableExpanded)}
                            >
                                <ChevronsUpDown className="mr-2 h-4 w-4" />
                                {isScoreTableExpanded ? 'Show Less' : `Show ${topByScore.length - 5} More`}
                            </Button>
                        </div>
                     )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Ranking by Traffic</CardTitle>
                        {renderFilterDropdown(selectedMarketsForTraffic, handleMarketFilterChangeForTraffic)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <RankingTable 
                        benchmarks={displayedTopByTraffic}
                        valueKey="organicTraffic"
                        valueLabel="Traffic"
                        onRowClick={setViewingBenchmark}
                    />
                     {topByTraffic.length > 5 && (
                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={() => setIsTrafficTableExpanded(!isTrafficTableExpanded)}
                            >
                                 <ChevronsUpDown className="mr-2 h-4 w-4" />
                                {isTrafficTableExpanded ? 'Show Less' : `Show ${topByTraffic.length - 5} More`}
                            </Button>
                        </div>
                     )}
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
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
        </div>
      </div>
    );
}
