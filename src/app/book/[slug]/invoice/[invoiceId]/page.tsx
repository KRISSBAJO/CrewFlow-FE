"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn, money, shortDate } from "@/lib/utils";

export default function PublicInvoicePage() {
  const params = useParams<{ slug: string; invoiceId: string }>();
  const invoice = useQuery({
    queryKey: ["portal-invoice", params.slug, params.invoiceId],
    queryFn: () => api.portalInvoice(params.slug, params.invoiceId),
  });

  const paid = invoice.data?.invoice.status === "PAID";

  return (
    <main className="min-h-screen bg-mist px-5 py-6 text-ink sm:px-8">
      <section className="mx-auto grid w-full max-w-5xl gap-5">
        <header className="flex items-center justify-between rounded-[8px] border border-white bg-white p-4 shadow-soft">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/images/logo.png" alt="CrewFlow" width={44} height={44} className="rounded-[8px]" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{invoice.data?.tenant.businessName ?? "Invoice"}</p>
              <p className="truncate text-sm text-steel">Secure customer invoice</p>
            </div>
          </div>
          <Link href={`/book/${params.slug}`} className="hidden rounded-[8px] bg-mist px-4 py-2 text-sm font-semibold text-pine sm:block">
            New booking
          </Link>
        </header>

        {invoice.isLoading ? (
          <div className="grid min-h-[420px] place-items-center rounded-[8px] bg-white shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-pine" />
          </div>
        ) : null}

        {invoice.isError ? (
          <div className="rounded-[8px] border border-red-100 bg-red-50 p-6 text-red-800">
            <p className="text-xl font-semibold">Invoice unavailable</p>
            <p className="mt-2 text-sm">{invoice.error.message}</p>
          </div>
        ) : null}

        {invoice.data ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-[8px] bg-white p-6 shadow-soft sm:p-8">
              <Link href={`/book/${params.slug}/success?bookingId=${invoice.data.invoice.booking?.id ?? ""}`} className="inline-flex items-center gap-2 text-sm font-semibold text-pine">
                <ArrowLeft className="h-4 w-4" />
                Booking status
              </Link>
              <div className="mt-6 flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel">Invoice</p>
                  <h1 className="mt-2 text-4xl font-semibold">{invoice.data.invoice.invoiceNo}</h1>
                  <p className="mt-2 text-steel">Due {shortDate(invoice.data.invoice.dueDate)}</p>
                </div>
                <span className={cn("rounded-full px-4 py-2 text-sm font-semibold", paid ? "bg-mint/20 text-pine" : "bg-amber/20 text-ink")}>
                  {invoice.data.invoice.status}
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {(invoice.data.invoice.lineItems ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-[8px] bg-mist p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.description}</p>
                      <p className="mt-1 text-sm text-steel">{item.quantity} x {money(item.unitCents)}</p>
                    </div>
                    <p className="font-semibold">{money(item.totalCents)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 border-t border-black/10 pt-6">
                <TotalRow label="Subtotal" value={money(invoice.data.invoice.subtotalCents ?? invoice.data.invoice.totalCents)} />
                <TotalRow label="Tax" value={money(invoice.data.invoice.taxCents ?? 0)} />
                <TotalRow label="Total" value={money(invoice.data.invoice.totalCents)} strong />
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-[8px] bg-white p-5 shadow-soft">
                <CreditCard className="h-7 w-7 text-pine" />
                <h2 className="mt-4 text-2xl font-semibold">{paid ? "Payment complete" : "Pay online"}</h2>
                <p className="mt-2 text-sm leading-6 text-steel">
                  {paid ? "This invoice is marked paid." : "Use the checkout link to complete payment securely."}
                </p>
                {paid ? (
                  <div className="mt-5 flex items-center gap-2 rounded-[8px] bg-mint/20 p-3 text-sm font-semibold text-pine">
                    <CheckCircle2 className="h-4 w-4" />
                    Paid
                  </div>
                ) : invoice.data.checkoutUrl ? (
                  <a
                    href={invoice.data.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white hover:bg-ink"
                  >
                    Pay {money(invoice.data.invoice.totalCents)}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                ) : null}
              </div>

              <div className="rounded-[8px] bg-ink p-5 text-white shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Customer</p>
                <p className="mt-2 text-xl font-semibold">{invoice.data.invoice.customer.name}</p>
                <p className="mt-1 text-sm text-white/70">{invoice.data.invoice.customer.phone}</p>
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between text-sm", strong && "text-xl font-semibold")}>
      <span className={cn(strong ? "text-ink" : "text-steel")}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
