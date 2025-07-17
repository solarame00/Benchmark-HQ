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
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Edit,
  Globe,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { deleteBenchmark } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';

type SortProps = {
  onSort: (field: keyof Benchmark) => void;
  sortBy: keyof Benchmark | null;
  sortDirection: 'asc' | 'desc';
};

const SortableHeader = ({ children, field, ...sortProps }: { children: React.ReactNode, field: keyof Benchmark } & SortProps) => {
    const { sortBy, sortDirection, onSort } = sortProps;
    const isSorted = sortBy === field;
    return (
        <TableHead onClick={() => onSort(field)} className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
                {children}
                {isSorted && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
            </div>
        </TableHead>
    );
}

export function BenchmarkTable({ benchmarks, loading, ...sortProps }: { benchmarks: Benchmark[], loading: boolean } & SortProps) {
  const { toast } = useToast();

  const handleDelete = async (id: string, url: string) => {
    try {
      await deleteBenchmark(id);
      toast({
        title: 'Benchmark Deleted',
        description: `Successfully deleted benchmark for ${url}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Deleting Benchmark',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="url" {...sortProps}>Website</SortableHeader>
            <SortableHeader field="score" {...sortProps}>Score</SortableHeader>
            <SortableHeader field="organicSearchTraffic" {...sortProps}>Traffic (K)</SortableHeader>
            <SortableHeader field="trialOffered" {...sortProps}>Trial</SortableHeader>
            <TableHead>Tags</TableHead>
            <SortableHeader field="lastUpdated" {...sortProps}>Last Updated</SortableHeader>
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
                    {b.url}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={b.score > 7 ? 'default' : b.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                    {b.score}
                  </Badge>
                </TableCell>
                <TableCell>{b.organicSearchTraffic}K</TableCell>
                <TableCell>
                  {b.trialOffered ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell className="max-w-sm">
                    <div className="flex flex-wrap gap-1">
                        {b.tags?.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                </TableCell>
                <TableCell>{b.lastUpdated ? format(b.lastUpdated.toDate(), 'PP') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/benchmark/${b.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
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
                        <AlertDialogAction onClick={() => handleDelete(b.id, b.url)} className="bg-destructive hover:bg-destructive/90">
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

    