'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { addBenchmark, summarizeWebsite, updateBenchmark } from '@/lib/actions';
import type { Benchmark } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Wand2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  score: z.coerce.number().min(0).max(10),
  organicSearchTraffic: z.coerce.number().min(0, { message: 'Traffic must be a positive number.' }),
  countries: z.string().min(1, { message: 'Please enter at least one country.' }),
  startTimeline: z.string(),
  paymentMethods: z.string(),
  paymentRedirectionUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  trialOffered: z.boolean().default(false),
  blogPresence: z.boolean().default(false),
  resellPanelAvailable: z.boolean().default(false),
  prices: z.string(),
  connections: z.string(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type BenchmarkFormProps = {
  benchmark?: Benchmark;
};

export function BenchmarkForm({ benchmark }: BenchmarkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: benchmark
      ? {
          ...benchmark,
          score: benchmark.score || 0,
          organicSearchTraffic: benchmark.organicSearchTraffic || 0,
          countries: benchmark.countries?.join('\n') || '',
          paymentMethods: benchmark.paymentMethods?.join('\n') || '',
          tags: benchmark.tags?.join(', ') || '',
        }
      : {
          url: '',
          score: 5,
          organicSearchTraffic: 0,
          countries: '',
          startTimeline: '',
          paymentMethods: '',
          paymentRedirectionUrl: '',
          trialOffered: false,
          blogPresence: false,
          resellPanelAvailable: false,
          prices: '',
          connections: '',
          notes: '',
          tags: '',
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (benchmark) {
        await updateBenchmark(benchmark.id, values);
        toast({ title: 'Success', description: 'Benchmark updated successfully.' });
      } else {
        await addBenchmark(values);
        toast({ title: 'Success', description: 'Benchmark added successfully.' });
        router.push('/');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function handleAiAutofill() {
    const url = form.getValues('url');
    if (!url) {
      form.setError('url', { type: 'manual', message: 'Please enter a URL to summarize.' });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await summarizeWebsite({ url });
      form.setValue('notes', result.summary, { shouldValidate: true });
      form.setValue('paymentMethods', result.paymentMethods.join('\n'), { shouldValidate: true });
      form.setValue('trialOffered', result.trialOffered, { shouldValidate: true });
      form.setValue('blogPresence', result.blogPresence, { shouldValidate: true });
      form.setValue('countries', result.countries.join('\n'), { shouldValidate: true });
      toast({ title: 'AI Autofill Complete', description: 'The form has been pre-filled with AI-detected values.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Autofill Failed',
        description: error instanceof Error ? error.message : 'Could not summarize the website.',
      });
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>AI Assistant</CardTitle>
                        <CardDescription>Enter a URL and let AI pre-fill some fields for you.</CardDescription>
                    </div>
                    <Button type="button" onClick={handleAiAutofill} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Auto-fill with AI
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="score" render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (0-10)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="organicSearchTraffic" render={({ field }) => (
                <FormItem>
                  <FormLabel>Organic Search Traffic (in K)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="countries" render={({ field }) => (
                <FormItem>
                  <FormLabel>Countries</FormLabel>
                  <FormControl><Textarea placeholder="USA&#10;Canada&#10;UK" {...field} /></FormControl>
                  <FormDescription>Enter one country per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="paymentMethods" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Methods</FormLabel>
                  <FormControl><Textarea placeholder="Stripe&#10;PayPal&#10;Crypto" {...field} /></FormControl>
                  <FormDescription>Enter one payment method per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField control={form.control} name="paymentRedirectionUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Redirection URL</FormLabel>
                <FormControl><Input placeholder="https://checkout.example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-3 gap-6">
            <FormField control={form.control} name="trialOffered" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Trial Offered</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="blogPresence" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Blog Presence</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="resellPanelAvailable" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Resell Panel</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FormField control={form.control} name="startTimeline" render={({ field }) => (
                <FormItem><FormLabel>Start Timeline</FormLabel><FormControl><Input placeholder="e.g., Q2 2022" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField control={form.control} name="prices" render={({ field }) => (
                <FormItem><FormLabel>Prices</FormLabel><FormControl><Input placeholder="e.g., $10/mo" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
             <FormField control={form.control} name="connections" render={({ field }) => (
                <FormItem><FormLabel>Connections</FormLabel><FormControl><Input placeholder="e.g., Up to 4" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea placeholder="Any observations..." className="min-h-24" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl><Input placeholder="French Market, US-based, High-Traffic" {...field} /></FormControl>
                <FormDescription>Comma-separated list of tags.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting || isAiLoading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {benchmark ? 'Update Benchmark' : 'Save Benchmark'}
        </Button>
      </form>
    </Form>
  );
}

    