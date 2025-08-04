
'use client';

import type { Benchmark } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, MoreVertical, Globe, Edit, Trash2, XCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';

type BenchmarkCardProps = {
    benchmark: Benchmark;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onViewDetails: () => void;
    onEdit: (benchmark: Benchmark) => void;
    onClone: (benchmark: Benchmark) => void;
    onDelete: (id: string) => void;
};

export function BenchmarkCard({ benchmark, isSelected, onSelect, onViewDetails, onEdit, onClone, onDelete }: BenchmarkCardProps) {
    
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

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent card click when interacting with interactive elements like links or buttons
        if ((e.target as HTMLElement).closest('[data-interactive]')) {
            return;
        }
        onViewDetails();
    }

    return (
        <AlertDialog>
            <Card 
                onClick={handleCardClick}
                className={cn(
                    "flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative cursor-pointer group/card",
                    isSelected && "ring-2 ring-primary shadow-lg"
                )}
            >
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                         <div className="absolute top-2 left-2 z-10" data-interactive>
                            <Checkbox 
                                checked={isSelected} 
                                onCheckedChange={(checked) => onSelect(checked as boolean)}
                                aria-label="Select benchmark"
                                className="bg-background/80"
                            />
                        </div>
                         <CardTitle className="text-lg leading-tight flex-grow pr-8 pl-8">
                             <a href={benchmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2" data-interactive>
                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{getHostname(benchmark.url)}</span>
                            </a>
                        </CardTitle>
                         <div data-interactive className="absolute top-2 right-2 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(benchmark)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onClone(benchmark)}>
                                        <Copy className="mr-2 h-4 w-4" /> Clone
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <CardDescription className="pt-2">
                        <Badge variant={benchmark.score > 7 ? 'default' : benchmark.score > 4 ? 'secondary' : 'destructive'} className="text-base">
                            Score: {benchmark.score || 0}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm pt-0">
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
                        {benchmark.tags?.slice(0, 3).map((tag, index) => <Badge key={`${tag}-${index}`} variant="outline">{tag}</Badge>)}
                        {benchmark.tags && benchmark.tags.length > 3 && <Badge variant="outline">+{benchmark.tags.length - 3}</Badge>}
                    </div>
                </CardFooter>
            </Card>

            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the benchmark data for <span className="font-semibold">{getHostname(benchmark.url)}</span>.
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

    
