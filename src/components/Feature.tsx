import Image from "next/image";
import { Banknote, CalendarCheck2, MessageSquareText, Route } from "lucide-react";
import featureOne from "@/public/images/feature_01.png";
import featureTwo from "@/public/images/feature_02.png";

const featureCards = [
  {
    title: "AI receptionist",
    body: "Capture inquiries, collect details, and turn conversations into booking-ready work.",
    icon: MessageSquareText
  },
  {
    title: "Booking command",
    body: "Keep customers, services, staff, status, and daily schedules in one operational view.",
    icon: CalendarCheck2
  },
  {
    title: "Field crew flow",
    body: "Give teams a simple mobile path for start, notes, photos, checklist, and completion.",
    icon: Route
  },
  {
    title: "Invoice follow-up",
    body: "Trigger invoices, payment links, overdue nudges, and manager actions before cash goes cold.",
    icon: Banknote
  }
];

export function FeatureSection() {
  return (
    <section id="engine" className="bg-[#f6f8f5] px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Money engine</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-ink md:text-5xl">
              The operating system for jobs that should not slip.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-steel">
            CrewFlow is organized around the moments service businesses lose money:
            missed inquiries, schedule confusion, no-shows, late invoices, and weak follow-up.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[8px] bg-ink shadow-soft">
            <div className="relative aspect-[16/10] min-h-[320px]">
              <Image
                src={featureOne}
                alt="CrewFlow booking and mobile confirmation screens"
                fill
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="grid gap-3 p-5 text-white md:grid-cols-2">
              <p className="text-xl font-semibold">Receptionist intake becomes scheduled work.</p>
              <p className="leading-7 text-white/70">
                Quotes, customer records, service details, and booking status stay in the same flow.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative min-h-[280px] overflow-hidden rounded-[8px] bg-ink shadow-soft">
              <Image
                src={featureTwo}
                alt="Service business managers reviewing operations"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover opacity-78"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
              <div className="absolute bottom-0 max-w-md p-5 text-white">
                <p className="text-2xl font-semibold">Manager visibility without corporate dashboard noise.</p>
                <p className="mt-3 leading-7 text-white/72">
                  See what needs action today: missed replies, unassigned jobs, no-shows, and unpaid work.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {featureCards.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  icon: Icon
}: {
  title: string;
  body: string;
  icon: typeof MessageSquareText;
}) {
  return (
    <div className="rounded-[8px] border border-ink/8 bg-white p-5 shadow-soft">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-mist text-pine">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
    </div>
  );
}
