import type { Timestamp } from "firebase/firestore";

export type Benchmark = {
  id: string;
  url: string;
  score: number;
  organicSearchTraffic: number;
  countries: string[];
  startTimeline: string;
  paymentMethods: string[];
  paymentRedirectionUrl: string;
  trialOffered: boolean;
  blogPresence: boolean;
  resellPanelAvailable: boolean;
  prices: string;
  connections: string;
  notes: string;
  tags: string[];
  lastUpdated: Timestamp;
};

export type BenchmarkInput = Omit<Benchmark, "id" | "lastUpdated">;

    