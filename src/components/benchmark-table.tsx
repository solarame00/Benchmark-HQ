
'use client';

import type { Benchmark, Pricing, Screenshot } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Copy,
  Edit,
  Globe,
  MoreVertical,
  Trash2,
  XCircle,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  KeyRound,
  FileText,
  Tags,
  Clock,
  ExternalLink,
  Camera
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Separator } from './ui/separator';
import Image from 'next/image';

type BenchmarkTableProps = {
  benchmarks: Benchmark[];
  loading?: boolean;
  onEdit?: (benchmark: Benchmark) => void;
  onClone?: (benchmark: Benchmark) => void;
  onDelete?: (id: string) => void;
  isDetailsView?: boolean;
  isComparisonView?: boolean;
  selectedBenchmarks?: string[];
  onSelectBenchmark?: (id: string, checked: boolean) => void;
};

const pricingLabels: Record<keyof Omit<Pricing, 'currency'>, string> = {
    oneMonth: '1 Month',
    threeMonths: '3 Months',
    sixMonths: '6 Months',
    twelveMonths: '12 Months',
    twoYear: '2 Year',
    lifetime: 'Lifetime',
};

export function BenchmarkTable({ 
    benchmarks, 
    loading, 
    onEdit = () => {}, 
    onClone = () => {}, 
    onDelete = () => {}, 
    isDetailsView = false,
    isComparisonView = false,
    selectedBenchmarks = [],
    onSelectBenchmark = () => {}
}: BenchmarkTableProps) {
  
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return format(date, 'PPpp');
    } catch {
        return 'N/A';
    }
  }

  const getHostname = (url: string) => {
    if (!url || !url.startsWith('http')) {
        return url || 'No URL';
    }
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch (error) {
        console.error('Invalid URL:', url, error);
        return url;
    }
  };

  const renderValue = (value: any, key: string) => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (key === 'screenshots') {
        return `${(value as Screenshot[]).length} file(s)`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'N/A';
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => <Badge key={index} variant="outline">{item}</Badge>)}
        </div>
      );
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary break-all">{value}</a>
    }
    if (key === 'organicTraffic' && typeof value === 'number') {
        return value.toLocaleString();
    }
     if (key === 'pricing' && typeof value === 'object' && value !== null) {
        const pricing = value as Pricing;
        const currency = pricing.currency || '';
        const pricingEntries = Object.entries(pricing).filter(([period, price]) => price && period !== 'currency') as [keyof Omit<Pricing, 'currency'>, string][];
        
        if (pricingEntries.length === 0) return 'N/A';
        
        return (
             <div className="flex flex-col gap-1">
                {pricingEntries.map(([period, price]) => (
                    <div key={period}>
                        <span className="font-semibold capitalize">{pricingLabels[period]}: </span> 
                        <span>{currency}{price}</span>
                    </div>
                ))}
            </div>
        )
    }
    return value || 'N/A';
  };
  
  const fieldLabels: Record<keyof Omit<Benchmark, 'id'>, string> = {
    url: 'URL',
    score: 'Score Authority',
    organicTraffic: 'Organic Traffic',
    primaryMarket: 'Primary Market',
    secondaryMarket: 'Secondary Market',
    tertiaryMarket: 'Tertiary Market',
    startTimeline: 'Start Timeline',
    paymentStrategy: 'Payment Strategy',
    paymentMethods: 'Payment Methods',
    paymentRedirect: 'Payment Redirect',
    offerTrial: 'Offers Trial?',
    hasBlog: 'Has Blog?',
    hasResellPanel: 'Has Resell Panel?',
    requiresAccount: 'Requires Account?',
    pricing: 'Pricing',
    connections: 'Connections',
    notes: 'Notes',
    tags: 'Keywords',
    screenshots: 'Attachments',
    lastUpdated: 'Last Updated',
  };

const DetailItem = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <div className="text-base font-medium pl-6">{children}</div>
    </div>
);

const BooleanDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: boolean }) => (
     <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
        </div>
        {value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </div>
);


  if (isDetailsView && benchmarks.length > 0) {
    const benchmark = benchmarks[0];
    const pricingEntries = Object.entries(benchmark.pricing || {}).filter(([key, value]) => key !== 'currency' && value) as [keyof Omit<Pricing, 'currency'>, string][];

    return (
       <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">Key Metrics</CardTitle>
                        <Badge variant={benchmark.score > 7 ? 'default' : benchmark.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                            Score: {benchmark.score || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailItem icon={TrendingUp} label="Organic Traffic">
                      {benchmark.organicTraffic ? `${benchmark.organicTraffic.toLocaleString()}` : 'N/A'}
                    </DetailItem>
                    <DetailItem icon={MapPin} label="Primary Market">
                      {benchmark.primaryMarket || 'N/A'}
                    </DetailItem>
                    <DetailItem icon={Calendar} label="Start Timeline">
                        {benchmark.startTimeline || 'N/A'}
                    </DetailItem>
                    <DetailItem icon={Clock} label="Last Updated">
                      {formatDate(benchmark.lastUpdated)}
                    </DetailItem>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-xl">Features</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BooleanDetailItem icon={KeyRound} label="Offers Trial" value={benchmark.offerTrial} />
                    <BooleanDetailItem icon={FileText} label="Has Blog" value={benchmark.hasBlog} />
                    <BooleanDetailItem icon={ExternalLink} label="Has Resell Panel" value={benchmark.hasResellPanel} />
                    <BooleanDetailItem icon={KeyRound} label="Requires Account" value={benchmark.requiresAccount} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-xl">Payments & Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <DetailItem icon={CreditCard} label="Payment Strategy">
                        {benchmark.paymentStrategy || 'N/A'}
                    </DetailItem>
                     {benchmark.paymentRedirect && (
                        <DetailItem icon={ExternalLink} label="Payment Redirect">
                            <a href={benchmark.paymentRedirect} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary break-all">{benchmark.paymentRedirect}</a>
                        </DetailItem>
                    )}
                    <DetailItem icon={CreditCard} label="Payment Methods">
                         {benchmark.paymentMethods.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {benchmark.paymentMethods.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                            </div>
                        ) : 'N/A'}
                    </DetailItem>

                    <Separator />

                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Pricing ({benchmark.pricing?.currency || 'N/A'})</span>
                        </div>
                        {pricingEntries.length > 0 ? (
                             <div className="pl-6 grid grid-cols-2 gap-x-4 gap-y-2">
                                {pricingEntries.map(([period, price]) => (
                                    <div key={period} className="flex justify-between border-b pb-1">
                                        <span className="text-sm font-medium">{pricingLabels[period]}: </span>
                                        <span className="text-sm">{benchmark.pricing?.currency}{price}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="pl-6 text-sm">No pricing information available.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            
            {benchmark.screenshots && benchmark.screenshots.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Camera /> Attachments</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {benchmark.screenshots.map((ss, index) => (
                            <div key={index} className="group relative">
                                <a href={ss.url} target="_blank" rel="noopener noreferrer" className="block">
                                    {ss.url.toLowerCase().includes('.pdf') ? (
                                        <div className="flex flex-col items-center justify-center h-full aspect-video bg-muted rounded-lg p-4 border transition-colors hover:border-primary">
                                            <FileText className="w-12 h-12 text-destructive" />
                                        </div>
                                    ) : (
                                        <Image 
                                            src={ss.url} 
                                            alt={ss.label} 
                                            width={200} height={200} 
                                            className="rounded-lg object-cover aspect-video w-full transition-transform group-hover:scale-105"
                                            data-ai-hint="screenshot website"
                                        />
                                    )}
                                </a>
                                {ss.label && <p className="text-xs text-center mt-1 text-muted-foreground truncate">{ss.label}</p>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader><CardTitle className="text-xl">Additional Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <DetailItem icon={Tags} label="Keywords">
                         {benchmark.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {benchmark.tags.map((t, i) => <Badge key={`${t}-${i}`} variant="secondary">{t}</Badge>)}
                            </div>
                         ) : 'N/A'}
                    </DetailItem>
                    <DetailItem icon={FileText} label="Notes">
                       <p className="whitespace-pre-wrap">{benchmark.notes || 'N/A'}</p>
                    </DetailItem>
                </CardContent>
            </Card>


            <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => onEdit(benchmark)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onClone(benchmark)}>
                    <Copy className="mr-2 h-4 w-4" /> Clone
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{getHostname(benchmark.url)}</span>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(benchmark.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
  }

  if (isComparisonView) {
    if (benchmarks.length === 0) return <p>No benchmarks to compare.</p>;

    const allKeys = Array.from(new Set(benchmarks.flatMap(b => Object.keys(b))))
        .filter(key => key !== 'id' && key !== 'url') as (keyof Omit<Benchmark, 'id'|'url'>)[];
    
    return (
        <div className="w-full overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="font-bold sticky left-0 bg-card z-10">Feature</TableHead>
                {benchmarks.map(b => (
                    <TableHead key={b.id} className="font-bold border-l">
                         <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {getHostname(b.url)}
                        </a>
                    </TableHead>
                ))}
            </TableRow>
            </TableHeader>
            <TableBody>
                {allKeys.map(key => (
                    <TableRow key={key}>
                        <TableCell className="font-semibold sticky left-0 bg-card z-10">{fieldLabels[key] || key}</TableCell>
                        {benchmarks.map(b => (
                            <TableCell key={`${b.id}-${key}`} className="border-l">{key === 'lastUpdated' ? formatDate(b[key] as string) : renderValue(b[key as keyof Benchmark], key)}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
                 <Checkbox 
                    checked={benchmarks.length > 0 && selectedBenchmarks.length === benchmarks.length}
                    onCheckedChange={(checked) => {
                       const allIds = benchmarks.map(b => b.id);
                        if (checked) {
                            allIds.forEach(id => onSelectBenchmark(id, true));
                        } else {
                            allIds.forEach(id => onSelectBenchmark(id, false));
                        }
                    }}
                 />
            </TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Primary Market</TableHead>
            <TableHead>Trial</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={8}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : benchmarks.length > 0 ? (
            benchmarks.map((b) => (
              <TableRow key={b.id} data-state={selectedBenchmarks.includes(b.id) ? 'selected' : ''}>
                <TableCell>
                    <Checkbox 
                        checked={selectedBenchmarks.includes(b.id)}
                        onCheckedChange={(checked) => onSelectBenchmark(b.id, !!checked)}
                        aria-label={`Select ${getHostname(b.url)}`}
                    />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {getHostname(b.url)}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={b.score > 7 ? 'default' : b.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                    {b.score || 0}
                  </Badge>
                </TableCell>
                <TableCell>{b.primaryMarket}</TableCell>
                <TableCell>
                  {b.offerTrial ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell className="max-w-sm">
                    <div className="flex flex-wrap gap-1">
                        {b.tags?.slice(0, 3).map((tag, index) => <Badge key={`${tag}-${index}`} variant="outline">{tag}</Badge>)}
                        {b.tags?.length > 3 && <Badge variant="outline">+{b.tags.length-3}</Badge>}
                    </div>
                </TableCell>
                <TableCell>{formatDate(b.lastUpdated)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(b)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onClone(b)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Clone
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{getHostname(b.url)}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(b.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No benchmarks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
