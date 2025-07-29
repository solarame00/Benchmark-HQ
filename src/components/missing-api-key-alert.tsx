'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export function MissingApiKeyAlert() {
  const [isConfigMissing, setIsConfigMissing] = useState(false);

  useEffect(() => {
    const isMissing = !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    setIsConfigMissing(isMissing);
  }, []);

  if (!isConfigMissing) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Firebase Configuration Missing</AlertTitle>
      <AlertDescription>
        Your Firebase project configuration is missing. Please add your Firebase project configuration to the 
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">.env</code> 
        file to connect to the database. Without it, the app will not be able to save or load data.
      </AlertDescription>
    </Alert>
  );
}
