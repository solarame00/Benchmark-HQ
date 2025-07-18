import type { Timestamp } from "firebase/firestore";

export type Benchmark = {
  id: string;
  url: string;
  score: number;
  organicTraffic: number;
  countries: string[];
  startTimeline: string;
  paymentMethod: string;
  paymentRedirect: string;
  offerTrial: boolean;
  hasBlog: boolean;
  hasResellPanel: boolean;
  pricing: string;
  connections: string;
  notes: string;
  tags: string[];
  lastUpdated: Timestamp;
};

export type BenchmarkInput = Omit<Benchmark, "id" | "lastUpdated">;
