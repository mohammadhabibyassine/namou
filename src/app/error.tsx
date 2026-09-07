"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
    <main className="technical-grid grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-3xl">
        <div className="border-line mx-auto grid size-40 place-items-center rounded-full border border-dashed">
          <span className="bg-danger size-4 rounded-full" />
        </div>
        <p className="text-subtle mt-7 font-mono text-[10px] uppercase">
          Error / Recoverable
        </p>
        <h1 className="display-title mt-4 text-6xl sm:text-9xl">
          Connection interrupted.
        </h1>
        <p className="text-subtle mx-auto mt-4 max-w-md text-sm leading-6">
          The current operation did not complete. Your saved data has not been
          cleared.
        </p>
        <Button className="mt-8" variant="accent" onClick={reset}>
          Retry system
        </Button>
      </div>
    </main>
  );
}
