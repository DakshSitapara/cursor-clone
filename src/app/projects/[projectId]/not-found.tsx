"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AlertTriangleIcon, HomeIcon, ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Project Not Found";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Project Not Found
            </h1>
            <p className="text-muted-foreground">
              The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have
              permission to access it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              If you believe this is an error, please check:
            </p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>The project URL is correct</li>
              <li>You&apos;re logged in with the correct account</li>
              <li>The project hasn&apos;t been deleted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
