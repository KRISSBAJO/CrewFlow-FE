"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api, type PublicBookingInput, type Service } from "@/lib/api";
import { cn, money, shortDate } from "@/lib/utils";

const quickTimes = [
  { label: "Tomorrow morning", days: 1, hour: 9 },
  { label: "Tomorrow afternoon", days: 1, hour: 14 },
  { label: "This weekend", days: 6, hour: 10 },
];

function nextSlot(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return toInputDateTime(date);
}

function toInputDateTime(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [startTime, setStartTime] = useState(() => nextSlot(1, 9));
  const [payNow, setPayNow] = useState(true);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const portal = useQuery({
    queryKey: ["portal", slug],
    queryFn: () => api.portal(slug),
  });

  const services = useMemo(() => portal.data?.services ?? [], [portal.data?.services]);
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services],
  );

  const booking = useMutation({
    mutationFn: (input: PublicBookingInput) => api.createPortalBooking(slug, input),
    onSuccess: (data) => {
      router.push(data.links?.successPath ?? `/book/${slug}/success?bookingId=${data.booking.id}`);
    },
  });

  const canSubmit =
    Boolean(selectedService) &&
    form.customerName.trim().length > 1 &&
    form.phone.trim().length > 6 &&
    Boolean(startTime) &&
    !booking.isPending;

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!selectedService || !canSubmit) return;
    booking.mutate({
      serviceId: selectedService.id,
      startTime: new Date(startTime).toISOString(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      payNow,
    });
  }

  const checkoutUrl = booking.data?.invoice?.paymentUrl ?? booking.data?.payment?.checkoutUrl;

  return (
    <main className="min-h-screen bg-mist text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-[8px] border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/images/logo.png" alt="CrewFlow" width={44} height={44} className="rounded-[8px]" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {portal.data?.tenant.businessName ?? "CrewFlow booking"}
              </p>
              <p className="truncate text-sm text-steel">
                {portal.data?.tenant.industry ?? "Customer booking portal"}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-semibold text-pine sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Secure request
          </div>
        </header>

        {portal.isLoading ? <LoadingState /> : null}
        {portal.isError ? <ErrorState message={portal.error.message} /> : null}

        {portal.data ? (
          <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-5">
              <div className="rounded-[8px] border border-white bg-white p-6 shadow-soft sm:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-pine">
                  <Sparkles className="h-4 w-4" />
                  Book online
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                  Choose a service and lock in your appointment.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-steel">
                  {portal.data.tenant.businessName} will receive your request instantly, confirm the details, and send updates through the same operational flow.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <TrustItem icon={MessageSquareText} label="Fast response" />
                  <TrustItem icon={CalendarDays} label="Clear schedule" />
                  <TrustItem icon={CreditCard} label="Online payment" />
                </div>
              </div>

              <div className="rounded-[8px] border border-white bg-white p-5 shadow-soft sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Services</h2>
                    <p className="mt-1 text-sm text-steel">{services.length} available options</p>
                  </div>
                  <StatusPill label={selectedService ? money(selectedService.priceCents) : "Select"} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      active={selectedService?.id === service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <aside className="lg:sticky lg:top-5 lg:self-start">
              <div className="rounded-[8px] border border-white bg-white p-5 shadow-soft sm:p-6">
                {booking.isSuccess ? (
                  <Confirmation
                    service={booking.data.booking.service}
                    startTime={booking.data.booking.startTime}
                    checkoutUrl={checkoutUrl}
                    invoiceNo={booking.data.invoice?.invoiceNo}
                  />
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-semibold">Your appointment</h2>
                      <p className="mt-1 text-sm text-steel">
                        {selectedService ? `${selectedService.title} · ${money(selectedService.priceCents)}` : "Select a service"}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-steel">Preferred time</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                        className="h-12 rounded-[8px] border border-black/10 bg-mist px-4 text-base font-semibold outline-none focus:border-pine"
                      />
                      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {quickTimes.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setStartTime(nextSlot(item.days, item.hour))}
                            className="rounded-[8px] border border-black/10 px-3 py-2 text-left text-sm font-semibold text-steel hover:border-pine hover:text-pine"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <TextInput label="Name" value={form.customerName} onChange={(value) => updateForm("customerName", value)} />
                      <TextInput label="Phone" value={form.phone} onChange={(value) => updateForm("phone", value)} />
                      <TextInput label="Email" type="email" value={form.email} onChange={(value) => updateForm("email", value)} />
                      <TextInput label="Service address" value={form.address} onChange={(value) => updateForm("address", value)} />
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-steel">Notes</span>
                        <textarea
                          value={form.notes}
                          onChange={(event) => updateForm("notes", event.target.value)}
                          rows={4}
                          className="resize-none rounded-[8px] border border-black/10 bg-mist px-4 py-3 text-base outline-none focus:border-pine"
                          placeholder="Apartment access, bedrooms, pets, urgency..."
                        />
                      </label>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-black/10 bg-mist p-4">
                      <input
                        type="checkbox"
                        checked={payNow}
                        onChange={(event) => setPayNow(event.target.checked)}
                        className="mt-1 h-5 w-5 accent-pine"
                      />
                      <span>
                        <span className="block font-semibold">Create payment link</span>
                        <span className="mt-1 block text-sm leading-6 text-steel">
                          Generate an invoice checkout link after booking.
                        </span>
                      </span>
                    </label>

                    {booking.isError ? <p className="rounded-[8px] bg-red-50 p-3 text-sm font-semibold text-red-700">{booking.error.message}</p> : null}

                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={submit}
                      className="flex h-13 w-full items-center justify-center gap-2 rounded-[8px] bg-pine px-5 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-steel/40"
                    >
                      {booking.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                      Book appointment
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="mt-5 grid flex-1 place-items-center rounded-[8px] border border-white bg-white/80 p-10 shadow-soft">
      <Loader2 className="h-8 w-8 animate-spin text-pine" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-[8px] border border-red-200 bg-red-50 p-6 text-red-800">
      <p className="text-xl font-semibold">Booking page unavailable</p>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-mist p-4 text-sm font-semibold text-steel">
      <Icon className="h-5 w-5 text-pine" />
      {label}
    </div>
  );
}

function ServiceCard({ service, active, onClick }: { service: Service; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[168px] rounded-[8px] border p-5 text-left transition",
        active ? "border-pine bg-pine text-white shadow-soft" : "border-black/10 bg-mist hover:border-pine",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold leading-tight">{service.title}</h3>
        <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", active ? "bg-white text-pine" : "bg-white text-pine")}>
          {money(service.priceCents)}
        </span>
      </div>
      <p className={cn("mt-3 line-clamp-2 text-sm leading-6", active ? "text-white/80" : "text-steel")}>
        {service.description ?? "Professional service with confirmation and customer updates."}
      </p>
      <div className={cn("mt-5 flex items-center gap-2 text-sm font-semibold", active ? "text-white" : "text-steel")}>
        <Clock className="h-4 w-4" />
        {service.durationMinutes} minutes
      </div>
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-steel">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[8px] border border-black/10 bg-mist px-4 text-base outline-none focus:border-pine"
      />
    </label>
  );
}

function StatusPill({ label }: { label: string }) {
  return <span className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-pine">{label}</span>;
}

function Confirmation({
  service,
  startTime,
  checkoutUrl,
  invoiceNo,
}: {
  service: Service;
  startTime: string;
  checkoutUrl?: string | null;
  invoiceNo?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[8px] bg-pine p-5 text-white">
        <CheckCircle2 className="h-10 w-10" />
        <h2 className="mt-4 text-2xl font-semibold">Booking received</h2>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Your appointment is now in the operations queue.
        </p>
      </div>
      <div className="grid gap-3">
        <SummaryRow icon={CalendarDays} label={service.title} value={shortDate(startTime)} />
        <SummaryRow icon={Clock} label="Duration" value={`${service.durationMinutes} minutes`} />
        <SummaryRow icon={MapPin} label="Invoice" value={invoiceNo ?? "Created after confirmation"} />
      </div>
      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 py-4 font-semibold text-white hover:bg-pine"
        >
          Pay invoice
          <ArrowRight className="h-5 w-5" />
        </a>
      ) : null}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-mist p-4">
      <Icon className="h-5 w-5 text-pine" />
      <div className="min-w-0">
        <p className="truncate font-semibold">{label}</p>
        <p className="truncate text-sm text-steel">{value}</p>
      </div>
    </div>
  );
}
