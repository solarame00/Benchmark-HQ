
import type { Benchmark } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Globe } from 'lucide-react';

type RankingTableProps = {
  benchmarks: Benchmark[];
  valueKey: 'score' | 'organicTraffic';
  valueLabel: string;
};

export function RankingTable({ benchmarks, valueKey, valueLabel }: RankingTableProps) {

  const getHostname = (url: string) => {
    if (!url || !url.startsWith('http')) return url || 'No URL';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (benchmarks.length === 0) {
    return <p className="text-sm text-center text-muted-foreground py-8">No data for selected filters.</p>
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="text-right">{valueLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benchmarks.map((b, index) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium max-w-xs truncate">
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {getHostname(b.url)}
                </a>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {b[valueKey]?.toLocaleString() || '0'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
