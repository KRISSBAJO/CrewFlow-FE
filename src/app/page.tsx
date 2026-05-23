import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Headphones,
  MessageSquareText,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import hero from "@/public/images/hero.png";
import heroSecondary from "@/public/images/hero-2.png";
import { cn } from "@/lib/utils";

const outcomes = [
  { label: "Missed inquiries recovered", value: "24/7", icon: Headphones },
  { label: "Admin work reduced", value: "40%", icon: CheckCircle2 },
  { label: "Revenue leaks surfaced", value: "$", icon: Banknote }
];

const features = [
  {
    title: "AI receptionist",
    body: "Capture questions, quote services, collect details, and turn messages into booking-ready conversations.",
    icon: MessageSquareText
  },
  {
    title: "Field operations",
    body: "Give crews a mobile job flow for start, notes, photos, checklist, signature, and completion.",
    icon: Route
  },
  {
    title: "Money follow-up",
    body: "Create invoices, payment links, overdue reminders, and manager actions before revenue goes cold.",
    icon: Banknote
  },
  {
    title: "Staff visibility",
    body: "Track assignments, attendance, active jobs, and daily operational bottlenecks from one console.",
    icon: UsersRound
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-ink">
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src={hero}
          alt="Home-service operations team using CrewFlow"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/62 to-ink/20" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-pine shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">CrewFlow</p>
              <p className="text-xs text-white/70">Operations AI for service teams</p>
            </div>
          </div>
          <Link
            href="/app"
            className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mint"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-84px)] max-w-7xl items-center px-5 pb-12 md:px-8">
          <div className="max-w-3xl pt-10 text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-[8px] bg-white/12 px-3 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-mint" />
              AI-powered operations assistant for service businesses
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.01] md:text-7xl">
              Stop losing bookings, invoices, and follow-ups in the daily rush.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              CrewFlow gives cleaning and home-service teams one command center for bookings,
              staff, customer messages, field work, invoices, and revenue-risk actions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="flex h-12 items-center gap-2 rounded-[8px] bg-mint px-5 font-semibold text-ink shadow-soft transition hover:bg-white"
              >
                Launch console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#engine"
                className="flex h-12 items-center rounded-[8px] border border-white/35 px-5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                See the engine
              </a>
            </div>
            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {outcomes.map((item) => (
                <Outcome key={item.label} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="engine" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[0.95fr_1.05fr] md:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Money engine</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Built around operational pain, not dashboard theater.
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Every screen points at a revenue problem: missed calls, slow replies, unassigned jobs,
            no-shows, unpaid invoices, and confused staff.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
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
    <div className="rounded-[8px] border border-white/20 bg-white/12 p-4 backdrop-blur">
      <Icon className="mb-5 h-5 w-5 text-mint" />
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-white/75">{label}</p>
    </div>
  );
}

function Feature({
  title,
  body,
  icon: Icon
}: {
  title: string;
  body: string;
  icon: typeof Headphones;
}) {
  return (
    <div className="rounded-[8px] border border-ink/8 bg-white p-5 shadow-soft">
      <div className={cn("mb-5 flex h-10 w-10 items-center justify-center rounded-[8px] bg-mist text-pine")}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 leading-7 text-steel">{body}</p>
    </div>
  );
}
