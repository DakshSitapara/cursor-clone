"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FolderOpenIcon, HomeIcon, ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProjectsNotFound() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Projects Not Found";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FolderOpenIcon className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              The projects page you&apos;re looking for doesn&apos;t exist.
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

          <div className="text-sm text-muted-foreground">
            <p>
              If you believe this is an error, please check the URL and try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
    