"use client";

import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-lg rounded-[8px] border border-white/80 bg-white/90 p-6 text-center shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
          CrewFlow console
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Something needs a refresh.</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          {error.message || "The page hit an unexpected state while loading."}
        </p>
        <button
          onClick={reset}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </section>
    </main>
  );
}
