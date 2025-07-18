'use client';

import type { Benchmark } from '@/lib/types';
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
  Edit,
  Globe,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';

type BenchmarkTableProps = {
  benchmarks: Benchmark[];
  loading?: boolean;
  onEdit: (benchmark: Benchmark) => void;
  onDelete: (id: string) => void;
  isDetailsView?: boolean;
};

export function BenchmarkTable({ benchmarks, loading, onEdit, onDelete, isDetailsView = false }: BenchmarkTableProps) {
  
  const formatDate = (dateString: string | Date) => {
    try {
        const date = new Date(dateString);
        return format(date, 'PPpp');
    } catch {
        return 'N/A';
    }
  }

  const renderValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => <Badge key={index} variant="outline">{item}</Badge>)}
        </div>
      );
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{value}</a>
    }
    return value || 'N/A';
  };
  
  const fieldLabels: Record<keyof Omit<Benchmark, 'id'>, string> = {
    url: 'URL',
    score: 'Score',
    organicTraffic: 'Organic Traffic (K)',
    countries: 'Countries',
    startTimeline: 'Start Timeline',
    paymentMethod: 'Payment Methods',
    paymentRedirect: 'Payment Redirect',
    offerTrial: 'Offers Trial?',
    hasBlog: 'Has Blog?',
    hasResellPanel: 'Has Resell Panel?',
    pricing: 'Pricing',
    connections: 'Connections',
    notes: 'Notes',
    tags: 'Tags',
    lastUpdated: 'Last Updated',
  };


  if (isDetailsView && benchmarks.length > 0) {
    const benchmark = benchmarks[0];
    const entries = Object.entries(benchmark).filter(([key]) => key !== 'id') as [keyof Omit<Benchmark, 'id'>, any][];

    return (
      <div className="-mx-6 -mt-6 border-t">
        <Table>
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-semibold w-1/4">{fieldLabels[key]}</TableCell>
                <TableCell className="whitespace-pre-wrap">{key === 'lastUpdated' ? formatDate(value) : renderValue(value)}</TableCell>
              </TableRow>
            ))}
             <TableRow>
                <TableCell className="font-semibold">Actions</TableCell>
                <TableCell>
                    <div className="flex gap-2">
                         <Button variant="outline" size="sm" onClick={() => onEdit(benchmark)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
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
                                    This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{benchmark.url}</span>.
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
                </TableCell>
             </TableRow>
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
            <TableHead>Website</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Traffic (K)</TableHead>
            <TableHead>Trial</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : benchmarks.length > 0 ? (
            benchmarks.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {b.url || 'No URL'}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={b.score > 7 ? 'default' : b.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                    {b.score || 0}
                  </Badge>
                </TableCell>
                <TableCell>{b.organicTraffic || 0}</TableCell>
                <TableCell>
                  {b.offerTrial ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell className="max-w-sm">
                    <div className="flex flex-wrap gap-1">
                        {b.tags?.slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
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
                          This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{b.url}</span>.
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
              <TableCell colSpan={7} className="text-center h-24">
                No benchmarks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
