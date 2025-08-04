
'use client';

import { useState, useMemo }from 'react';
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
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

type StatsDashboardProps = {
  benchmarks: Benchmark[];
  primaryMarkets: string[];
};

export function StatsDashboard({ benchmarks, primaryMarkets }: StatsDashboardProps) {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const handleMarketFilterChange = (market: string) => (checked: boolean) => {
    setSelectedMarkets(prev => 
      checked ? [...prev, market] : prev.filter(m => m !== market)
    );
  };

  const filteredBenchmarks = useMemo(() => {
    if (selectedMarkets.length === 0) {
      return benchmarks;
    }
    return benchmarks.filter(b => selectedMarkets.includes(b.primaryMarket));
  }, [benchmarks, selectedMarkets]);

  const topByScore = useMemo(() => {
    return [...filteredBenchmarks]
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [filteredBenchmarks]);

  const topByTraffic = useMemo(() => {
    return [...filteredBenchmarks]
      .sort((a, b) => (b.organicTraffic || 0) - (a.organicTraffic || 0));
  }, [filteredBenchmarks]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold tracking-tight">Rankings</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between md:w-auto">
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
                onCheckedChange={handleMarketFilterChange(market)}
              >
                {market}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Ranking by Score</CardTitle>
            </CardHeader>
            <CardContent>
                 <RankingTable 
                    benchmarks={topByScore}
                    valueKey="score"
                    valueLabel="Score"
                 />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Ranking by Traffic (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
                 <RankingTable 
                    benchmarks={topByTraffic}
                    valueKey="organicTraffic"
                    valueLabel="Traffic"
                />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
