/**
 * @fileOverview An AI agent that summarizes a website and pre-fills relevant fields in the benchmark form.
 *
 * - summarizeWebsite - A function that handles the website summarization process.
 * - SummarizeWebsiteInput - The input type for the summarizeWebsite function.
 * - SummarizeWebsiteOutput - The return type for the summarizeWebsite function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWebsiteInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to summarize.'),
});
export type SummarizeWebsiteInput = z.infer<typeof SummarizeWebsiteInputSchema>;

const SummarizeWebsiteOutputSchema = z.object({
  title: z.string().describe('The title of the website.'),
  summary: z.string().describe('A short summary of the website.'),
  paymentMethods: z
    .array(z.string())
    .describe('The payment methods accepted by the website.'),
  trialOffered: z.boolean().describe('Whether the website offers a free trial.'),
  blogPresence: z.boolean().describe('Whether the website has a blog.'),
  countries: z.array(z.string()).describe('The countries served by the website.'),
  organicSearchTraffic: z.number().optional().describe('The organic search traffic in thousands.'),
  resellPanelAvailable: z.boolean().optional().describe('Whether a resell panel is available.'),
  prices: z.string().optional().describe('Pricing information including months, currency, and price points.'),
  connections: z.string().optional().describe('Number of connections offered (e.g., "1, 2, 3" or "up to 4 connections").'),
});
export type SummarizeWebsiteOutput = z.infer<typeof SummarizeWebsiteOutputSchema>;

export async function summarizeWebsite(input: SummarizeWebsiteInput): Promise<SummarizeWebsiteOutput> {
  return summarizeWebsiteFlow(input);
}

const summarizeWebsitePrompt = ai.definePrompt({
  name: 'summarizeWebsitePrompt',
  input: {schema: SummarizeWebsiteInputSchema},
  output: {schema: SummarizeWebsiteOutputSchema},
  prompt: `You are an AI assistant that summarizes websites and extracts relevant information for benchmarking purposes.

  Analyze the content of the website at the given URL and extract the following information:

  - Title: The title of the website.
  - Summary: A concise summary of the website's purpose and offerings.
  - Payment Methods: A list of payment methods accepted by the website (e.g., Stripe, PayPal, Crypto).
  - Trial Offered: Whether the website offers a free trial (true/false).
  - Blog Presence: Whether the website has a blog (true/false).
  - Countries: A list of countries served by the website.
  - Organic Search Traffic: The organic search traffic in thousands, if available (number).
  - Resell Panel Available: Whether a resell panel is available (true/false).
  - Prices: Pricing information including months, currency, and price points, if available (string).
  - Connections: Number of connections offered (e.g., "1, 2, 3" or "up to 4 connections"), if available (string).


  URL: {{{url}}}

  Return the information in JSON format.
  `,
});

const summarizeWebsiteFlow = ai.defineFlow(
  {
    name: 'summarizeWebsiteFlow',
    inputSchema: SummarizeWebsiteInputSchema,
    outputSchema: SummarizeWebsiteOutputSchema,
  },
  async input => {
    const {output} = await summarizeWebsitePrompt(input);
    return output!;
  }
);
