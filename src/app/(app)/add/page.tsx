'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// This component safely uses the useSearchParams hook.
function SearchParamsContent() {
  const searchParams = useSearchParams();
  // The content of this page is not currently used, but we read a param
  // to satisfy the build process and fix the error.
  const id = searchParams.get('id');
  
  // The page is not visible in the UI, so we return null.
  return null;
}

// The main page component wraps the content in a Suspense boundary.
export default function AddPage() {
  return (
    <Suspense fallback={<div>Loading parameters...</div>}>
      <SearchParamsContent />
    </Suspense>
  );
}
