import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  MessageSquareText,
  Route,
  ShieldCheck
} from "lucide-react";
import { ConversionSection } from "@/components/Conversion";
import { FeatureSection } from "@/components/Feature";
import hero from "@/public/images/hero.png";
import delivery from "@/public/images/delivery.png";
import employee from "@/public/images/employee.png";
import logoMark from "@/public/images/logo.png";

const outcomes = [
  { label: "Lead capture", value: "24/7", icon: Headphones },
  { label: "Admin work reduced", value: "40%", icon: CheckCircle2 },
  { label: "Revenue risk surfaced", value: "$", icon: Banknote }
];

const workflow = [
  {
    title: "Capture",
    body: "AI receptionist replies, quotes, collects details, and keeps the inquiry moving.",
    icon: MessageSquareText
  },
  {
    title: "Book",
    body: "Managers turn booking-ready conversations into scheduled jobs with customer and service context.",
    icon: CalendarCheck2
  },
  {
    title: "Dispatch",
    body: "Staff see the work, status, notes, and completion steps without office confusion.",
    icon: Route
  },
  {
    title: "Collect",
    body: "Completed jobs trigger invoices, payment links, reminders, and revenue-risk actions.",
    icon: Banknote
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f5] text-ink">
      <section className="relative overflow-hidden bg-ink text-white">
        <Image
          src={hero}
          alt="CrewFlow operations console and customer messaging"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] opacity-54"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#14211f_0%,rgba(20,33,31,0.92)_36%,rgba(20,33,31,0.56)_68%,rgba(20,33,31,0.2)_100%)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-[8px] bg-ink shadow-soft">
              <Image src={logoMark} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">CrewFlow</p>
              <p className="text-xs text-white/68">Operations AI for service businesses</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/72 md:flex">
            <a href="#engine" className="transition hover:text-white">Engine</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#operations" className="transition hover:text-white">Operations</a>
            <a href="#setup" className="transition hover:text-white">Setup</a>
          </nav>
          <Link
            href="/app"
            className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-ink shadow-soft transition hover:bg-mint"
          >
            Open console
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-5 pb-24 pt-16 md:px-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-2xl">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-[8px] border border-white/14 bg-white/8 px-3 py-2 text-sm font-semibold text-white/78">
              <ShieldCheck className="h-4 w-4 text-mint" />
              AI-powered operations assistant for home-service teams
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] md:text-7xl">
              Stop losing jobs in the daily rush.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              CrewFlow captures inquiries, books jobs, coordinates staff, triggers invoices, and
              shows managers where revenue is leaking.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="flex h-12 items-center gap-2 rounded-[8px] bg-mint px-5 font-semibold text-ink shadow-soft transition hover:bg-white"
              >
                Launch console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#setup"
                className="flex h-12 items-center rounded-[8px] border border-white/24 px-5 font-semibold text-white transition hover:bg-white/10"
              >
                Configure workspace
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto w-full max-w-lg rounded-[8px] border border-white/12 bg-white/10 p-3 shadow-soft backdrop-blur">
              <div className="rounded-[8px] bg-white p-4 text-ink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-steel">Today’s revenue command</p>
                    <p className="mt-1 text-2xl font-semibold">$4,820 at risk</p>
                  </div>
                  <StatusPill label="Live" />
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    ["Booking-ready lead", "Deep clean quote captured", "Book"],
                    ["Completed job", "Invoice not paid", "Collect"],
                    ["Crew dispatch", "2 jobs unassigned", "Assign"]
                  ].map(([title, body, action]) => (
                    <div key={title} className="flex items-center justify-between rounded-[8px] bg-mist p-3">
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-steel">{body}</p>
                      </div>
                      <span className="rounded-[8px] bg-ink px-3 py-1 text-sm font-semibold text-white">
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

      <FeatureSection />

      <section id="workflow" className="bg-white px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Workflow</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                One operating path from inquiry to paid job.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel">
                The product is not a dashboard for looking busy. It is a workflow for protecting
                bookings, staff time, customer follow-up, and cash collection.
              </p>
              <div className="mt-8 grid gap-3">
                {workflow.map((item) => (
                  <WorkflowRow key={item.title} {...item} />
                ))}
              </div>
            </div>
            <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-ink shadow-soft">
              <Image
                src={delivery}
                alt="Field dispatch and live customer delivery updates"
                fill
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 max-w-lg p-5 text-white">
                <p className="text-2xl font-semibold">Built for teams moving in the real world.</p>
                <p className="mt-2 leading-7 text-white/72">
                  Dispatch visibility, customer updates, and completion proof stay tied to revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="operations" className="px-5 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-ink shadow-soft">
            <Image
              src={employee}
              alt="Manager reviewing employee operations and service team performance"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Operations control</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Managers see what needs action, not another wall of charts.
            </h2>
            <div className="mt-8 grid gap-3">
              {[
                "Hot leads that have not become bookings",
                "Completed jobs with unpaid invoices",
                "Upcoming appointments without assigned staff",
                "WhatsApp delivery and automation readiness",
                "Customer timeline with spend, invoices, and next booking"
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-[8px] bg-white p-4 shadow-soft">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-pine" />
                  <p className="font-medium leading-6 text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ConversionSection />

      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-[8px] bg-ink shadow-soft">
                <Image src={logoMark} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <p className="font-semibold text-ink">CrewFlow</p>
                <p className="text-sm text-steel">Operational AI OS for service businesses</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-steel">
              Built for owners and managers who need fewer missed inquiries, cleaner scheduling,
              faster follow-up, and better cash collection.
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
            <p className="font-semibold text-ink">Best fit</p>
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
            <p>AI-powered operations assistant for service businesses.</p>
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

function WorkflowRow({
  title,
  body,
  icon: Icon
}: {
  title: string;
  body: string;
  icon: typeof MessageSquareText;
}) {
  return (
    <div className="flex gap-4 rounded-[8px] border border-ink/8 bg-[#f6f8f5] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-pine shadow-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-steel">{body}</p>
      </div>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-[8px] bg-mint px-3 py-1 text-sm font-semibold text-ink">
      {label}
    </span>
  );
}
