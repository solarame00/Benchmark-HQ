
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Score vs. Organic Traffic</CardTitle>
                    <CardDescription>Comparing competitor scores and their monthly organic traffic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Primary Market</CardTitle>
                    <CardDescription>Breakdown of competitors by main market.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Strategy</CardTitle>
                    <CardDescription>Distribution of payment strategies used.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Adoption</CardTitle>
                    <CardDescription>How many competitors offer key features.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
