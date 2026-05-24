"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";

export default function BookingSuccessPage() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const bookingId = search.get("bookingId") ?? "";

  const status = useQuery({
    queryKey: ["portal-booking", params.slug, bookingId],
    queryFn: () => api.portalBooking(params.slug, bookingId),
    enabled: Boolean(bookingId),
  });

  const invoiceUrl = status.data?.invoice
    ? `/book/${params.slug}/invoice/${status.data.invoice.id}`
    : null;

  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl content-start gap-5">
        <header className="flex items-center justify-between rounded-[8px] border border-white bg-white p-4 shadow-soft">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/images/logo.png" alt="CrewFlow" width={44} height={44} className="rounded-[8px]" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {status.data?.tenant.businessName ?? "Booking status"}
              </p>
              <p className="truncate text-sm text-steel">Customer appointment</p>
            </div>
          </div>
          <Link href={`/book/${params.slug}`} className="hidden rounded-[8px] bg-mist px-4 py-2 text-sm font-semibold text-pine sm:block">
            Book again
          </Link>
        </header>

        {status.isLoading ? (
          <div className="grid min-h-[420px] place-items-center rounded-[8px] bg-white shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-pine" />
          </div>
        ) : null}

        {status.isError || !bookingId ? (
          <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-red-800">
            <p className="text-xl font-semibold">Booking status unavailable</p>
            <p className="mt-2 text-sm">{status.error?.message ?? "Missing booking reference."}</p>
          </div>
        ) : null}

        {status.data ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-[8px] bg-white p-6 shadow-soft sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-4 py-2 text-sm font-semibold text-pine">
                <CheckCircle2 className="h-4 w-4" />
                Booking received
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Your appointment is in the operations queue.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-steel">
                {status.data.tenant.businessName} has your request, customer details, and service notes ready for the team.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <InfoCard icon={CalendarDays} label="Appointment" value={shortDate(status.data.booking.startTime)} />
                <InfoCard icon={Clock} label="Duration" value={`${status.data.booking.service.durationMinutes} minutes`} />
                <InfoCard icon={MessageSquareText} label="Customer" value={status.data.booking.customer.name} />
                <InfoCard icon={MapPin} label="Status" value={status.data.booking.status.replaceAll("_", " ")} />
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-[8px] bg-white p-5 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel">Service</p>
                <h2 className="mt-2 text-2xl font-semibold">{status.data.booking.service.title}</h2>
                <p className="mt-2 text-3xl font-semibold text-pine">{money(status.data.booking.service.priceCents)}</p>
                {invoiceUrl ? (
                  <Link
                    href={invoiceUrl}
                    className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white hover:bg-ink"
                  >
                    View invoice
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : null}
              </div>

              <div className="rounded-[8px] bg-white p-5 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel">Next steps</p>
                <div className="mt-4 grid gap-3">
                  {status.data.nextSteps.map((step) => (
                    <div key={step} className="flex gap-3 rounded-[8px] bg-mist p-3 text-sm font-medium leading-6 text-steel">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pine" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {status.data.payment ? (
                <div className="rounded-[8px] bg-ink p-5 text-white shadow-soft">
                  <CreditCard className="h-6 w-6" />
                  <p className="mt-3 text-lg font-semibold">Payment {status.data.payment.status.toLowerCase()}</p>
                  <p className="mt-1 text-sm text-white/70">{money(status.data.payment.amountCents)}</p>
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-mist p-4">
      <Icon className="h-5 w-5 text-pine" />
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
