

'use client';

import { useState, useMemo } from 'react';
import type { Benchmark } from '@/lib/types';
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
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useBenchmarkContext } from '@/app/(app)/layout';

type StatsDashboardProps = {
  benchmarks: Benchmark[];
  primaryMarkets: string[];
};

export function StatsDashboard({ benchmarks, primaryMarkets }: StatsDashboardProps) {
  const { setViewingBenchmark } = useBenchmarkContext();
  const [selectedMarketsForScore, setSelectedMarketsForScore] = useState<string[]>([]);
  const [selectedMarketsForTraffic, setSelectedMarketsForTraffic] = useState<string[]>([]);

  const [isScoreTableExpanded, setIsScoreTableExpanded] = useState(false);
  const [isTrafficTableExpanded, setIsTrafficTableExpanded] = useState(false);

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
    <div className="space-y-6">
       <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">Rankings</h2>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                    <CardTitle>Ranking by Traffic (Monthly)</CardTitle>
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
      </div>
    </div>
  );
}
