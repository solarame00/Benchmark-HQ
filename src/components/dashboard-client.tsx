
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Benchmark, BenchmarkInput } from '@/lib/types';
import { BenchmarkTable } from '@/components/benchmark-table';
import { BenchmarkForm } from '@/components/benchmark-form';
import { BenchmarkCard } from '@/components/benchmark-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Table, X, ChevronDown, ArrowRight, ArrowLeft, Globe, Eye, Copy, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { PAYMENT_STRATEGIES, PAYMENT_METHODS, CONNECTION_OPTIONS } from '@/lib/constants';
import { MissingApiKeyAlert } from '@/components/missing-api-key-alert';
import { addBenchmarkWithId, updateBenchmark, deleteBenchmark } from '@/lib/actions';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


type Checked = DropdownMenuCheckboxItemProps["checked"];

type DashboardClientProps = {
    initialBenchmarks: Benchmark[];
    initialMarketCounts: { name: string; count: number }[];
}

export function DashboardClient({ initialBenchmarks, initialMarketCounts }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>(initialBenchmarks);
  const [marketCounts, setMarketCounts] = useState(initialMarketCounts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingBenchmark, setViewingBenchmark] = useState<Benchmark | null>(null);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  
  const [selectedMarket, setSelectedMarket] = useState<string | null>(searchParams.get('market'));
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');


  const [filters, setFilters] = useState({
    primaryMarket: 'all',
    paymentStrategy: 'all',
    connections: 'all',
  });
  const [paymentMethodsFilter, setPaymentMethodsFilter] = useState<string[]>([]);
  const [booleanFilters, setBooleanFilters] = useState<{ [key: string]: Checked }>({
    offerTrial: false,
    hasBlog: false,
    hasResellPanel: false,
    requiresAccount: false,
  });

  const [sortBy, setSortBy] = useState< 'score-desc' | 'score-asc' | 'lastUpdated-desc' | 'traffic-desc' | 'traffic-asc'>('score-desc');
  
  const [editingBenchmark, setEditingBenchmark] = useState<Benchmark | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const showFormParam = searchParams.get('showForm') === 'true';

  useEffect(() => {
    const market = searchParams.get('market');
    if (market) {
      setSelectedMarket(market);
    } else {
      setSelectedMarket(null);
    }
    
    if (searchParams.get('showForm') !== 'true') {
        setEditingBenchmark(null);
    }
  }, [searchParams]);

  
  const updateURL = (params: Record<string, string | null>) => {
    const current = new URL(window.location.href);
    for(const key in params) {
        const value = params[key];
        if (value) {
            current.searchParams.set(key, value);
        } else {
            current.searchParams.delete(key);
        }
    }
    router.push(current.toString(), { scroll: false });
  };
  
  const handleMarketSelect = (market: string | null) => {
    updateURL({ market });
  };

  const handleAddNew = () => {
    setEditingBenchmark(null);
    setViewingBenchmark(null);
    updateURL({ showForm: 'true' });
  }

  const handleEdit = (benchmark: Benchmark) => {
    setEditingBenchmark(benchmark);
    setViewingBenchmark(null);
    updateURL({ showForm: 'true' });
  }

  const handleClone = (benchmark: Benchmark) => {
    const { id, ...clonedData } = benchmark;
    setEditingBenchmark({ ...clonedData, id: '' } as Benchmark);
    setViewingBenchmark(null);
    updateURL({ showForm: 'true' });
  };


  const handleDelete = async (id: string) => {
    try {
      await deleteBenchmark(id);
      toast({ title: 'Success', description: 'Benchmark deleted successfully.' });
      setBenchmarks(prev => prev.filter(b => b.id !== id));
      if (viewingBenchmark?.id === id) {
        setViewingBenchmark(null);
      }
      setSelectedBenchmarks(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
       console.error("Failed to delete benchmark:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Could not delete the benchmark.",
       });
    }
  }
  
  const handleCancelForm = () => {
    updateURL({ showForm: null });
  }

  const handleSave = async (data: BenchmarkInput, id: string) => {
    try {
      const isUpdating = benchmarks.some(b => b.id === id);
      if (isUpdating) {
        await updateBenchmark(id, data);
        setBenchmarks(prev => prev.map(b => b.id === id ? { ...b, ...data, id, lastUpdated: new Date().toISOString() } : b));
        toast({ title: 'Success', description: 'Benchmark updated successfully.' });
      } else {
        await addBenchmarkWithId(id, data);
        setBenchmarks(prev => [...prev, { ...data, id, lastUpdated: new Date().toISOString() }]);
        toast({ title: 'Success', description: 'Benchmark added successfully.' });
      }
      handleCancelForm();
    } catch (error) {
       console.error("Failed to save benchmark:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Could not save the benchmark to the database.",
       });
    }
  };
  
  const handleBooleanFilterChange = (key: string) => (checked: Checked) => {
    setBooleanFilters(prev => ({ ...prev, [key]: checked === 'indeterminate' ? false : checked }));
  };

  const handlePaymentMethodFilterChange = (method: string) => (checked: boolean) => {
    setPaymentMethodsFilter(prev => 
      checked ? [...prev, method] : prev.filter(m => m !== method)
    );
  };
  
  const handleSelectBenchmark = (id: string, checked: boolean) => {
    setSelectedBenchmarks(prev => 
        checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };


  const filteredAndSortedBenchmarks = useMemo(() => {
    let sourceData = benchmarks;
    let currentSearchTerm = searchTerm;
    let isGlobalSearch = false;

    if (globalSearchTerm) {
      currentSearchTerm = globalSearchTerm;
      isGlobalSearch = true;
    } else if (selectedMarket) {
      sourceData = benchmarks.filter(b => b.primaryMarket === selectedMarket);
    } else {
        // When no market is selected, and no global search, return the source data for the market selection view
        return sourceData;
    }
    
    let filtered = sourceData.filter((b) => {
      const searchMatch =
        currentSearchTerm === '' ||
        (b.url.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        b.notes?.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        b.tags?.some(t => t.toLowerCase().includes(currentSearchTerm.toLowerCase())));

      if (isGlobalSearch) {
        return searchMatch;
      }
      
      const marketMatch = filters.primaryMarket === 'all' || b.primaryMarket === filters.primaryMarket;
      const offerTrialMatch = !booleanFilters.offerTrial || b.offerTrial;
      const hasBlogMatch = !booleanFilters.hasBlog || b.hasBlog;
      const hasResellPanelMatch = !booleanFilters.hasResellPanel || b.hasResellPanel;
      const requiresAccountMatch = !booleanFilters.requiresAccount || b.requiresAccount;
      const paymentStrategyMatch = filters.paymentStrategy === 'all' || b.paymentStrategy === filters.paymentStrategy;
      const connectionsMatch = filters.connections === 'all' || b.connections === filters.connections;
      const paymentMethodsMatch = paymentMethodsFilter.length === 0 || paymentMethodsFilter.every(method => b.paymentMethods?.includes(method));

      return searchMatch && marketMatch && offerTrialMatch && hasBlogMatch && hasResellPanelMatch && requiresAccountMatch && paymentStrategyMatch && connectionsMatch && paymentMethodsMatch;
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
                const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
                const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
                return dateB - dateA;
            default:
                return 0;
        }
    });

    return filtered;
  }, [benchmarks, searchTerm, globalSearchTerm, sortBy, filters, booleanFilters, paymentMethodsFilter, selectedMarket]);

  const handleViewDetails = (benchmark: Benchmark) => {
    if (showFormParam) return;
    setViewingBenchmark(benchmark);
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
  }
  
  if (showFormParam) {
      return (
        <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
            <Card>
                <CardHeader>
                <CardTitle>{editingBenchmark?.id ? 'Edit Benchmark' : 'Add New Benchmark'}</CardTitle>
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
  
  if (!selectedMarket) {
     return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                 <div className="flex-grow max-w-lg">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search all benchmarks by URL, notes, or keywords..."
                            className="w-full pl-9"
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                 <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : null}

            {!loading && !globalSearchTerm && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {marketCounts.map(market => (
                        <Card key={market.name} onClick={() => handleMarketSelect(market.name)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:ring-2 hover:ring-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <Globe className="h-6 w-6 text-primary" />
                                    <span>{market.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{market.count}</p>
                                <p className="text-sm text-muted-foreground">Benchmarks</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {globalSearchTerm && (
                <div className="flex flex-col gap-4">
                     <h2 className="text-2xl font-bold tracking-tight">Global Search Results</h2>
                    {filteredAndSortedBenchmarks.length > 0 ? (
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredAndSortedBenchmarks.map((b) => (
                                <BenchmarkCard
                                    key={b.id}
                                    benchmark={b}
                                    isSelected={selectedBenchmarks.includes(b.id)}
                                    onSelect={(checked) => handleSelectBenchmark(b.id, checked)}
                                    onViewDetails={() => handleViewDetails(b)}
                                    onEdit={() => handleEdit(b)}
                                    onClone={() => handleClone(b)}
                                    onDelete={() => handleDelete(b.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <Card className="col-span-full text-center py-12">
                            <CardHeader>
                                <CardTitle>No Benchmarks Found</CardTitle>
                                <CardDescription>Your search did not match any benchmarks across all markets.</CardDescription>
                            </CardHeader>
                         </Card>
                    )}
                </div>
            )}
        </div>
     );
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => handleMarketSelect(null)}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                {selectedMarket} Benchmarks
            </h1>
        </div>
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
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative flex-grow lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search by URL, notes, or keywords..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
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
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
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
                    <Select onValueChange={(value) => setFilters(f => ({...f, paymentStrategy: value}))} defaultValue={filters.paymentStrategy}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by payment strategy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Payment Strategies</SelectItem>
                            {PAYMENT_STRATEGIES.map(strategy => (
                              <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Payment Methods <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" onSelect={(e) => e.preventDefault()}>
                            <DropdownMenuLabel>Filter by Payment Methods</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {PAYMENT_METHODS.map(method => (
                                <DropdownMenuCheckboxItem key={method} checked={paymentMethodsFilter.includes(method)} onCheckedChange={handlePaymentMethodFilterChange(method)}>
                                    {method}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Select onValueChange={(value) => setFilters(f => ({...f, connections: value}))} defaultValue={filters.connections}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by connections" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Connections</SelectItem>
                            {CONNECTION_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
       </Card>
      
      <MissingApiKeyAlert />

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>)}
        </div>
      )}

      {!loading && filteredAndSortedBenchmarks.length === 0 && (
         <Card className="col-span-full text-center py-12">
            <CardHeader>
                <CardTitle>No Benchmarks Found</CardTitle>
                <CardDescription>Your search or filter criteria did not match any benchmarks for this market. Try adjusting your filters.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => {
                    setSearchTerm('');
                    setFilters({ primaryMarket: 'all', paymentStrategy: 'all', connections: 'all' });
                    setBooleanFilters({ offerTrial: false, hasBlog: false, hasResellPanel: false, requiresAccount: false });
                    setPaymentMethodsFilter([]);
                }}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                </Button>
            </CardContent>
         </Card>
      )}

      {!loading && filteredAndSortedBenchmarks.length > 0 && viewMode === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedBenchmarks.map((b) => (
                <BenchmarkCard
                    key={b.id}
                    benchmark={b}
                    isSelected={selectedBenchmarks.includes(b.id)}
                    onSelect={(checked) => handleSelectBenchmark(b.id, checked)}
                    onViewDetails={() => handleViewDetails(b)}
                    onEdit={() => handleEdit(b)}
                    onClone={() => handleClone(b)}
                    onDelete={() => handleDelete(b.id)}
                />
            ))}
        </div>
      )}

      {viewingBenchmark && (
        <Sheet open={!!viewingBenchmark} onOpenChange={(isOpen) => !isOpen && setViewingBenchmark(null)}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                    <SheetTitle>Benchmark Details</SheetTitle>
                     <a href={viewingBenchmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{viewingBenchmark.url}</a>
                </SheetHeader>
                <BenchmarkTable
                    benchmarks={[viewingBenchmark]}
                    onEdit={(b) => { setViewingBenchmark(null); handleEdit(b); }}
                    onClone={(b) => { setViewingBenchmark(null); handleClone(b); }}
                    onDelete={(id) => { setViewingBenchmark(null); handleDelete(id); }}
                    isDetailsView={true}
                />
            </SheetContent>
        </Sheet>
      )}

      {!loading && filteredAndSortedBenchmarks.length > 0 && viewMode === 'table' && (
         <BenchmarkTable
            benchmarks={filteredAndSortedBenchmarks}
            loading={loading}
            onEdit={handleEdit}
            onClone={handleClone}
            onDelete={handleDelete}
            selectedBenchmarks={selectedBenchmarks}
            onSelectBenchmark={handleSelectBenchmark}
        />
      )}

      {selectedBenchmarks.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
              <Card className="p-4 flex items-center gap-4 shadow-lg">
                  <div className="text-sm font-medium">
                      {selectedBenchmarks.length} item(s) selected
                  </div>
                  <Button asChild>
                      <Link href={`/compare?ids=${selectedBenchmarks.join(',')}`}>
                          Compare <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBenchmarks([])}>
                      <X className="h-4 w-4" />
                  </Button>
              </Card>
          </div>
      )}
    </div>
  );
}
