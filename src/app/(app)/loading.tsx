
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
             <div className="flex-grow max-w-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Skeleton className="h-10 w-full pl-9" />
                </div>
            </div>
            <Skeleton className="h-10 w-28" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                         <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
