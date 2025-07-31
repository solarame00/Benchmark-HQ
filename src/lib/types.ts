

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

export type Benchmark = {
  id: string;
  url: string;
  score: number;
  organicTraffic: number;
  primaryMarket: string;
  secondaryMarket?: string;
  tertiaryMarket?: string;
  startTimeline: string;
  paymentStrategy: string;
  paymentMethods: string[];
  paymentRedirect: string;
  offerTrial: boolean;
  hasBlog: boolean;
  hasResellPanel: boolean;
  requiresAccount: boolean;
  pricing: Pricing;
  connections: string;
  notes: string;
  tags: string[];
  screenshots: Screenshot[];
  lastUpdated: string; // Using ISO string for localStorage
};

export type BenchmarkInput = Omit<Benchmark, "id" | "lastUpdated">;
