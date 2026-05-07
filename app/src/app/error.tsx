"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, log to Sentry/Datadog here
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-black tracking-tight text-red-600 mb-6">Error</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Something went wrong loading this page.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => reset()} className="w-full sm:w-auto px-8 py-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-lg">
            Try again
          </button>
          <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-black font-medium rounded-md hover:bg-gray-200 transition-colors border border-gray-200 text-lg">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
