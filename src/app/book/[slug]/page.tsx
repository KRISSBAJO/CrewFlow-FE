"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { type CSSProperties, useMemo, useState } from "react";
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

function toInputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date(Date.now() + 24 * 60 * 60_000)));
  const [startTime, setStartTime] = useState("");
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
  const tenant = portal.data?.tenant;
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services],
  );
  const brandColor = normalizeBrandColor(tenant?.brandColor);
  const heroImage = tenant?.coverImageUrl ?? selectedService?.imageUrl ?? services.find((service) => service.imageUrl)?.imageUrl;
  const logoImage = tenant?.logoUrl;
  const serviceId = selectedService?.id ?? "";
  const availability = useQuery({
    queryKey: ["portal-availability", slug, serviceId, selectedDate],
    queryFn: () => api.portalAvailability(slug, serviceId, selectedDate),
    enabled: Boolean(serviceId && selectedDate),
  });
  const openSlots = (availability.data?.slots ?? []).filter((slot) => slot.available);

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
    Boolean(startTime || availability.data?.recommended?.startTime) &&
    !booking.isPending;

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!selectedService || !canSubmit) return;
    const selectedStart = startTime || availability.data?.recommended?.startTime;
    if (!selectedStart) return;
    booking.mutate({
      serviceId: selectedService.id,
      startTime: new Date(selectedStart).toISOString(),
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
    <main className="min-h-screen bg-[#f4f7f4] text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-[8px] border border-white/80 bg-white/88 p-3 shadow-soft backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-ink">
              <Image src={logoImage || "/images/logo.png"} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {tenant?.businessName ?? "CrewFlow booking"}
              </p>
              <p className="truncate text-sm text-steel">
                {tenant?.industry ?? "Customer booking portal"}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-semibold sm:flex" style={{ color: brandColor }}>
            <ShieldCheck className="h-4 w-4" />
            Secure request
          </div>
        </header>

        {portal.isLoading ? <LoadingState /> : null}
        {portal.isError ? <ErrorState message={portal.error.message} /> : null}

        {portal.data ? (
          <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-5">
              <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-ink shadow-soft">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,31,29,0.92)_0%,rgba(18,31,29,0.78)_48%,rgba(18,31,29,0.38)_100%)]" />
                <div className="relative z-10 flex min-h-[520px] flex-col justify-end p-6 text-white sm:p-8">
                  <div className="mb-6 flex w-fit items-center gap-2 rounded-[8px] border border-white/16 bg-white/12 px-3 py-2 text-sm font-semibold text-white/82 backdrop-blur">
                    <Sparkles className="h-4 w-4" style={{ color: brandColor }} />
                    Online booking
                  </div>
                  <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl">
                    Book {tenant?.businessName} in minutes.
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
                    Choose a service, pick an open slot, and send your request directly to the team.
                    You will receive confirmation and updates from the same operations flow.
                  </p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <TrustItem icon={MessageSquareText} label="Fast response" brandColor={brandColor} />
                    <TrustItem icon={CalendarDays} label="Clear schedule" brandColor={brandColor} />
                    <TrustItem icon={CreditCard} label="Online payment" brandColor={brandColor} />
                  </div>
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
                      brandColor={brandColor}
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
                      <label className="text-sm font-semibold text-steel">Preferred date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => {
                          setSelectedDate(event.target.value);
                          setStartTime("");
                        }}
                        className="h-12 rounded-[8px] border border-black/10 bg-mist px-4 text-base font-semibold outline-none focus:border-pine"
                      />
                      <div className="grid max-h-64 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                        {openSlots.slice(0, 12).map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setStartTime(slot.startTime)}
                            className={cn(
                              "rounded-[8px] border px-3 py-2 text-left text-sm font-semibold hover:border-pine hover:text-pine",
                              startTime === slot.startTime ? "text-white hover:text-white" : "border-black/10 text-steel"
                            )}
                            style={
                              startTime === slot.startTime
                                ? { backgroundColor: brandColor, borderColor: brandColor }
                                : undefined
                            }
                          >
                            {shortDate(slot.startTime)}
                            {slot.staffName ? <span className="mt-1 block text-xs opacity-75">{slot.staffName}</span> : null}
                          </button>
                        ))}
                      </div>
                      {availability.isLoading ? <p className="text-sm font-semibold text-steel">Finding open slots...</p> : null}
                      {!availability.isLoading && !openSlots.length ? (
                        <p className="rounded-[8px] bg-amber/20 p-3 text-sm font-semibold text-ink">
                          No open slots on this date. Try another day.
                        </p>
                      ) : null}
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
                        className="mt-1 h-5 w-5"
                        style={{ accentColor: brandColor }}
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
                      className="flex h-13 w-full items-center justify-center gap-2 rounded-[8px] px-5 py-4 text-base font-semibold text-white shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-steel/40"
                      style={!canSubmit ? undefined : { backgroundColor: brandColor }}
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

function TrustItem({
  icon: Icon,
  label,
  brandColor,
}: {
  icon: typeof CalendarDays;
  label: string;
  brandColor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-white/14 bg-white/12 p-4 text-sm font-semibold text-white/82 backdrop-blur">
      <Icon className="h-5 w-5" style={{ color: brandColor }} />
      {label}
    </div>
  );
}

function ServiceCard({
  service,
  active,
  brandColor,
  onClick,
}: {
  service: Service;
  active: boolean;
  brandColor: string;
  onClick: () => void;
}) {
  const activeStyle: CSSProperties | undefined = active
    ? { backgroundColor: brandColor, borderColor: brandColor }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-[8px] border text-left transition",
        active ? "text-white shadow-soft" : "border-black/10 bg-mist hover:shadow-soft",
      )}
      style={activeStyle}
    >
      <div className="relative h-36 bg-white/20">
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt="" fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/40">
            <Sparkles className="h-8 w-8" style={{ color: active ? "white" : brandColor }} />
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-[8px] bg-white px-3 py-1 text-sm font-semibold" style={{ color: brandColor }}>
          {money(service.priceCents)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold leading-tight">{service.title}</h3>
        <p className={cn("mt-3 line-clamp-2 text-sm leading-6", active ? "text-white/80" : "text-steel")}>
          {service.description ?? "Professional service with confirmation and customer updates."}
        </p>
        <div className={cn("mt-5 flex items-center gap-2 text-sm font-semibold", active ? "text-white" : "text-steel")}>
          <Clock className="h-4 w-4" />
          {service.durationMinutes} minutes
        </div>
      </div>
    </button>
  );
}

function normalizeBrandColor(value?: string | null) {
  if (value && /^#[0-9a-f]{6}$/i.test(value.trim())) return value.trim();
  return "#0f766e";
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
