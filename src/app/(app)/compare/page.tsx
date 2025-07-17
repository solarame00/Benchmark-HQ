import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Compare Benchmarks</h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Feature Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p>The ability to select and visually compare multiple benchmarks side-by-side will be available in a future update.</p>
            </CardContent>
        </Card>
    </div>
  );
}

    