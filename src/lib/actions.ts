
'use server';

import { collection, getDocs, doc, deleteDoc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Benchmark, BenchmarkInput } from './types';
import { v4 as uuidv4 } from 'uuid';


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
      // Firestore Timestamps need to be converted to ISO strings for client-side compatibility
      const lastUpdatedTimestamp = data.lastUpdated as Timestamp;
      benchmarks.push({
        id: doc.id,
        ...data,
        screenshots: data.screenshots || [],
        lastUpdated: lastUpdatedTimestamp ? lastUpdatedTimestamp.toDate().toISOString() : new Date().toISOString(),
      } as Benchmark);
    });

    return benchmarks;
  } catch (error) {
    console.error("Error fetching benchmarks: ", error);
    return [];
  }
}

// This function adds a new benchmark to the 'benchmarks' collection.
export async function addBenchmark(benchmarkData: BenchmarkInput) {
  try {
    const dataWithTimestamp = {
      ...benchmarkData,
      url: benchmarkData.url || '',
      score: benchmarkData.score || 0,
      organicTraffic: benchmarkData.organicTraffic || 0,
      primaryMarket: benchmarkData.primaryMarket || '',
      secondaryMarket: benchmarkData.secondaryMarket || '',
      tertiaryMarket: benchmarkData.tertiaryMarket || '',
      startTimeline: benchmarkData.startTimeline || '',
      paymentStrategy: benchmarkData.paymentStrategy || '',
      paymentMethods: benchmarkData.paymentMethods || [],
      paymentRedirect: benchmarkData.paymentRedirect || '',
      offerTrial: benchmarkData.offerTrial || false,
      hasBlog: benchmarkData.hasBlog || false,
      hasResellPanel: benchmarkData.hasResellPanel || false,
      requiresAccount: benchmarkData.requiresAccount || false,
      pricing: benchmarkData.pricing || {},
      connections: benchmarkData.connections || '',
      notes: benchmarkData.notes || '',
      tags: benchmarkData.tags || [],
      screenshots: benchmarkData.screenshots || [],
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
    // Create a new object for update, ensuring all fields are defined
    const dataToUpdate = {
        ...benchmarkData,
        lastUpdated: Timestamp.now()
    };
    await updateDoc(docRef, dataToUpdate);
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

// This function uploads a screenshot to Firebase Storage.
export async function uploadScreenshot(benchmarkId: string, file: File) {
  try {
    const uniqueFilename = `${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, `benchmarks/${benchmarkId}/${uniqueFilename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading screenshot:", error);
    throw new Error("Could not upload the screenshot.");
  }
}
