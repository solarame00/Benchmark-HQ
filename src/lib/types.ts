
export type Benchmark = {
  id: string;
  url: string;
  score: number;
  organicTraffic: number;
  primaryMarket: string;
  secondaryMarket?: string;
  tertiaryMarket?: string;
  startTimeline: string;
  paymentMethod: string;
  paymentRedirect: string;
  offerTrial: boolean;
  hasBlog: boolean;
  hasResellPanel: boolean;
  requiresAccount: boolean;
  pricing: string;
  connections: string;
  notes: string;
  tags: string[];
  lastUpdated: string; // Using ISO string for localStorage
};

export type BenchmarkInput = Omit<Benchmark, "id" | "lastUpdated">;
