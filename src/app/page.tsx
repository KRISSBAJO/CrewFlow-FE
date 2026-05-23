import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, CheckCircle2, Headphones, Sparkles } from "lucide-react";
import { FeatureSection } from "@/components/Feature";
import hero from "@/public/images/hero.png";
import heroSecondary from "@/public/images/hero-2.png";

const outcomes = [
  { label: "Answer inquiries while your team is busy", value: "24/7", icon: Headphones },
  { label: "Reduce repetitive admin follow-up", value: "40%", icon: CheckCircle2 },
  { label: "Surface unpaid and at-risk revenue", value: "$", icon: Banknote }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-ink">
      <section className="relative min-h-[760px] overflow-hidden bg-ink">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
          <Image
            src={hero}
            alt="Home-service operations team using CrewFlow"
            fill
            priority
            sizes="58vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/34 to-transparent" />
          <div className="absolute inset-0 bg-ink/12" />
        </div>
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-pine shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">CrewFlow</p>
              <p className="text-xs text-white/72">Operations AI for service teams</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/74 md:flex">
            <a href="#engine" className="transition hover:text-white">
              Engine
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#proof" className="transition hover:text-white">
              Proof
            </a>
          </nav>
          <Link
            href="/app"
            className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-ink shadow-soft transition hover:bg-mint"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[676px] max-w-7xl items-center px-5 pb-16 md:px-8">
          <div className="max-w-[620px] text-white">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-mint">
              CrewFlow for home-service teams
            </p>
            <h1 className="text-5xl font-semibold leading-[1.04] md:text-6xl">
              Turn missed calls into booked jobs.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/82">
              Bookings, staff, messages, field work, invoices, and urgent follow-up in one clean
              operations console.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="flex h-12 items-center gap-2 rounded-[8px] bg-mint px-5 font-semibold text-ink shadow-soft transition hover:bg-white"
              >
                Open console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm font-medium text-white/64">Built to reduce lost revenue and admin chaos.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="border-b border-ink/8 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px px-5 py-4 md:grid-cols-3 md:px-8">
          {outcomes.map((item) => (
            <Outcome key={item.label} {...item} />
          ))}
        </div>
      </section>

      <FeatureSection />

      <section id="workflow" className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div className="relative min-h-[420px] overflow-hidden rounded-[8px] shadow-soft">
          <Image
            src={heroSecondary}
            alt="Field team preparing service work"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="rounded-[8px] bg-ink p-6 text-white shadow-soft md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Workflow</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            From inquiry to paid invoice without losing the thread.
          </h2>
          <div className="mt-8 grid gap-4">
            {[
              "AI receptionist captures the request",
              "Manager sees the booking-ready conversation",
              "Crew completes the job from mobile",
              "Invoice and payment follow-up happen immediately"
            ].map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-sm font-bold text-ink">
                  {index + 1}
                </span>
                <p className="pt-1 text-white/82">{item}</p>
              </div>
            ))}
          </div>
          <Link
            href="/app"
            className="mt-8 flex h-12 w-fit items-center gap-2 rounded-[8px] bg-white px-5 font-semibold text-ink transition hover:bg-mint"
          >
            Enter CrewFlow
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-ink text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-ink">CrewFlow</p>
                <p className="text-sm text-steel">AI operations for service businesses</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-steel">
              Built for teams that need fewer missed inquiries, cleaner scheduling, faster follow-up,
              and better visibility into daily work.
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink">Product</p>
            <div className="mt-4 grid gap-3 text-sm font-medium text-steel">
              <a href="#engine" className="transition hover:text-ink">Money engine</a>
              <a href="#workflow" className="transition hover:text-ink">Workflow</a>
              <Link href="/app" className="transition hover:text-ink">Operations console</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-ink">Focus</p>
            <div className="mt-4 grid gap-3 text-sm font-medium text-steel">
              <p>Cleaning teams</p>
              <p>Home services</p>
              <p>Field crews</p>
            </div>
          </div>
        </div>
        <div className="border-t border-ink/8 px-5 py-4 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-steel md:flex-row md:items-center md:justify-between">
            <p>© 2026 CrewFlow. All rights reserved.</p>
            <p>Operational AI OS for service businesses.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Outcome({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof Headphones;
}) {
  return (
    <div className="flex items-center gap-4 px-2 py-4 md:px-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-mist text-pine">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <p className="text-sm font-medium text-steel">{label}</p>
      </div>
    </div>
  );
}
