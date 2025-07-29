
'use server';

import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
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

// This function adds a new benchmark to the 'benchmarks' collection.
export async function addBenchmark(benchmarkData: BenchmarkInput) {
  try {
    const dataWithTimestamp = {
      ...benchmarkData,
      lastUpdated: Timestamp.now(),
    };
    await addDoc(collection(db, 'benchmarks'), dataWithTimestamp);
  } catch (error) {
    console.error("Error adding benchmark: ", error);
    throw new Error("Could not add benchmark.");
  }
}

// This function updates an existing benchmark in the 'benchmarks' collection.
export async function updateBenchmark(id: string, benchmarkData: BenchmarkInput) {
  try {
    const docRef = doc(db, 'benchmarks', id);
    const dataWithTimestamp = {
      ...benchmarkData,
      lastUpdated: Timestamp.now(),
    };
    await updateDoc(docRef, dataWithTimestamp);
  } catch (error) {
    console.error("Error updating benchmark: ", error);
    throw new Error("Could not update benchmark.");
  }
}

// This function deletes a benchmark from the 'benchmarks' collection.
export async function deleteBenchmark(id: string) {
  try {
    await deleteDoc(doc(db, 'benchmarks', id));
  } catch (error) {
    console.error("Error deleting benchmark: ", error);
    throw new Error("Could not delete benchmark.");
  }
}
