"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            The app hit an unexpected failure. Retry the request, and if it continues, check the database and authentication configuration.
          </p>
          <Button className="mt-6" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </main>
      </body>
    </html>
  );
}
