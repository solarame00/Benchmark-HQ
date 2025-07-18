import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Feature Not Available</CardTitle>
            </CardHeader>
            <CardContent>
                <p>This feature has been removed from the current version of the application.</p>
            </CardContent>
        </Card>
    </div>
  );
}
