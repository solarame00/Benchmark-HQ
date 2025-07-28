
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES, CONNECTION_OPTIONS, PAYMENT_STRATEGIES, PAYMENT_METHODS } from '@/lib/constants';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';


const formSchema = z.object({
  url: z.string().optional(),
  score: z.coerce.number().optional(),
  organicTraffic: z.coerce.number().optional(),
  primaryMarket: z.string().min(1, { message: "Primary Market is required." }),
  secondaryMarket: z.string().optional(),
  tertiaryMarket: z.string().optional(),
  startTimeline: z.string().optional(),
  paymentStrategy: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  paymentRedirect: z.string().optional(),
  offerTrial: z.boolean().default(false),
  hasBlog: z.boolean().default(false),
  hasResellPanel: z.boolean().default(false),
  requiresAccount: z.boolean().default(false),
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
          tags: benchmark.tags?.join(', ') || '',
        }
      : {
          url: '',
          score: undefined,
          organicTraffic: undefined,
          primaryMarket: '',
          secondaryMarket: '',
          tertiaryMarket: '',
          startTimeline: '',
          paymentStrategy: '',
          paymentMethods: [],
          paymentRedirect: '',
          offerTrial: false,
          hasBlog: false,
          hasResellPanel: false,
          requiresAccount: false,
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
      primaryMarket: values.primaryMarket,
      secondaryMarket: values.secondaryMarket || '',
      tertiaryMarket: values.tertiaryMarket || '',
      startTimeline: values.startTimeline || '',
      paymentStrategy: values.paymentStrategy || '',
      paymentMethods: values.paymentMethods || [],
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="primaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Market</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="secondaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Market</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="tertiaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Tertiary Market</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-semibold">Payment Details</h3>
            <FormField
              control={form.control}
              name="paymentStrategy"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Strategy</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {PAYMENT_STRATEGIES.map((strategy) => (
                         <FormItem key={strategy} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={strategy} />
                          </FormControl>
                          <FormLabel className="font-normal">{strategy}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethods"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Payment Methods Offered</FormLabel>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {PAYMENT_METHODS.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="paymentMethods"
                        render={({ field }) => {
                          return (
                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="paymentRedirect" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Redirect URL</FormLabel>
                <FormControl><Input placeholder="https://checkout.example.com" {...field} /></FormControl>
                <FormDescription>Required if strategy is 'Redirect Payment'.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          
          <FormField control={form.control} name="pricing" render={({ field }) => (
              <FormItem><FormLabel>Prices</FormLabel><FormControl><Textarea placeholder="1 Month: $10&#10;3 Months: $25" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
             <FormField control={form.control} name="requiresAccount" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Requires Account</FormLabel></div>
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
                <FormItem>
                  <FormLabel>Connections</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select number of connections" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONNECTION_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
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
