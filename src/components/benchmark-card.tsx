
'use client';

import type { Benchmark } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, MoreVertical, Globe, Edit, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type BenchmarkCardProps = {
    benchmark: Benchmark;
    isActive: boolean;
    onClick: () => void;
    onEdit: (benchmark: Benchmark) => void;
    onDelete: (id: string) => void;
};

export function BenchmarkCard({ benchmark, isActive, onClick, onEdit, onDelete }: BenchmarkCardProps) {
    const allMarkets = [benchmark.primaryMarket, benchmark.secondaryMarket, benchmark.tertiaryMarket].filter(Boolean);
    
    return (
        <AlertDialog>
            <Card 
                className={cn("flex flex-col cursor-pointer transition-all hover:shadow-md", isActive && "ring-2 ring-primary shadow-lg")}
                onClick={onClick}
            >
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight truncate flex-grow">
                             <a href={benchmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{benchmark.url ? new URL(benchmark.url).hostname.replace('www.', '') : 'No URL'}</span>
                            </a>
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => onEdit(benchmark)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <CardDescription>
                         <Badge variant={benchmark.score > 7 ? 'default' : benchmark.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                            Score: {benchmark.score || 0}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Trial?</span>
                        {benchmark.offerTrial ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Blog?</span>
                        {benchmark.hasBlog ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Traffic</span>
                        <span>{benchmark.organicTraffic || 0}K</span>
                    </div>
                </CardContent>
                <CardFooter>
                     <div className="flex flex-wrap gap-1">
                        {allMarkets.slice(0, 3).map((market) => <Badge key={market} variant="outline">{market}</Badge>)}
                        {allMarkets.length > 3 && <Badge variant="outline">+{allMarkets.length - 3}</Badge>}
                     </div>
                </CardFooter>
            </Card>

            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{benchmark.url}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(benchmark.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
