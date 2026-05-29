"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page could not load. This can happen when authentication, API calls, or the database connection fails.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/sign-in">
            <Home className="h-4 w-4" />
            Back to login
          </Link>
        </Button>
      </div>
    </div>
  );
}
