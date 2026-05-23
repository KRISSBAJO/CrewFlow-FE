"use client";

import {
  AlertTriangle,
  Banknote,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Headphones,
  HeartPulse,
  Inbox,
  Loader2,
  LogOut,
  MessageSquareText,
  Play,
  Plus,
  RefreshCw,
  Route,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
  Wrench,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import {
  api,
  Booking,
  Conversation,
  DashboardSummary,
  Invoice,
  OnboardingProfile,
  OperationalAction,
  Payment,
  StaffMember,
  TenantProfile
} from "@/lib/api";
import { cn, initials, money, shortDate } from "@/lib/utils";
import { useAuth } from "@/store/auth";

const nav = [
  { id: "overview", label: "Overview", icon: HeartPulse },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "field", label: "Field", icon: Route },
  { id: "money", label: "Money", icon: CreditCard },
  { id: "actions", label: "Actions", icon: ClipboardCheck },
  { id: "settings", label: "Settings", icon: Settings2 }
] as const;

type View = (typeof nav)[number]["id"];
type DrawerState =
  | { type: "booking"; item: Booking }
  | { type: "field-job"; item: Booking }
  | { type: "conversation"; item: Conversation }
  | { type: "invoice"; item: Invoice }
  | { type: "action"; item: OperationalAction }
  | { type: "new-booking" }
  | null;

export default function Home() {
  const token = useAuth((state) => state.token);
  return token ? <Console /> : <Login />;
}

