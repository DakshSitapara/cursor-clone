"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AlertCircleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Project page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircleIcon className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              {error.message || "An unexpected error occurred while loading this project."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              className="flex-1"
              onClick={() => reset()}
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              If this problem persists, please:
            </p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
