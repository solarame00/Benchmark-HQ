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
  organicTraffic: z.coerce.number().min(0),
  countries: z.string().transform((s) => s.split('\n').map(item => item.trim()).filter(Boolean)),
  startTimeline: z.string(),
  paymentMethod: z.string(),
  paymentRedirect: z.string().url().optional().or(z.literal('')),
  offerTrial: z.boolean(),
  hasBlog: z.boolean(),
  hasResellPanel: z.boolean(),
  pricing: z.string(),
  connections: z.string(),
  notes: z.string().optional(),
  tags: z.string().optional().transform((s) => (s ? s.split(',').map(item => item.trim()).filter(Boolean) : [])),
});

async function saveBenchmark(data: z.infer<typeof benchmarkSchema>, id?: string) {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error("Firebase API key is not configured. Please set up your .env file.");
    }
    
    const validatedData = benchmarkSchema.parse(data);
    const benchmarkData: BenchmarkInput & { lastUpdated: any } = {
        ...validatedData,
        lastUpdated: serverTimestamp(),
    };

    if (id) {
        const benchmarkRef = doc(db, 'benchmarks', id);
        await updateDoc(benchmarkRef, benchmarkData);
        revalidatePath(`/benchmark/${id}`);
    } else {
        await addDoc(collection(db, 'benchmarks'), benchmarkData);
    }
    revalidatePath('/');
}

export async function addBenchmark(data: z.infer<typeof benchmarkSchema>) {
    await saveBenchmark(data);
}

export async function updateBenchmark(id: string, data: z.infer<typeof benchmarkSchema>) {
    await saveBenchmark(data, id);
}

export async function deleteBenchmark(id: string) {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error("Firebase API key is not configured. Please set up your .env file.");
    }
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
