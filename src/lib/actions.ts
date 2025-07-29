'use server';

import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Benchmark, BenchmarkInput } from './types';

// This function fetches all benchmarks from the 'benchmarks' collection in Firestore.
export async function getBenchmarks(): Promise<Benchmark[]> {
  try {
    const snapshot = await getDocs(collection(db, 'benchmarks'));
    if (snapshot.empty) {
      return [];
    }
    
    const benchmarks: Benchmark[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      benchmarks.push({
        id: doc.id,
        ...data,
        // Firestore Timestamps need to be converted to ISO strings for the client
        lastUpdated: (data.lastUpdated as Timestamp).toDate().toISOString(),
      } as Benchmark);
    });

    return benchmarks;
  } catch (error) {
    console.error("Error fetching benchmarks: ", error);
    // In case of an error, return an empty array to prevent the app from crashing.
    return [];
  }
}
