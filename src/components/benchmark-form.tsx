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
import type { Benchmark, BenchmarkInput } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  url: z.string().optional(),
  score: z.coerce.number().optional(),
  organicTraffic: z.coerce.number().optional(),
  countries: z.string().optional(),
  startTimeline: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentRedirect: z.string().optional(),
  offerTrial: z.boolean().default(false),
  hasBlog: z.boolean().default(false),
  hasResellPanel: z.boolean().default(false),
  pricing: z.string().optional(),
  connections: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type BenchmarkFormProps = {
  benchmark?: Benchmark | null;
  onSave: (data: BenchmarkInput, id?: string) => void;
  onCancel: () => void;
};

export function BenchmarkForm({ benchmark, onSave, onCancel }: BenchmarkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: benchmark
      ? {
          ...benchmark,
          score: benchmark.score || undefined,
          organicTraffic: benchmark.organicTraffic || undefined,
          countries: benchmark.countries?.join('\n') || '',
          tags: benchmark.tags?.join(', ') || '',
        }
      : {
          url: '',
          score: undefined,
          organicTraffic: undefined,
          countries: '',
          startTimeline: '',
          paymentMethod: '',
          paymentRedirect: '',
          offerTrial: false,
          hasBlog: false,
          hasResellPanel: false,
          pricing: '',
          connections: '',
          notes: '',
          tags: '',
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));

    const dataToSave: BenchmarkInput = {
      ...values,
      url: values.url || '',
      score: values.score || 0,
      organicTraffic: values.organicTraffic || 0,
      countries: values.countries ? values.countries.split('\n').map(item => item.trim()).filter(Boolean) : [],
      startTimeline: values.startTimeline || '',
      paymentMethod: values.paymentMethod || '',
      paymentRedirect: values.paymentRedirect || '',
      pricing: values.pricing || '',
      connections: values.connections || '',
      notes: values.notes || '',
      tags: values.tags ? values.tags.split(',').map(item => item.trim()).filter(Boolean) : [],
    };
    
    onSave(dataToSave, benchmark?.id);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
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

          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="score" render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (0-10)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="organicTraffic" render={({ field }) => (
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
            <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method(s)</FormLabel>
                  <FormControl><Textarea placeholder="Stripe&#10;PayPal&#10;Crypto" {...field} /></FormControl>
                   <FormDescription>Enter one payment method per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField control={form.control} name="pricing" render={({ field }) => (
              <FormItem><FormLabel>Prices</FormLabel><FormControl><Textarea placeholder="1 Month: $10&#10;3 Months: $25" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />

          <FormField control={form.control} name="paymentRedirect" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Redirect URL</FormLabel>
                <FormControl><Input placeholder="https://checkout.example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-3 gap-6">
            <FormField control={form.control} name="offerTrial" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Offers Trial</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="hasBlog" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Has Blog</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="hasResellPanel" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Has Resell Panel</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="startTimeline" render={({ field }) => (
                <FormItem><FormLabel>Start Timeline</FormLabel><FormControl><Input placeholder="e.g., Q2 2022" {...field} /></FormControl><FormMessage /></FormItem>
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
        <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {benchmark ? 'Update Benchmark' : 'Save Benchmark'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
            </Button>
        </div>
      </form>
    </Form>
  );
}
