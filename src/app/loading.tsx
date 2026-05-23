import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 rounded-[8px] border border-white/80 bg-white/90 px-5 py-4 shadow-soft backdrop-blur">
        <Loader2 className="h-5 w-5 animate-spin text-pine" />
        <span className="text-sm font-semibold text-ink">Loading CrewFlow</span>
      </div>
    </main>
  );
}
