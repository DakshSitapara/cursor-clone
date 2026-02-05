"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);


    const handleBlockingApiCall = async () => {
        setLoading(true);
         await fetch('/api/demo/blocking', {
            method: 'POST',
        });
        setLoading(false);
    }

    const handleBackgroundApiCall = async () => {
      setLoading2(true);
       await fetch('/api/demo/background', {
            method: 'POST',
        });
      setLoading2(false);
    }

    const handleClintsideError = async () => {
      throw new Error("This is a client-side error");
    }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Button onClick={handleBlockingApiCall} disabled={loading}>{loading ? "Loading..." : "Blocking API Call"}</Button>
        <Button onClick={handleBackgroundApiCall} className="ml-4" disabled={loading2}>{loading2 ? "Loading..." : "Background API Call"}</Button>
        <Button onClick={handleClintsideError} className="ml-4">Client-side Error</Button>
    </div>
  );
}