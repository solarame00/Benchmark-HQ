'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Benchmark, BenchmarkInput } from '@/lib/types';
import { BenchmarkTable } from '@/components/benchmark-table';
import { BenchmarkForm } from '@/components/benchmark-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ field: keyof Benchmark, direction: 'asc' | 'desc' }>({ field: 'lastUpdated', direction: 'desc' });
  
  const [showForm, setShowForm] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<Benchmark | null>(null);

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
    if (searchParams.get('showForm') === 'true') {
        setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if(!loading) {
        localStorage.setItem('benchmarks', JSON.stringify(benchmarks));
    }
  }, [benchmarks, loading]);

  const handleAddNew = () => {
    setEditingBenchmark(null);
    setShowForm(true);
  }

  const handleEdit = (benchmark: Benchmark) => {
    setEditingBenchmark(benchmark);
    setShowForm(true);
  }

  const handleDelete = (id: string) => {
    setBenchmarks(prev => prev.filter(b => b.id !== id));
    toast({ title: 'Success', description: 'Benchmark deleted successfully.' });
  }

  const handleSave = (data: BenchmarkInput, id?: string) => {
    if (id) {
      // Update
      setBenchmarks(prev => prev.map(b => b.id === id ? { ...b, ...data, lastUpdated: new Date().toISOString() } : b));
      toast({ title: 'Success', description: 'Benchmark updated successfully.' });
    } else {
      // Add new
      const newBenchmark: Benchmark = {
        id: new Date().toISOString(),
        ...data,
        lastUpdated: new Date().toISOString()
      };
      setBenchmarks(prev => [newBenchmark, ...prev]);
      toast({ title: 'Success', description: 'Benchmark added successfully.' });
    }
    setShowForm(false);
    setEditingBenchmark(null);
  };

  const filteredAndSortedBenchmarks = useMemo(() => {
    let filtered = benchmarks.filter((b) =>
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortBy.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy.field];
        const bValue = b[sortBy.field];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        }
        
        return sortBy.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [benchmarks, searchTerm, sortBy]);
  
  const handleSort = (field: keyof Benchmark) => {
    setSortBy(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }

  if (showForm) {
      return (
        <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
            <Card>
                <CardHeader>
                <CardTitle>{editingBenchmark ? 'Edit Benchmark' : 'Add New Benchmark'}</CardTitle>
                <CardDescription>
                    Fill in the details of the competitor website. All fields are optional.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <BenchmarkForm
                        benchmark={editingBenchmark}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingBenchmark(null);
                        }}
                    />
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Benchmarks</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Benchmark
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by URL, notes, or tags..."
          className="w-full pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <BenchmarkTable
        benchmarks={filteredAndSortedBenchmarks}
        loading={loading}
        onSort={handleSort}
        sortBy={sortBy.field}
        sortDirection={sortBy.direction}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
