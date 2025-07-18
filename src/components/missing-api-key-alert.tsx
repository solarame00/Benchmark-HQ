'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export function MissingApiKeyAlert() {
  const [isConfigMissing, setIsConfigMissing] = useState(false);

  useEffect(() => {
    // This component is no longer used for Firestore, but can be repurposed later.
    // For now, we just ensure it doesn't render.
    setIsConfigMissing(false);
  }, []);

  if (!isConfigMissing) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Missing</AlertTitle>
      <AlertDescription>
        Your Firebase API key is missing. Please add your Firebase project configuration to the 
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">.env</code> 
        file to connect to the database.
      </AlertDescription>
    </Alert>
  );
}
