'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Benchmark } from '@/lib/types';
import { BenchmarkForm } from '@/components/benchmark-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBenchmarkPage({ params }: { params: { id: string } }) {
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchBenchmark = async () => {
      try {
        const docRef = doc(db, 'benchmarks', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBenchmark({ id: docSnap.id, ...docSnap.data() } as Benchmark);
        } else {
          setError('No such benchmark found!');
        }
      } catch (err) {
        setError('Failed to fetch benchmark data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmark();
  }, [params.id]);

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Benchmark</CardTitle>
          <CardDescription>
            Update the details for the selected website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && benchmark && <BenchmarkForm benchmark={benchmark} />}
        </CardContent>
      </Card>
    </div>
  );
}

    