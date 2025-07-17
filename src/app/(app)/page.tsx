'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy as fOrderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Benchmark } from '@/lib/types';
import { BenchmarkTable } from '@/components/benchmark-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{ field: keyof Benchmark, direction: 'asc' | 'desc' }>({ field: 'score', direction: 'desc' });

  useEffect(() => {
    const q = query(collection(db, 'benchmarks'), fOrderBy('lastUpdated', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const benchmarksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Benchmark));
      setBenchmarks(benchmarksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime();
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Benchmarks</h1>
        <Button asChild>
          <Link href="/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Benchmark
          </Link>
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
      />
    </div>
  );
}

    