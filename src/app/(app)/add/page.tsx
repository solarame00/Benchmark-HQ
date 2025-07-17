import { BenchmarkForm } from "@/components/benchmark-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddBenchmarkPage() {
  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Benchmark</CardTitle>
          <CardDescription>
            Fill in the details of the competitor website to add it to your benchmark list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BenchmarkForm />
        </CardContent>
      </Card>
    </div>
  );
}

    