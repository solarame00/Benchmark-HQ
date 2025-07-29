
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
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES, CONNECTION_OPTIONS, PAYMENT_STRATEGIES, PAYMENT_METHODS, CURRENCIES } from '@/lib/constants';
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
  pricing: z.object({
    currency: z.string().optional(),
    oneMonth: z.string().optional(),
    threeMonths: z.string().optional(),
    sixMonths: z.string().optional(),
    twelveMonths: z.string().optional(),
    twoYear: z.string().optional(),
    lifetime: z.string().optional(),
  }).optional(),
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
    defaultValues: {
      url: benchmark?.url || '',
      score: benchmark?.score || undefined,
      organicTraffic: benchmark?.organicTraffic || undefined,
      primaryMarket: benchmark?.primaryMarket || '',
      secondaryMarket: benchmark?.secondaryMarket || '',
      tertiaryMarket: benchmark?.tertiaryMarket || '',
      startTimeline: benchmark?.startTimeline || '',
      paymentStrategy: benchmark?.paymentStrategy || '',
      paymentMethods: benchmark?.paymentMethods || [],
      paymentRedirect: benchmark?.paymentRedirect || '',
      offerTrial: benchmark?.offerTrial || false,
      hasBlog: benchmark?.hasBlog || false,
      hasResellPanel: benchmark?.hasResellPanel || false,
      requiresAccount: benchmark?.requiresAccount || false,
      pricing: {
        currency: benchmark?.pricing?.currency || '',
        oneMonth: benchmark?.pricing?.oneMonth || '',
        threeMonths: benchmark?.pricing?.threeMonths || '',
        sixMonths: benchmark?.pricing?.sixMonths || '',
        twelveMonths: benchmark?.pricing?.twelveMonths || '',
        twoYear: benchmark?.pricing?.twoYear || '',
        lifetime: benchmark?.pricing?.lifetime || '',
      },
      connections: benchmark?.connections || '',
      notes: benchmark?.notes || '',
      tags: benchmark?.tags?.join(', ') || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
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
      pricing: values.pricing || {},
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
                  <FormLabel>Score Authority</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="organicTraffic" render={({ field }) => (
                <FormItem>
                  <FormLabel>Traffic</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="primaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Market</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                  </FormControl>
                  <SelectContent position="item-aligned">
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="secondaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Market</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  </FormControl>
                  <SelectContent position="item-aligned">
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="tertiaryMarket" render={({ field }) => (
              <FormItem>
                <FormLabel>Tertiary Market</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  </FormControl>
                  <SelectContent position="item-aligned">
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
           <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-semibold">Pricing Details</h3>
             <FormField control={form.control} name="pricing.currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="pricing.oneMonth" render={({ field }) => (
                  <FormItem><FormLabel>1 Month Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 19" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricing.threeMonths" render={({ field }) => (
                  <FormItem><FormLabel>3 Months Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 49" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricing.sixMonths" render={({ field }) => (
                  <FormItem><FormLabel>6 Months Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 89" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricing.twelveMonths" render={({ field }) => (
                  <FormItem><FormLabel>12 Months Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 159" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricing.twoYear" render={({ field }) => (
                  <FormItem><FormLabel>2 Year Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 299" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricing.lifetime" render={({ field }) => (
                  <FormItem><FormLabel>Lifetime Price</FormLabel><FormControl><Input type="number" placeholder="e.g. 499" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>
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
                      value={field.value}
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                <FormLabel>Keywords</FormLabel>
                <FormControl><Input placeholder="IPTV, Sports, VOD" {...field} /></FormControl>
                <FormDescription>Comma-separated keywords (e.g., IPTV, Sports, VOD).</FormDescription>
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
