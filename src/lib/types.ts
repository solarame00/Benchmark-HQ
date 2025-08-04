

import { z } from 'zod';

export type Screenshot = {
  url: string;
  label: string;
};

export type Pricing = {
  currency?: string;
  oneMonth?: string;
  threeMonths?: string;
  sixMonths?: string;
  twelveMonths?: string;
  twoYear?: string;
  lifetime?: string;
};

export const pricingSchema = z.object({
  currency: z.string().optional(),
  oneMonth: z.string().optional(),
  threeMonths: z.string().optional(),
  sixMonths: z.string().optional(),
  twelveMonths: z.string().optional(),
  twoYear: z.string().optional(),
  lifetime: z.string().optional(),
});

export const screenshotSchema = z.object({
  url: z.string(),
  label: z.string(),
});

export const BenchmarkSchema = z.object({
  id: z.string(),
  url: z.string(),
  score: z.number(),
  organicTraffic: z.number(),
  primaryMarket: z.string(),
  secondaryMarket: z.string().optional(),
  tertiaryMarket: z.string().optional(),
  startTimeline: z.string(),
  paymentStrategy: z.string(),
  paymentMethods: z.array(z.string()),
  paymentRedirect: z.string(),
  offerTrial: z.boolean(),
  hasBlog: z.boolean(),
  hasResellPanel: z.boolean(),
  requiresAccount: z.boolean(),
  pricing: pricingSchema,
  connections: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  screenshots: z.array(screenshotSchema),
  lastUpdated: z.string(), // Using ISO string for client-side compatibility
});


export type Benchmark = z.infer<typeof BenchmarkSchema>;

// BenchmarkInput is used for creating or updating benchmarks.
// 'id' is handled separately (generated for new, used for updates).
// 'lastUpdated' is always set on the server.
export const BenchmarkInputSchema = BenchmarkSchema.omit({ id: true, lastUpdated: true });

export type BenchmarkInput = z.infer<typeof BenchmarkInputSchema>;