function Login() {
  const setSession = useAuth((state) => state.setSession);
  const [email, setEmail] = useState("owner@sparkle.test");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");

  const login = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (data) => setSession(data.accessToken, data.user),
    onError: (err) => setError(err instanceof Error ? err.message : "Login failed")
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    login.mutate();
  }

  return (
    <main className="min-h-screen px-5 py-6 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">
                CrewFlow
              </p>
              <p className="text-sm text-steel">Operations command center</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <h1 className="text-5xl font-semibold leading-[1.02] text-ink md:text-7xl">
              Run today before it runs you.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-steel">
              Bookings, inbox, field work, invoices, and revenue-risk actions in one focused console.
            </p>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            <Signal icon={Headphones} label="Missed leads" value="Inbox" />
            <Signal icon={Route} label="Crew status" value="Live jobs" />
            <Signal icon={Banknote} label="Cash leaks" value="Actions" />
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[8px] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur md:p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Sign in</h2>
              <p className="mt-1 text-sm text-steel">Sparkle Home Services</p>
            </div>
            <ShieldCheck className="h-6 w-6 text-pine" />
          </div>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-ink">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-ink/10 bg-mist px-4 outline-none transition focus:border-pine"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-ink/10 bg-mist px-4 outline-none transition focus:border-pine"
            />
          </label>
          {error ? (
            <p className="mt-4 rounded-[8px] bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          ) : null}
          <button
            disabled={login.isPending}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white shadow-soft transition hover:bg-ink disabled:opacity-60"
          >
            {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

function Console() {
  const [view, setView] = useState<View>("overview");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const inbox = useQuery({ queryKey: ["inbox"], queryFn: api.inbox });
  const actions = useQuery({ queryKey: ["actions"], queryFn: api.actions });
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: api.bookings });
  const field = useQuery({ queryKey: ["field"], queryFn: api.fieldJobs });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: api.invoices });
  const payments = useQuery({ queryKey: ["payments"], queryFn: api.payments });
  const health = useQuery({ queryKey: ["health"], queryFn: api.health });
  const tenant = useQuery({ queryKey: ["tenant"], queryFn: api.tenant });
  const onboarding = useQuery({ queryKey: ["onboarding"], queryFn: api.onboarding });
  const customers = useQuery({ queryKey: ["customers"], queryFn: api.customers });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });

  const refreshAll = () => {
    void queryClient.invalidateQueries();
  };

  return (
    <main className="min-h-screen p-3 md:p-5">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <aside className="hidden w-64 shrink-0 rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur lg:block">
          <div className="mb-8 flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-semibold text-ink">CrewFlow</p>
              <p className="text-xs text-steel">Operations OS</p>
            </div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-left text-sm font-medium transition",
                  view === item.id
                    ? "bg-pine text-white"
                    : "text-steel hover:bg-mist hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-[8px] bg-mist p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-steel">API</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", health.data?.status === "ok" ? "bg-mint" : "bg-amber")} />
              <span className="text-sm font-medium text-ink">{health.data?.database ?? "checking"}</span>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-4 rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-steel">
                  {tenant.data?.businessName ?? "Sparkle Home Services"}
                </p>
                <h1 className="text-2xl font-semibold text-ink md:text-3xl">
                  {titleFor(view)}
                </h1>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={refreshAll}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-mist text-ink transition hover:bg-pine hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <div className="flex shrink-0 items-center gap-2 rounded-[8px] bg-mist py-1 pl-1 pr-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-pine text-xs font-bold text-white">
                    {initials(user?.email)}
                  </div>
                  <span className="text-sm font-medium text-ink">{user?.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-ink text-white transition hover:bg-coral"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {nav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-sm font-medium",
                    view === item.id ? "bg-pine text-white" : "bg-mist text-steel"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {view === "overview" ? (
                <Overview
                  data={dashboard.data}
                  actions={actions.data}
                  customers={customers.data}
                  services={services.data}
                  staff={staff.data}
                  onboarding={onboarding.data}
                  tenant={tenant.data}
                  loading={dashboard.isLoading}
                  onOpen={setDrawer}
                  onView={setView}
                />
              ) : null}
              {view === "inbox" ? <InboxView items={inbox.data} onOpen={setDrawer} /> : null}
              {view === "bookings" ? <BookingsView items={bookings.data} onOpen={setDrawer} /> : null}
              {view === "field" ? <FieldView items={field.data} onOpen={setDrawer} /> : null}
              {view === "money" ? <MoneyView invoices={invoices.data} payments={payments.data} onOpen={setDrawer} /> : null}
              {view === "actions" ? <ActionsView items={actions.data} onOpen={setDrawer} /> : null}
              {view === "settings" ? <SettingsView tenant={tenant.data} onboarding={onboarding.data} /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      <DetailDrawer state={drawer} onClose={() => setDrawer(null)} />
    </main>
  );
}

function Overview({
  data,
  actions,
  customers,
  services,
  staff,
  onboarding,
  tenant,
  loading,
  onOpen,
  onView
}: {
  data?: DashboardSummary;
  actions?: OperationalAction[];
  customers?: unknown[];
  services?: unknown[];
  staff?: unknown[];
  onboarding?: OnboardingProfile;
  tenant?: TenantProfile;
  loading: boolean;
  onOpen: (state: DrawerState) => void;
  onView: (view: View) => void;
}) {
  if (loading) return <LoadingPanel />;
  return (
    <div className="grid gap-4">
      <SetupChecklist
        customers={customers?.length ?? 0}
        services={services?.length ?? 0}
        staff={staff?.length ?? 0}
        bookings={data?.today.appointments.length ?? 0}
        onboarding={onboarding}
        tenant={tenant}
        onOpen={onOpen}
        onView={onView}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Today" value={data?.today.appointments.length ?? 0} tone="pine" />
        <Metric icon={Banknote} label="Paid revenue" value={money(data?.revenue.paidTotalCents)} tone="mint" />
        <Metric icon={AlertTriangle} label="At risk" value={money(data?.revenue.atRiskTotalCents)} tone="coral" />
        <Metric icon={UsersRound} label="Active crew" value={data?.activeStaff ?? 0} tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Revenue-risk alerts" icon={AlertTriangle}>
          <div className="grid gap-3">
            {data?.operations.alerts.map((alert) => (
              <div key={alert.key} className="flex items-center justify-between rounded-[8px] bg-mist p-3">
                <div>
                  <p className="font-medium text-ink">{alert.title}</p>
                  <p className="text-sm text-steel">{alert.value ?? (alert.amountCents ? money(alert.amountCents) : "Clear")}</p>
                </div>
                <Severity severity={alert.severity} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Manager queue" icon={ClipboardCheck}>
          <ActionList items={actions?.slice(0, 5)} onOpen={onOpen} />
        </Panel>
      </div>

      <Panel title="Today’s appointments" icon={Clock3}>
        <BookingRows items={data?.today.appointments} onOpen={onOpen} />
      </Panel>
    </div>
  );
}

function InboxView({ items, onOpen }: { items?: Conversation[]; onOpen: (state: DrawerState) => void }) {
  return (
    <Panel title="Customer inbox" icon={MessageSquareText}>
      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <Row key={item.id} onClick={() => onOpen({ type: "conversation", item })}>
            <Avatar name={item.customer?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{item.customer?.name ?? "New inquiry"}</p>
              <p className="truncate text-sm text-steel">{item.messages?.[0]?.content ?? item.channel}</p>
            </div>
            <Status label={item.status} />
            <p className="hidden text-sm text-steel md:block">{shortDate(item.lastMessageAt)}</p>
          </Row>
        ))}
        <Empty show={!items?.length} label="No active conversations" />
      </div>
    </Panel>
  );
}

function BookingsView({ items, onOpen }: { items?: Booking[]; onOpen: (state: DrawerState) => void }) {
  return (
    <Panel
      title="Booking board"
      icon={CalendarDays}
      action={
        <button onClick={() => onOpen({ type: "new-booking" })} className="flex h-9 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          New
        </button>
      }
    >
      <BookingRows items={items} onOpen={onOpen} />
    </Panel>
  );
}

function SetupChecklist({
  customers,
  services,
  staff,
  bookings,
  onboarding,
  tenant,
  onOpen,
  onView
}: {
  customers: number;
  services: number;
  staff: number;
  bookings: number;
  onboarding?: OnboardingProfile;
  tenant?: TenantProfile;
  onOpen: (state: DrawerState) => void;
  onView: (view: View) => void;
}) {
  const completedSteps = new Set(tenant?.onboardingProfile?.completedSteps ?? []);
  const whatsappReady =
    Boolean(onboarding?.whatsappNumber) ||
    completedSteps.has("whatsappPlanned") ||
    tenant?.onboardingProfile?.setupStatus === "READY";
  const items = [
    {
      label: "Business profile ready",
      detail: tenant ? `${tenant.businessName} · ${tenant.industry}` : "Tenant profile is active.",
      done: Boolean(tenant),
      icon: Building2,
      action: "Review",
      onClick: () => onView("settings")
    },
    {
      label: "Services loaded",
      detail: services ? `${services} services available` : "Add your first service catalog",
      done: services > 0,
      icon: Settings2,
      action: "Services",
      onClick: () => onView("settings")
    },
    {
      label: "Staff added",
      detail: staff ? `${staff} team members ready` : "Invite managers and field staff",
      done: staff > 0,
      icon: UsersRound,
      action: "Staff",
      onClick: () => onView("settings")
    },
    {
      label: "First booking created",
      detail: bookings ? `${bookings} appointments today` : "Create a booking to prove the flow",
      done: bookings > 0,
      icon: CalendarDays,
      action: "Create",
      onClick: () => onOpen({ type: "new-booking" })
    },
    {
      label: "Customer list started",
      detail: customers ? `${customers} customers in the system` : "Import or add customer records",
      done: customers > 0,
      icon: UsersRound,
      action: "Bookings",
      onClick: () => onView("bookings")
    },
    {
      label: "WhatsApp automation planned",
      detail: onboarding?.whatsappNumber
        ? `Automation number: ${onboarding.whatsappNumber}`
        : "Connect reminders, on-the-way texts, invoice nudges, and review requests.",
      done: whatsappReady,
      icon: MessageSquareText,
      action: "Settings",
      onClick: () => onView("settings")
    }
  ];
  const completed = items.filter((item) => item.done).length;

  return (
    <section className="overflow-hidden rounded-[8px] border border-white/80 bg-ink text-white shadow-soft">
      <div className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">First-run setup</p>
          <h2 className="mt-3 text-2xl font-semibold">Get the tenant revenue-ready.</h2>
          <p className="mt-3 leading-7 text-white/68">
            This checklist keeps onboarding focused on the operating pieces that make a business pay:
            services, staff, bookings, customers, and automation.
          </p>
          {onboarding?.biggestProblem ? (
            <p className="mt-3 rounded-[8px] bg-white/8 p-3 text-sm leading-6 text-white/72">
              Priority: {onboarding.biggestProblem}
            </p>
          ) : null}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>{completed} of {items.length} complete</span>
              <span>{Math.round((completed / items.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-mint" style={{ width: `${(completed / items.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex min-h-[104px] gap-3 rounded-[8px] bg-white p-3 text-left text-ink transition hover:bg-mint"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]", item.done ? "bg-pine text-white" : "bg-mist text-pine")}>
                {item.done ? <CheckCircle2 className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{item.label}</p>
                  <span className="rounded-[8px] bg-mist px-2 py-1 text-xs font-bold text-steel">{item.action}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-steel">{item.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FieldView({ items, onOpen }: { items?: Booking[]; onOpen: (state: DrawerState) => void }) {
  const queryClient = useQueryClient();
  const complete = useMutation({
    mutationFn: (bookingId: string) =>
      api.completeFieldJob(bookingId, {
        checklist: [
          { label: "Arrived on site", done: true },
          { label: "Service completed", done: true },
          { label: "Customer notified", done: true },
          { label: "Invoice ready", done: true }
        ],
        staffNotes: "Completed from field board quick action.",
        autoInvoice: true
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  return (
    <Panel title="Field jobs" icon={Route}>
      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <Row key={item.id} onClick={() => onOpen({ type: "field-job", item })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-mist text-pine">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{item.service.title}</p>
              <p className="truncate text-sm text-steel">
                {item.customer.name} · {shortDate(item.startTime)}
              </p>
            </div>
            <Status label={item.status} />
            {item.fieldJobReport?.status ? <Status label={item.fieldJobReport.status} /> : null}
            {item.status !== "COMPLETED" ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  complete.mutate(item.id);
                }}
                className="flex h-9 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </button>
            ) : null}
          </Row>
        ))}
        <Empty show={!items?.length} label="No field jobs today" />
      </div>
    </Panel>
  );
}

function MoneyView({
  invoices,
  payments,
  onOpen
}: {
  invoices?: Invoice[];
  payments?: Payment[];
  onOpen: (state: DrawerState) => void;
}) {
  const openInvoices = useMemo(
    () => (invoices ?? []).filter((invoice) => invoice.status !== "PAID"),
    [invoices]
  );
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Invoices" icon={CreditCard}>
        <div className="grid gap-3">
          {openInvoices.map((invoice) => (
            <Row key={invoice.id} onClick={() => onOpen({ type: "invoice", item: invoice })}>
              <div className="flex-1">
                <p className="font-semibold text-ink">{invoice.invoiceNo}</p>
                <p className="text-sm text-steel">{invoice.customer.name} · due {shortDate(invoice.dueDate)}</p>
              </div>
              <p className="font-semibold text-ink">{money(invoice.totalCents)}</p>
              <Status label={invoice.status} />
            </Row>
          ))}
          <Empty show={!openInvoices.length} label="No open invoices" />
        </div>
      </Panel>
      <Panel title="Payments" icon={Banknote}>
        <div className="grid gap-3">
          {(payments ?? []).slice(0, 8).map((payment) => (
            <Row key={payment.id}>
              <div className="flex-1">
                <p className="font-semibold text-ink">{payment.invoice.invoiceNo}</p>
                <p className="text-sm text-steel">{payment.provider}</p>
              </div>
              <p className="font-semibold text-ink">{money(payment.amountCents)}</p>
              <Status label={payment.status} />
            </Row>
          ))}
          <Empty show={!payments?.length} label="No payments yet" />
        </div>
      </Panel>
    </div>
  );
}

function SettingsView({
  tenant,
  onboarding
}: {
  tenant?: TenantProfile;
  onboarding?: OnboardingProfile;
}) {
  if (!tenant) return <LoadingPanel />;

  return <SettingsForm key={`${tenant.id}-${onboarding?.updatedAt ?? "new"}`} tenant={tenant} onboarding={onboarding} />;
}

function SettingsForm({
  tenant,
  onboarding
}: {
  tenant: TenantProfile;
  onboarding?: OnboardingProfile;
}) {
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState(tenant.businessName);
  const [industry, setIndustry] = useState(tenant.industry);
  const [serviceArea, setServiceArea] = useState(tenant.receptionistConfig?.serviceArea ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(onboarding?.whatsappNumber ?? "");
  const [staffCount, setStaffCount] = useState(onboarding?.staffCount ?? "");
  const [biggestProblem, setBiggestProblem] = useState(onboarding?.biggestProblem ?? "");
  const [weekdayHours, setWeekdayHours] = useState(
    tenant.receptionistConfig?.businessHours?.monday ?? "8:00 AM - 5:00 PM"
  );
  const [saturdayHours, setSaturdayHours] = useState(
    tenant.receptionistConfig?.businessHours?.saturday ?? "Closed"
  );
  const [whatsappPlanned, setWhatsappPlanned] = useState(Boolean(onboarding?.whatsappNumber));

  const save = useMutation({
    mutationFn: () =>
      api.updateTenant({
        businessName,
        industry,
        serviceArea,
        whatsappNumber,
        staffCount,
        biggestProblem,
        whatsappPlanned,
        completedSteps: [
          "businessProfile",
          "operatingDetails",
          ...(whatsappPlanned || whatsappNumber ? ["whatsappPlanned"] : []),
          ...(staffCount ? ["staffPlan"] : [])
        ],
        businessHours: {
          monday: weekdayHours,
          tuesday: weekdayHours,
          wednesday: weekdayHours,
          thursday: weekdayHours,
          friday: weekdayHours,
          saturday: saturdayHours,
          sunday: "Closed"
        }
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    }
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <Panel title="Tenant settings" icon={Settings2}>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Business name" value={businessName} onChange={setBusinessName} />
          <InputField label="Industry" value={industry} onChange={setIndustry} />
          <InputField label="Service area" value={serviceArea} onChange={setServiceArea} />
          <InputField label="WhatsApp number" value={whatsappNumber} onChange={setWhatsappNumber} />
          <InputField label="Staff plan" value={staffCount} onChange={setStaffCount} />
          <InputField label="Weekday hours" value={weekdayHours} onChange={setWeekdayHours} />
          <InputField label="Saturday hours" value={saturdayHours} onChange={setSaturdayHours} />
          <label className="flex min-h-11 items-center gap-3 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={whatsappPlanned}
              onChange={(event) => setWhatsappPlanned(event.target.checked)}
              className="h-5 w-5 accent-pine"
            />
            WhatsApp automation planned
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-ink">Biggest operational problem</span>
          <textarea
            value={biggestProblem}
            onChange={(event) => setBiggestProblem(event.target.value)}
            className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
          />
        </label>
        {save.error ? <ErrorText error={save.error} /> : null}
        {save.isSuccess ? (
          <p className="mt-3 rounded-[8px] bg-mint/30 px-3 py-2 text-sm font-semibold text-ink">
            Settings saved. Setup progress updated.
          </p>
        ) : null}
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !businessName || !industry}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </Panel>

      <Panel title="Setup readiness" icon={ClipboardCheck}>
        <div className="grid gap-3">
          <ReadinessRow label="Business profile" done={Boolean(tenant?.businessName && tenant?.industry)} />
          <ReadinessRow label="Operating area" done={Boolean(serviceArea)} />
          <ReadinessRow label="Business hours" done={Boolean(weekdayHours)} />
          <ReadinessRow label="WhatsApp plan" done={Boolean(whatsappNumber || whatsappPlanned)} />
          <ReadinessRow label="Staff plan" done={Boolean(staffCount)} />
        </div>
        <div className="mt-4 rounded-[8px] bg-mist p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Status</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {tenant?.onboardingProfile?.setupStatus ?? onboarding?.setupStatus ?? "IN_PROGRESS"}
          </p>
          <p className="mt-2 text-sm leading-6 text-steel">
            Settings here drive the first-run checklist and give the AI receptionist the business context it needs.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function InputField({
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
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
      />
    </label>
  );
}

function ReadinessRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-mist p-3">
      <p className="font-medium text-ink">{label}</p>
      <span className={cn("rounded-[8px] px-2.5 py-1 text-xs font-bold", done ? "bg-mint text-ink" : "bg-white text-steel")}>
        {done ? "Ready" : "Needed"}
      </span>
    </div>
  );
}

function ActionsView({ items, onOpen }: { items?: OperationalAction[]; onOpen: (state: DrawerState) => void }) {
  return (
    <Panel title="Operational actions" icon={ClipboardCheck}>
      <ActionList items={items} onOpen={onOpen} />
    </Panel>
  );
}

function ActionList({ items, onOpen }: { items?: OperationalAction[]; onOpen: (state: DrawerState) => void }) {
  return (
    <div className="grid gap-3">
      {(items ?? []).map((item) => (
        <Row key={item.id} onClick={() => onOpen({ type: "action", item })}>
          <Priority priority={item.priority} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{item.title}</p>
            <p className="truncate text-sm text-steel">{item.customer?.name ?? item.type}</p>
          </div>
          <Status label={item.status} />
          <p className="hidden text-sm text-steel md:block">{shortDate(item.dueAt)}</p>
        </Row>
      ))}
      <Empty show={!items?.length} label="No actions open" />
    </div>
  );
}

function BookingRows({ items, onOpen }: { items?: Booking[]; onOpen: (state: DrawerState) => void }) {
  return (
    <div className="grid gap-3">
      {(items ?? []).map((item) => (
        <Row key={item.id} onClick={() => onOpen({ type: "booking", item })}>
          <Avatar name={item.customer.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{item.service.title}</p>
            <p className="truncate text-sm text-steel">
              {item.customer.name} · {item.assignedStaff?.name ?? "Unassigned"}
            </p>
          </div>
          <p className="hidden text-sm font-medium text-ink md:block">{shortDate(item.startTime)}</p>
          <Status label={item.status} />
        </Row>
      ))}
      <Empty show={!items?.length} label="No bookings found" />
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children
}: {
  title: string;
  icon: typeof Inbox;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-mist text-pine">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof Inbox;
  label: string;
  value: string | number;
  tone: "pine" | "mint" | "coral" | "amber";
}) {
  const tones = {
    pine: "bg-pine text-white",
    mint: "bg-mint text-ink",
    coral: "bg-coral text-white",
    amber: "bg-amber text-ink"
  };
  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur">
      <div className={cn("mb-5 flex h-10 w-10 items-center justify-center rounded-[8px]", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-steel">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
    </section>
  );
}

function Signal({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/80 bg-white/80 p-4 shadow-soft backdrop-blur">
      <Icon className="mb-4 h-5 w-5 text-pine" />
      <p className="text-xs uppercase tracking-[0.18em] text-steel">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function Row({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex min-h-[64px] items-center gap-3 rounded-[8px] border border-ink/5 bg-mist/80 p-3",
        onClick && "cursor-pointer transition hover:border-pine/30 hover:bg-white"
      )}
    >
      {children}
    </div>
  );
}

function Avatar({ name }: { name?: string | null }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-ink text-sm font-bold text-white">
      {initials(name)}
    </div>
  );
}

function Status({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-[8px] bg-white px-2.5 py-1 text-xs font-semibold text-steel">
      {label.replaceAll("_", " ")}
    </span>
  );
}

function Priority({ priority }: { priority: OperationalAction["priority"] }) {
  const color =
    priority === "URGENT"
      ? "bg-coral text-white"
      : priority === "HIGH"
        ? "bg-amber text-ink"
        : "bg-white text-steel";
  return <span className={cn("rounded-[8px] px-2.5 py-1 text-xs font-bold", color)}>{priority}</span>;
}

function Severity({ severity }: { severity: "info" | "warning" | "critical" }) {
  const color =
    severity === "critical"
      ? "bg-coral text-white"
      : severity === "warning"
        ? "bg-amber text-ink"
        : "bg-mint text-ink";
  return <span className={cn("rounded-[8px] px-2.5 py-1 text-xs font-bold", color)}>{severity}</span>;
}

function Empty({ show, label }: { show: boolean; label: string }) {
  return show ? (
    <div className="flex min-h-[120px] items-center justify-center rounded-[8px] border border-dashed border-ink/15 bg-white/50 text-sm font-medium text-steel">
      {label}
    </div>
  ) : null;
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-[8px] border border-white/80 bg-white/90 shadow-soft">
      <Loader2 className="h-7 w-7 animate-spin text-pine" />
    </div>
  );
}

function DetailDrawer({
  state,
  onClose
}: {
  state: DrawerState;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {state ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xl flex-col border-l border-white/80 bg-white shadow-soft md:rounded-l-[8px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">
                  CrewFlow
                </p>
                <h2 className="text-xl font-semibold text-ink">{drawerTitle(state)}</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-mist text-ink transition hover:bg-ink hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {state.type === "new-booking" ? <NewBookingForm onDone={onClose} /> : null}
              {state.type === "booking" ? <BookingDetail item={state.item} /> : null}
              {state.type === "field-job" ? <FieldJobDetail item={state.item} onDone={onClose} /> : null}
              {state.type === "conversation" ? <ConversationDetail item={state.item} /> : null}
              {state.type === "invoice" ? <InvoiceDetail item={state.item} /> : null}
              {state.type === "action" ? <ActionDetail item={state.item} onDone={onClose} /> : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function NewBookingForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ["customers"], queryFn: api.customers });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.createBooking({
        customerId,
        serviceId,
        assignedStaffId: assignedStaffId || undefined,
        startTime: new Date(startTime).toISOString(),
        notes: notes || undefined
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      onDone();
    }
  });

  const canSubmit = customerId && serviceId && startTime;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) create.mutate();
      }}
    >
      <SelectField label="Customer" value={customerId} onChange={setCustomerId}>
        <option value="">Choose customer</option>
        {(customers.data ?? []).map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} · {customer.phone}
          </option>
        ))}
      </SelectField>
      <SelectField label="Service" value={serviceId} onChange={setServiceId}>
        <option value="">Choose service</option>
        {(services.data ?? []).map((service) => (
          <option key={service.id} value={service.id}>
            {service.title} · {money(service.priceCents)}
          </option>
        ))}
      </SelectField>
      <SelectField label="Staff" value={assignedStaffId} onChange={setAssignedStaffId}>
        <option value="">Unassigned</option>
        {(staff.data ?? []).map((member: StaffMember) => (
          <option key={member.id} value={member.id}>
            {member.name} · {member.role}
          </option>
        ))}
      </SelectField>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Start time</span>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
        />
      </label>
      {create.error ? <ErrorText error={create.error} /> : null}
      <button
        disabled={!canSubmit || create.isPending}
        className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
      >
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Create booking
      </button>
    </form>
  );
}

