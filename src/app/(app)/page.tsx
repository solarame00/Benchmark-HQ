

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Benchmark, BenchmarkInput } from '@/lib/types';
import { BenchmarkTable } from '@/components/benchmark-table';
import { BenchmarkForm } from '@/components/benchmark-form';
import { BenchmarkCard } from '@/components/benchmark-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Table, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { COUNTRIES, PAYMENT_STRATEGIES, PAYMENT_METHODS, CONNECTION_OPTIONS } from '@/lib/constants';
import { MissingApiKeyAlert } from '@/components/missing-api-key-alert';
import { getBenchmarks, addBenchmark, updateBenchmark, deleteBenchmark } from '@/lib/actions';
import Link from 'next/link';


type Checked = DropdownMenuCheckboxItemProps["checked"]

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingBenchmark, setViewingBenchmark] = useState<Benchmark | null>(null);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);

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
    loadBenchmarks();
  }, []);
  
  useEffect(() => {
    const isFormVisible = searchParams.get('showForm') === 'true';
    if (!isFormVisible) {
        setEditingBenchmark(null);
        loadBenchmarks();
    }
  }, [searchParams]);


  const loadBenchmarks = async () => {
    setLoading(true);
    try {
      const firestoreBenchmarks = await getBenchmarks();
      setBenchmarks(firestoreBenchmarks);
    } catch (error) {
      console.error("Failed to load benchmarks from Firestore", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load benchmarks from the database.",
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleAddNew = () => {
    setEditingBenchmark(null);
    setViewingBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.set('showForm', 'true');
    router.push(current.toString(), { scroll: false });
  }

  const handleEdit = (benchmark: Benchmark) => {
    setEditingBenchmark(benchmark);
    setViewingBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.set('showForm', 'true');
    router.push(current.toString(), { scroll: false });
  }

  const handleClone = (benchmark: Benchmark) => {
    const clonedBenchmark = { ...benchmark, id: '', url: '' };
    setEditingBenchmark(clonedBenchmark as Benchmark);
    setViewingBenchmark(null);
    const current = new URL(window.location.href);
    current.searchParams.set('showForm', 'true');
    router.push(current.toString(), { scroll: false });
  };


  const handleDelete = async (id: string) => {
    try {
      await deleteBenchmark(id);
      toast({ title: 'Success', description: 'Benchmark deleted successfully.' });
      if (viewingBenchmark?.id === id) {
        setViewingBenchmark(null);
      }
      setSelectedBenchmarks(prev => prev.filter(selectedId => selectedId !== id));
      loadBenchmarks();
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
    const current = new URL(window.location.href);
    current.searchParams.delete('showForm');
    router.push(current.toString(), { scroll: false });
  }


  const handleSave = async (data: BenchmarkInput, id?: string) => {
    try {
      if (id) {
        await updateBenchmark(id, data);
        toast({ title: 'Success', description: 'Benchmark updated successfully.' });
      } else {
        await addBenchmark(data);
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
  
  const handleSelectBenchmark = (id: string) => {
    setSelectedBenchmarks(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
  }, [benchmarks, searchTerm, sortBy, filters, booleanFilters, paymentMethodsFilter]);

  const handleViewDetails = (benchmark: Benchmark) => {
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
                     <Select onValueChange={(value) => setFilters(f => ({...f, primaryMarket: value}))} defaultValue={filters.primaryMarket}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by primary market" />
                        </SelectTrigger>
                        <SelectContent>
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
          {Array.from({ length: 8 }).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)}
        </div>
      )}

      {!loading && filteredAndSortedBenchmarks.length === 0 && (
         <Card className="col-span-full text-center py-12">
            <CardHeader>
                <CardTitle>No Benchmarks Found</CardTitle>
                <CardDescription>Your search or filter criteria did not match any benchmarks. Try adjusting your filters.</CardDescription>
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
                    onSelect={() => handleSelectBenchmark(b.id)}
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
                    <SheetDescription>{viewingBenchmark.url}</SheetDescription>
                </SheetHeader>
                <BenchmarkTable
                    benchmarks={[viewingBenchmark]}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onDelete={handleDelete}
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

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
