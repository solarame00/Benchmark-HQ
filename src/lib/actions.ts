'use server';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { summarizeWebsite as genkitSummarizeWebsite, SummarizeWebsiteInput } from '@/ai/flows/url-summary';
import { db } from './firebase';
import type { BenchmarkInput } from './types';

const benchmarkSchema = z.object({
  url: z.string().url(),
  score: z.coerce.number().min(0).max(10),
  organicSearchTraffic: z.coerce.number().min(0),
  countries: z.string().transform((s) => s.split('\n').map(item => item.trim()).filter(Boolean)),
  startTimeline: z.string(),
  paymentMethods: z.string().transform((s) => s.split('\n').map(item => item.trim()).filter(Boolean)),
  paymentRedirectionUrl: z.string().url().optional().or(z.literal('')),
  trialOffered: z.boolean(),
  blogPresence: z.boolean(),
  resellPanelAvailable: z.boolean(),
  prices: z.string(),
  connections: z.string(),
  notes: z.string().optional(),
  tags: z.string().transform((s) => s.split(',').map(item => item.trim()).filter(Boolean)),
});

export async function addBenchmark(data: z.infer<typeof benchmarkSchema>) {
  const validatedData = benchmarkSchema.parse(data);
  const benchmarkData: BenchmarkInput & { lastUpdated: any } = {
    ...validatedData,
    lastUpdated: serverTimestamp(),
  };

  await addDoc(collection(db, 'benchmarks'), benchmarkData);
  revalidatePath('/');
}

export async function updateBenchmark(id: string, data: z.infer<typeof benchmarkSchema>) {
  const validatedData = benchmarkSchema.parse(data);
  const benchmarkRef = doc(db, 'benchmarks', id);

  const benchmarkData: Partial<BenchmarkInput> & { lastUpdated: any } = {
    ...validatedData,
    lastUpdated: serverTimestamp(),
  };

  await updateDoc(benchmarkRef, benchmarkData);
  revalidatePath('/');
  revalidatePath(`/benchmark/${id}`);
}

export async function deleteBenchmark(id: string) {
  const benchmarkRef = doc(db, 'benchmarks', id);
  await deleteDoc(benchmarkRef);
  revalidatePath('/');
}

export async function summarizeWebsite(input: SummarizeWebsiteInput) {
    if (!input.url) {
        throw new Error("URL is required.");
    }
    try {
        const result = await genkitSummarizeWebsite(input);
        return result;
    } catch (error) {
        console.error("Error summarizing website:", error);
        throw new Error("Failed to summarize website. Please check the URL and try again.");
    }
}

    