function BookingDetail({ item }: { item: Booking }) {
  return (
    <div className="grid gap-4">
      <DetailCard icon={CalendarDays} title={item.service.title}>
        <Info label="Customer" value={item.customer.name} />
        <Info label="Time" value={shortDate(item.startTime)} />
        <Info label="Staff" value={item.assignedStaff?.name ?? "Unassigned"} />
        <Info label="Status" value={item.status.replaceAll("_", " ")} />
        {item.notes ? <Info label="Notes" value={item.notes} /> : null}
      </DetailCard>
      {item.invoice ? (
        <DetailCard icon={FileText} title="Invoice">
          <Info label="Invoice" value={item.invoice.invoiceNo} />
          <Info label="Total" value={money(item.invoice.totalCents)} />
          <Info label="Status" value={item.invoice.status} />
        </DetailCard>
      ) : null}
      {item.fieldJobReport ? (
        <DetailCard icon={Route} title="Field report">
          <Info label="Status" value={item.fieldJobReport.status} />
          <Info label="Started" value={shortDate(item.fieldJobReport.startedAt)} />
          <Info label="Completed" value={shortDate(item.fieldJobReport.completedAt)} />
          {item.fieldJobReport.staffNotes ? <Info label="Staff notes" value={item.fieldJobReport.staffNotes} /> : null}
        </DetailCard>
      ) : null}
    </div>
  );
}

