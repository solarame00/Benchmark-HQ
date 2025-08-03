
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CompareLoading() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Compare Benchmarks</h1>
             <Button asChild variant="outline">
                <Link href="/">Back to Dashboard</Link>
            </Button>
        </div>
        <Card>
            <CardContent className="p-6">
                 <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold sticky left-0 bg-card z-10 w-48">Feature</TableHead>
                                <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-32" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-semibold sticky left-0 bg-card z-10"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
