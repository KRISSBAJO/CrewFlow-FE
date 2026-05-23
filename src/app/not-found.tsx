import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-lg rounded-[8px] border border-white/80 bg-white/90 p-6 text-center shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">
          CrewFlow
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          The page may have moved or the link is incomplete.
        </p>
        <Link
          href="/app"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-pine px-4 font-semibold text-white"
        >
          Open console
        </Link>
      </section>
    </main>
  );
}