function FieldJobDetail({ item, onDone }: { item: Booking; onDone: () => void }) {
  const queryClient = useQueryClient();
  const report = item.fieldJobReport;
  const [staffNotes, setStaffNotes] = useState(report?.staffNotes ?? item.notes ?? "");
  const [photoDraft, setPhotoDraft] = useState((report?.photoUrls ?? []).join("\n"));
  const [signatureName, setSignatureName] = useState(report?.customerSignatureName ?? item.customer.name);
  const [checklist, setChecklist] = useState(
    report?.checklist?.length
      ? report.checklist
      : [
          { label: "Arrived on site", done: false },
          { label: "Service completed", done: false },
          { label: "Photos captured", done: false },
          { label: "Customer notified", done: false },
          { label: "Invoice ready", done: false }
        ]
  );

  const start = useMutation({
    mutationFn: () => api.startFieldJob(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });
  const save = useMutation({
    mutationFn: () =>
      api.saveFieldNotes(item.id, {
        staffNotes,
        photoUrls: parsePhotoUrls(photoDraft)
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });
  const complete = useMutation({
    mutationFn: () =>
      api.completeFieldJob(item.id, {
        checklist,
        photoUrls: parsePhotoUrls(photoDraft),
        staffNotes,
        customerSignatureName: signatureName,
        autoInvoice: true
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      onDone();
    }
  });

  const error = start.error ?? save.error ?? complete.error;

  return (
    <div className="grid gap-4">
      <DetailCard icon={Route} title={item.service.title}>
        <Info label="Customer" value={item.customer.name} />
        <Info label="Phone" value={item.customer.phone} />
        <Info label="Time" value={shortDate(item.startTime)} />
        <Info label="Crew" value={item.assignedStaff?.name ?? "Unassigned"} />
        <Info label="Booking status" value={item.status.replaceAll("_", " ")} />
      </DetailCard>

      <section className="rounded-[8px] bg-ink p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Mobile job packet</p>
            <h3 className="mt-2 text-xl font-semibold">Crew completion flow</h3>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Capture proof, notes, customer sign-off, and trigger invoice follow-up when the job closes.
            </p>
          </div>
          <Status label={report?.status ?? "READY"} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ActionButton label="Start job" icon={Play} onClick={() => start.mutate()} />
          <ActionButton label="Save draft" icon={Save} onClick={() => save.mutate()} />
        </div>
      </section>

      <section className="rounded-[8px] bg-mist p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-pine">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-ink">Checklist</h3>
        </div>
        <div className="grid gap-2">
          {checklist.map((task, index) => (
            <label
              key={task.label}
              className="flex min-h-12 items-center gap-3 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={(event) =>
                  setChecklist((items) =>
                    items.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, done: event.target.checked } : item
                    )
                  )
                }
                className="h-5 w-5 accent-pine"
              />
              {task.label}
            </label>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
          <FileText className="h-4 w-4 text-pine" />
          Staff notes
        </span>
        <textarea
          value={staffNotes}
          onChange={(event) => setStaffNotes(event.target.value)}
          placeholder="Arrival notes, work completed, customer requests..."
          className="min-h-32 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
          <Camera className="h-4 w-4 text-pine" />
          Photo URLs
        </span>
        <textarea
          value={photoDraft}
          onChange={(event) => setPhotoDraft(event.target.value)}
          placeholder="Paste image links, one per line"
          className="min-h-24 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
          <UserCheck className="h-4 w-4 text-pine" />
          Customer signature name
        </span>
        <input
          value={signatureName}
          onChange={(event) => setSignatureName(event.target.value)}
          className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
        />
      </label>

      <button
        onClick={() => complete.mutate()}
        disabled={complete.isPending || item.status === "COMPLETED"}
        className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
      >
        {complete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Complete job and trigger invoice
      </button>
      {error ? <ErrorText error={error} /> : null}
    </div>
  );
}

function ConversationDetail({ item }: { item: Conversation }) {
  const queryClient = useQueryClient();
  const full = useQuery({
    queryKey: ["conversation", item.id],
    queryFn: () => api.conversation(item.id)
  });
  const [reply, setReply] = useState("");
  const sendReply = useMutation({
    mutationFn: () => api.replyConversation(item.id, reply),
    onSuccess: () => {
      setReply("");
      void queryClient.invalidateQueries();
    }
  });
  const suggest = useMutation({
    mutationFn: () => api.suggestReply(item.id),
    onSuccess: (data) => setReply(data.reply)
  });
  const conversation = full.data ?? item;

  return (
    <div className="grid gap-4">
      <DetailCard icon={MessageSquareText} title={conversation.customer?.name ?? "New inquiry"}>
        <Info label="Channel" value={conversation.channel} />
        <Info label="Status" value={conversation.status} />
        <Info label="Last message" value={shortDate(conversation.lastMessageAt)} />
      </DetailCard>
      <div className="grid gap-2">
        {(conversation.messages ?? []).map((message) => (
          <div
            key={message.id ?? `${message.createdAt}-${message.role}`}
            className={cn(
              "rounded-[8px] p-3 text-sm",
              message.role === "CUSTOMER" ? "bg-mist text-ink" : "bg-pine text-white"
            )}
          >
            <p className="mb-1 text-xs font-semibold opacity-70">{message.role}</p>
            {message.content}
          </div>
        ))}
      </div>
      <div className="rounded-[8px] bg-mist p-3">
        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write a reply..."
          className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-white p-3 outline-none focus:border-pine"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => suggest.mutate()}
            disabled={suggest.isPending}
            className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
          >
            {suggest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Suggest
          </button>
          <button
            onClick={() => sendReply.mutate()}
            disabled={!reply || sendReply.isPending}
            className="flex h-10 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sendReply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetail({ item }: { item: Invoice }) {
  const queryClient = useQueryClient();
  const paymentLink = useMutation({
    mutationFn: () => api.createPaymentLink(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  return (
    <div className="grid gap-4">
      <DetailCard icon={CreditCard} title={item.invoiceNo}>
        <Info label="Customer" value={item.customer.name} />
        <Info label="Due" value={shortDate(item.dueDate)} />
        <Info label="Total" value={money(item.totalCents)} />
        <Info label="Status" value={item.status} />
      </DetailCard>
      <button
        onClick={() => paymentLink.mutate()}
        disabled={paymentLink.isPending || item.status === "PAID"}
        className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
      >
        {paymentLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Create payment link
      </button>
      {item.paymentUrl ? (
        <a
          href={item.paymentUrl}
          target="_blank"
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-4 font-semibold text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          Open payment page
        </a>
      ) : null}
      {paymentLink.error ? <ErrorText error={paymentLink.error} /> : null}
    </div>
  );
}

function ActionDetail({ item, onDone }: { item: OperationalAction; onDone: () => void }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED" | "DISMISSED") =>
      api.updateAction(item.id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      onDone();
    }
  });

  return (
    <div className="grid gap-4">
      <DetailCard icon={ClipboardCheck} title={item.title}>
        <Info label="Priority" value={item.priority} />
        <Info label="Status" value={item.status} />
        <Info label="Customer" value={item.customer?.name ?? "Not linked"} />
        <Info label="Due" value={shortDate(item.dueAt)} />
        {item.description ? <Info label="Details" value={item.description} /> : null}
      </DetailCard>
      <div className="grid gap-2 sm:grid-cols-3">
        <ActionButton label="Start" icon={Play} onClick={() => update.mutate("IN_PROGRESS")} />
        <ActionButton label="Complete" icon={CheckCircle2} onClick={() => update.mutate("COMPLETED")} />
        <ActionButton label="Dismiss" icon={X} onClick={() => update.mutate("DISMISSED")} />
      </div>
      {update.error ? <ErrorText error={update.error} /> : null}
    </div>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children
}: {
  icon: typeof Inbox;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-pine">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
      >
        {children}
      </select>
    </label>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick
}: {
  label: string;
  icon: typeof Inbox;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ErrorText({ error }: { error: unknown }) {
  return (
    <p className="rounded-[8px] bg-coral/10 px-3 py-2 text-sm font-medium text-coral">
      {error instanceof Error ? error.message : "Something went wrong"}
    </p>
  );
}

function drawerTitle(state: NonNullable<DrawerState>) {
  if (state.type === "new-booking") return "New booking";
  if (state.type === "booking") return "Booking details";
  if (state.type === "field-job") return "Field job";
  if (state.type === "conversation") return "Conversation";
  if (state.type === "invoice") return "Invoice";
  return "Action";
}

function parsePhotoUrls(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Logo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-ink text-white shadow-soft">
      <Sparkles className="h-5 w-5" />
    </div>
  );
}

function titleFor(view: View) {
  return {
    overview: "Operations overview",
    inbox: "Customer inbox",
    bookings: "Booking board",
    field: "Field operations",
    money: "Invoices and payments",
    actions: "Manager action queue",
    settings: "Tenant settings"
  }[view];
}
