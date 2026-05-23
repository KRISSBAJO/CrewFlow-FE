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

const outcomes = [
  { label: "Answer inquiries while your team is busy", value: "24/7", icon: Headphones },
  { label: "Reduce repetitive admin follow-up", value: "40%", icon: CheckCircle2 },
  { label: "Surface unpaid and at-risk revenue", value: "$", icon: Banknote }
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
      <section className="relative min-h-[86vh] overflow-hidden bg-ink">
        <Image
          src={hero}
          alt="Home-service operations team using CrewFlow"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] opacity-90"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#10201d_0%,#10201d_42%,rgba(16,32,29,0.90)_58%,rgba(16,32,29,0.36)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_18%_34%,rgba(75,203,169,0.20),transparent_28%)]" />
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
          <Link
            href="/app"
            className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-ink shadow-soft transition hover:bg-mint"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(86vh-84px)] max-w-7xl items-center px-5 pb-14 md:px-8">
          <div className="max-w-2xl pt-8 text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-[8px] bg-mint px-3 py-2 text-sm font-semibold text-ink shadow-soft">
              <ShieldCheck className="h-4 w-4 text-ink" />
              AI-powered operations assistant for service businesses
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] md:text-7xl">
              Turn missed calls into booked jobs.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/84">
              CrewFlow helps cleaning and home-service teams manage bookings, staff, customer
              messages, field work, invoices, and urgent follow-up from one calm console.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
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
          </div>
        </div>
      </section>

      <section className="border-b border-ink/8 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px px-5 py-4 md:grid-cols-3 md:px-8">
          {outcomes.map((item) => (
            <Outcome key={item.label} {...item} />
          ))}
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
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[8px] bg-mist text-pine">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 leading-7 text-steel">{body}</p>
    </div>
  );
}
