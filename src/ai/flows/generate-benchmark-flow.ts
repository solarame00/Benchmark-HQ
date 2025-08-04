
'use server';
/**
 * @fileOverview An AI flow to generate benchmark data from a website URL.
 *
 * - generateBenchmark - A function that takes a URL and returns pre-filled benchmark data.
 * - GenerateBenchmarkInput - The input type for the generateBenchmark function.
 * - GenerateBenchmarkOutput - The return type for the generateBenchmark function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBenchmarkInputSchema = z.string().url();

// We only need a subset of the benchmark fields for the AI to fill.
// The user will fill the rest.
const GenerateBenchmarkOutputSchema = z.object({
  score: z.coerce.number().optional().describe('A score from 0-10 representing the website authority and credibility.'),
  organicTraffic: z.coerce.number().optional().describe('Estimated monthly organic traffic in thousands (e.g., 5 for 5000).'),
  primaryMarket: z.string().optional().describe('The primary country or market the website serves (e.g., USA, UK, France).'),
  offerTrial: z.boolean().optional().describe('Whether the website explicitly offers a free trial.'),
  hasBlog: z.boolean().optional().describe('Whether the website has a blog or articles section.'),
  hasResellPanel: z.boolean().optional().describe('Whether the website mentions a reseller panel or program.'),
  requiresAccount: z.boolean().optional().describe('Whether creating an account seems necessary to use the core service.'),
  tags: z.array(z.string()).optional().describe('A list of 3-5 relevant keywords or tags for the website (e.g., IPTV, Streaming, VOD).'),
  notes: z.string().optional().describe('A brief, one-paragraph summary of the website\'s main offering or purpose.'),
   pricing: z.object({
    currency: z.string().optional().describe('The currency symbol found on the pricing page (e.g., $, €, £).'),
    oneMonth: z.string().optional().describe('The price for a one-month subscription.'),
    threeMonths: z.string().optional().describe('The price for a three-month subscription.'),
    sixMonths: z.string().optional().describe('The price for a six-month subscription.'),
    twelveMonths: z.string().optional().describe('The price for a twelve-month subscription.'),
    twoYear: z.string().optional().describe('The price for a two-year subscription.'),
    lifetime: z.string().optional().describe('The price for a lifetime subscription.'),
  }).optional().describe('The pricing information extracted from the website. Omit any plans that are not found.'),
});


export type GenerateBenchmarkInput = z.infer<typeof GenerateBenchmarkInputSchema>;
export type GenerateBenchmarkOutput = z.infer<typeof GenerateBenchmarkOutputSchema>;


export async function generateBenchmark(url: GenerateBenchmarkInput): Promise<GenerateBenchmarkOutput> {
  return generateBenchmarkFlow(url);
}

const prompt = ai.definePrompt({
  name: 'generateBenchmarkPrompt',
  input: {schema: GenerateBenchmarkInputSchema},
  output: {schema: GenerateBenchmarkOutputSchema},
  prompt: `You are an expert market research analyst. Your task is to analyze the provided URL and extract key information to populate a competitor benchmark form.

Analyze the content of the following website: {{{input}}}

Based on your analysis, fill in the following fields. Only provide data you can reasonably infer from the website's content. If a field is not applicable or you cannot find the information, omit it.

- **Score**: An estimated authority score from 0-10. Consider factors like design, content quality, and apparent trustworthiness.
- **Organic Traffic**: A rough estimate of monthly organic traffic in thousands.
- **Primary Market**: The main country the business targets.
- **Offer Trial**: Does it mention a free trial?
- **Has Blog**: Is there a blog, news, or articles section?
- **Has Resell Panel**: Does it mention a reseller program?
- **Requires Account**: Is an account needed to access the main features?
- **Pricing**: Extract pricing for different subscription lengths.
- **Keywords**: Provide a few relevant keywords.
- **Notes**: A short summary of the website's service.
`,
});

const generateBenchmarkFlow = ai.defineFlow(
  {
    name: 'generateBenchmarkFlow',
    inputSchema: GenerateBenchmarkInputSchema,
    outputSchema: GenerateBenchmarkOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate benchmark data.");
    }
    return output;
  }
);
