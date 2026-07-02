"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="bg-surface border border-border rounded-lg p-8 text-center max-w-md w-full">
        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted text-sm mb-6">
          We encountered an error while trying to process your request.
        </p>
        <button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
