"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, Clock3, MessageSquareText, Phone, Sparkles, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

const industries = ["Cleaning", "Home services", "HVAC", "Mobile detailing", "Handyman", "Caregiving"];
const steps = ["Business", "Services", "Team", "Automation"];

export function ConversionSection() {
  const router = useRouter();
  const setSession = useAuth((state) => state.setSession);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    industry: "Cleaning",
    services: "Standard cleaning, deep cleaning, move-out cleaning",
    staffCount: "3-10",
    whatsapp: "",
    biggestProblem: "Missed inquiries and follow-up"
  });

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const validation = validateStep(step, form);
    if (validation) {
      setError(validation);
      return;
    }

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.register({
        businessName: form.businessName,
        industry: form.industry,
        ownerName: form.name,
        phone: form.phone || undefined,
        email: form.email,
        password: form.password,
        services: splitServices(form.services),
        staffCount: form.staffCount || undefined,
        whatsappNumber: form.whatsapp || undefined,
        biggestProblem: form.biggestProblem || undefined
      });
      setSession(response.accessToken, response.user);
      setSubmitted(true);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="setup" className="bg-ink px-5 py-16 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Start setup</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Turn the demo into a configured business.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/72">
            Capture the details needed to configure services, staff, WhatsApp follow-up, invoices,
            and the first operating workflow.
          </p>
          <div className="mt-8 grid gap-3">
            <SetupSignal icon={MessageSquareText} title="Lead capture" body="Get owner contact and operating pain." />
            <SetupSignal icon={Building2} title="Tenant setup" body="Collect business, industry, services, and team shape." />
            <SetupSignal icon={Sparkles} title="Automation plan" body="Identify reminders, missed follow-up, and invoice recovery." />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[8px] border border-white/10 bg-white p-5 text-ink shadow-soft md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-pine">Workspace setup</p>
              <h3 className="text-2xl font-semibold">Create your operations workspace</h3>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] bg-mist px-3 py-2 text-sm font-semibold text-steel">
              <Clock3 className="h-4 w-4 text-pine" />
              5 minute intake
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-steel">
              <span>{steps[step]}</span>
              <span>{step + 1}/{steps.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {submitted ? (
            <div className="rounded-[8px] bg-mist p-5">
              <CheckCircle2 className="h-8 w-8 text-pine" />
              <h4 className="mt-4 text-xl font-semibold">Setup profile captured.</h4>
              <p className="mt-2 leading-7 text-steel">
                Your tenant, owner account, starter services, automation defaults, and onboarding
                profile are ready.
              </p>
              <Link
                href="/app"
                className="mt-5 flex h-11 w-fit items-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white"
              >
                Open console
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Name" value={form.name} onChange={(value) => update("name", value)} />
                  <TextField label="Email" value={form.email} onChange={(value) => update("email", value)} />
                  <TextField label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
                  <TextField
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(value) => update("password", value)}
                  />
                  <TextField label="Business name" value={form.businessName} onChange={(value) => update("businessName", value)} />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-ink">Industry</span>
                    <select
                      value={form.industry}
                      onChange={(event) => update("industry", event.target.value)}
                      className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
                    >
                      {industries.map((industry) => (
                        <option key={industry}>{industry}</option>
                      ))}
                    </select>
                  </label>
                  <TextArea label="Services" value={form.services} onChange={(value) => update("services", value)} />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Staff count" value={form.staffCount} onChange={(value) => update("staffCount", value)} />
                  <TextField label="WhatsApp number" value={form.whatsapp} onChange={(value) => update("whatsapp", value)} />
                </div>
              ) : null}

              {step === 3 ? (
                <TextArea
                  label="Biggest operational problem"
                  value={form.biggestProblem}
                  onChange={(value) => update("biggestProblem", value)}
                />
              ) : null}

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                {error ? (
                  <p className="basis-full rounded-[8px] bg-coral/10 px-3 py-2 text-sm font-medium text-coral">
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0 || isSubmitting}
                  className="h-11 rounded-[8px] bg-mist px-4 font-semibold text-ink disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  disabled={isSubmitting}
                  className="flex h-11 items-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-60"
                >
                  {isSubmitting ? "Creating workspace..." : step === steps.length - 1 ? "Create workspace" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function SetupSignal({
  icon: Icon,
  title,
  body
}: {
  icon: typeof Phone;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-[8px] border border-white/10 bg-white/6 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-mint text-ink">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/64">{body}</p>
      </div>
    </div>
  );
}

function TextField({
  label,
  type = "text",
  value,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
      />
    </label>
  );
}

function splitServices(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateStep(
  step: number,
  form: {
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    industry: string;
    services: string;
    staffCount: string;
    whatsapp: string;
    biggestProblem: string;
  }
) {
  if (step === 0) {
    if (!form.name.trim()) return "Enter your name.";
    if (!form.businessName.trim()) return "Enter your business name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
  }
  if (step === 1 && !form.services.trim()) return "Add at least one service.";
  if (step === 3 && !form.biggestProblem.trim()) return "Tell us the biggest operational problem.";
  return "";
}

function TextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
      />
    </label>
  );
}
