
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Benchmark, BenchmarkInput } from '@/lib/types';
import { BenchmarkTable } from '@/components/benchmark-table';
import { BenchmarkForm } from '@/components/benchmark-form';
import { BenchmarkCard } from '@/components/benchmark-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Table, X, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { COUNTRIES } from '@/lib/constants';

type Checked = DropdownMenuCheckboxItemProps["checked"]

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBenchmark, setActiveBenchmark] = useState<Benchmark | null>(null);

  const [filters, setFilters] = useState({
    primaryMarket: 'all',
  });
  const [booleanFilters, setBooleanFilters] = useState<{ [key: string]: Checked }>({
    offerTrial: false,
    hasBlog: false,
    hasResellPanel: false,
    requiresAccount: false,
  });

  const [sortBy, setSortBy] = useState< 'score-desc' | 'score-asc' | 'lastUpdated-desc' | 'traffic-desc' | 'traffic-asc'>('score-desc');
  
  const [showForm, setShowForm] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<Benchmark | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    try {
      const storedBenchmarks = localStorage.getItem('benchmarks');
      if (storedBenchmarks) {
        setBenchmarks(JSON.parse(storedBenchmarks));
      }
    } catch (error) {
      console.error("Failed to load benchmarks from local storage", error);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    const shouldShowForm = searchParams.get('showForm') === 'true';
    setShowForm(shouldShowForm);
  }, [searchParams]);

  useEffect(() => {
    if(!loading) {
        localStorage.setItem('benchmarks', JSON.stringify(benchmarks));
    }
  }, [benchmarks, loading]);

  const handleAddNew = () => {
    setEditingBenchmark(null);
    setActiveBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.set('showForm', 'true');
    router.push(current.toString(), { scroll: false });
  }

  const handleEdit = (benchmark: Benchmark) => {
    setEditingBenchmark(benchmark);
    setActiveBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.set('showForm', 'true');
    router.push(current.toString(), { scroll: false });
  }

  const handleDelete = (id: string) => {
    setBenchmarks(prev => prev.filter(b => b.id !== id));
    if (activeBenchmark?.id === id) {
        setActiveBenchmark(null);
    }
    toast({ title: 'Success', description: 'Benchmark deleted successfully.' });
  }
  
  const handleCancelForm = () => {
    setEditingBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.delete('showForm');
    router.push(current.toString(), { scroll: false });
  }


  const handleSave = (data: BenchmarkInput, id?: string) => {
    if (id) {
      setBenchmarks(prev => prev.map(b => b.id === id ? { ...b, ...data, lastUpdated: new Date().toISOString() } : b));
      toast({ title: 'Success', description: 'Benchmark updated successfully.' });
    } else {
      const newBenchmark: Benchmark = {
        id: new Date().toISOString(),
        ...data,
        lastUpdated: new Date().toISOString()
      };
      setBenchmarks(prev => [newBenchmark, ...prev]);
      toast({ title: 'Success', description: 'Benchmark added successfully.' });
    }
    handleCancelForm();
  };
  
  const handleBooleanFilterChange = (key: string) => (checked: Checked) => {
    setBooleanFilters(prev => ({ ...prev, [key]: checked === 'indeterminate' ? false : checked }));
  };


  const filteredAndSortedBenchmarks = useMemo(() => {
    let filtered = benchmarks.filter((b) => {
      const searchMatch =
        (b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const marketMatch = filters.primaryMarket === 'all' || b.primaryMarket === filters.primaryMarket;
      
      const offerTrialMatch = !booleanFilters.offerTrial || b.offerTrial;
      const hasBlogMatch = !booleanFilters.hasBlog || b.hasBlog;
      const hasResellPanelMatch = !booleanFilters.hasResellPanel || b.hasResellPanel;
      const requiresAccountMatch = !booleanFilters.requiresAccount || b.requiresAccount;

      return searchMatch && marketMatch && offerTrialMatch && hasBlogMatch && hasResellPanelMatch && requiresAccountMatch;
    });

    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'score-desc':
                return (b.score || 0) - (a.score || 0);
            case 'score-asc':
                return (a.score || 0) - (b.score || 0);
            case 'traffic-desc':
                return (b.organicTraffic || 0) - (a.organicTraffic || 0);
            case 'traffic-asc':
                return (a.organicTraffic || 0) - (b.organicTraffic || 0);
            case 'lastUpdated-desc':
                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            default:
                return 0;
        }
    });

    return filtered;
  }, [benchmarks, searchTerm, sortBy, filters, booleanFilters]);

  const handleCardClick = (benchmark: Benchmark) => {
    if (activeBenchmark?.id === benchmark.id) {
        setActiveBenchmark(null);
    } else {
        setActiveBenchmark(benchmark);
    }
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
  }

  if (showForm) {
      return (
        <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
            <Card>
                <CardHeader>
                <CardTitle>{editingBenchmark ? 'Edit Benchmark' : 'Add New Benchmark'}</CardTitle>
                <CardDescription>
                    Fill in the details of the competitor website. All fields are optional, except Primary Market.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <BenchmarkForm
                        key={editingBenchmark ? editingBenchmark.id : 'new'}
                        benchmark={editingBenchmark}
                        onSave={handleSave}
                        onCancel={handleCancelForm}
                    />
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">All Benchmarks</h1>
        <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)}>
                 <ToggleGroupItem value="cards" aria-label="Card view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                 </ToggleGroupItem>
                 <ToggleGroupItem value="table" aria-label="Table view">
                    <Table className="h-4 w-4" />
                 </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
            </Button>
        </div>
      </div>

       <Card>
            <CardContent className="p-4 space-y-4">
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative flex-grow lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search by URL, notes, or keywords..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select onValueChange={(value) => setFilters(f => ({...f, primaryMarket: value}))} defaultValue={filters.primaryMarket}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by primary market" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                            <SelectItem value="all">All Primary Markets</SelectItem>
                            {COUNTRIES.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleSortChange} defaultValue={sortBy}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="score-desc">Score: High to Low</SelectItem>
                            <SelectItem value="score-asc">Score: Low to High</SelectItem>
                            <SelectItem value="traffic-desc">Traffic: High to Low</SelectItem>
                            <SelectItem value="traffic-asc">Traffic: Low to High</SelectItem>
                            <SelectItem value="lastUpdated-desc">Last Updated</SelectItem>
                        </SelectContent>
                    </Select>

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Feature Filters <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" onSelect={(e) => e.preventDefault()}>
                            <DropdownMenuLabel>Filter by Features</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={booleanFilters.offerTrial} onCheckedChange={handleBooleanFilterChange('offerTrial')}>
                                Offers Trial
                            </DropdownMenuCheckboxItem>
                             <DropdownMenuCheckboxItem checked={booleanFilters.hasBlog} onCheckedChange={handleBooleanFilterChange('hasBlog')}>
                                Has Blog
                            </DropdownMenuCheckboxItem>
                             <DropdownMenuCheckboxItem checked={booleanFilters.hasResellPanel} onCheckedChange={handleBooleanFilterChange('hasResellPanel')}>
                                Has Resell Panel
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={booleanFilters.requiresAccount} onCheckedChange={handleBooleanFilterChange('requiresAccount')}>
                                Requires Account
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
       </Card>

      {viewMode === 'cards' && (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)
            ) : filteredAndSortedBenchmarks.length > 0 ? (
                filteredAndSortedBenchmarks.map((b) => (
                <BenchmarkCard
                    key={b.id}
                    benchmark={b}
                    isActive={activeBenchmark?.id === b.id}
                    onClick={() => handleCardClick(b)}
                    onEdit={() => handleEdit(b)}
                    onDelete={() => handleDelete(b.id)}
                />
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <p>No benchmarks found. Try adjusting your filters or adding a new one.</p>
                </div>
            )}
            </div>
            
            {activeBenchmark && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <CardTitle>Full Details</CardTitle>
                                <CardDescription>{activeBenchmark.url}</CardDescription>
                             </div>
                            <Button variant="ghost" size="icon" onClick={() => setActiveBenchmark(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <BenchmarkTable
                            benchmarks={[activeBenchmark]}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isDetailsView={true}
                        />
                    </CardContent>
                </Card>
            )}
        </>
      )}

      {viewMode === 'table' && (
         <BenchmarkTable
            benchmarks={filteredAndSortedBenchmarks}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
