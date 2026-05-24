"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ContactRound,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Headphones,
  HeartPulse,
  Inbox,
  Loader2,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Repeat2,
  RefreshCw,
  Route,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  UsersRound,
  Wrench,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  api,
  AutomationRun,
  Booking,
  BookingStatus,
  BookingUpdateType,
  Conversation,
  Customer,
  DashboardSummary,
  FieldDispatchJob,
  Invoice,
  InvoiceStatus,
  Lead,
  LeadAnalytics,
  LeadSource,
  LeadStatus,
  OnboardingProfile,
  OperationalAction,
  Payment,
  RetentionCustomer,
  RetentionSummary,
  Service,
  StaffMember,
  TenantActivationSummary,
  TenantBillingSummary,
  TenantProfile,
  WebhookEvent,
  WhatsappOnboarding,
  WhatsappStatus
} from "@/lib/api";
import { cn, initials, money, shortDate } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import logoMark from "@/public/images/logo.png";

const nav = [
  { id: "overview", label: "Overview", icon: HeartPulse },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "leads", label: "Leads", icon: Target },
  { id: "retention", label: "Retention", icon: Repeat2 },
  { id: "customers", label: "Customers", icon: ContactRound },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "field", label: "Field", icon: Route },
  { id: "money", label: "Money", icon: CreditCard },
  { id: "actions", label: "Actions", icon: ClipboardCheck },
  { id: "settings", label: "Settings", icon: Settings2 }
] as const;

type View = (typeof nav)[number]["id"];
const leadStatuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "BOOKING_READY", label: "Booking ready" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" }
];
const leadSources: LeadSource[] = [
  "AI_RECEPTIONIST",
  "WEB_CHAT",
  "WHATSAPP",
  "SMS",
  "EMAIL",
  "PHONE",
  "REFERRAL",
  "MANUAL"
];
type DrawerState =
  | { type: "booking"; item: Booking }
  | { type: "field-job"; item: Booking }
  | { type: "conversation"; item: Conversation }
  | { type: "customer"; item: Customer }
  | { type: "invoice"; item: Invoice }
  | { type: "action"; item: OperationalAction }
  | { type: "new-booking" }
  | null;

export default function Home() {
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  if (!token) return <Login />;
  if (user?.role === "PLATFORM_ADMIN" || user?.role === "PLATFORM_SUPPORT") return <AdminRedirect />;
  return <Console />;
}

function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="rounded-[8px] border border-white/80 bg-white/90 p-6 text-center shadow-soft">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-pine" />
        <p className="mt-3 font-semibold text-ink">Opening platform admin</p>
        <p className="mt-1 text-sm text-steel">Admin accounts use the platform control center.</p>
      </div>
    </main>
  );
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const inbox = useQuery({ queryKey: ["inbox"], queryFn: api.inbox });
  const leads = useQuery({ queryKey: ["leads"], queryFn: api.leads });
  const leadAnalytics = useQuery({ queryKey: ["lead-analytics"], queryFn: api.leadAnalytics });
  const retention = useQuery({ queryKey: ["retention"], queryFn: api.retention });
  const actions = useQuery({ queryKey: ["actions"], queryFn: api.actions });
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: api.bookings });
  const field = useQuery({ queryKey: ["field"], queryFn: api.fieldJobs });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: api.invoices });
  const payments = useQuery({ queryKey: ["payments"], queryFn: api.payments });
  const health = useQuery({ queryKey: ["health"], queryFn: api.health });
  const tenant = useQuery({ queryKey: ["tenant"], queryFn: api.tenant });
  const activation = useQuery({ queryKey: ["activation"], queryFn: api.activation });
  const tenantBilling = useQuery({ queryKey: ["tenant-billing"], queryFn: api.tenantBilling });
  const onboarding = useQuery({ queryKey: ["onboarding"], queryFn: api.onboarding });
  const customers = useQuery({ queryKey: ["customers"], queryFn: () => api.customers() });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });

  const refreshAll = () => {
    void queryClient.invalidateQueries();
  };

  return (
    <main className="min-h-screen p-3 md:p-5">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <aside
          className={cn(
            "hidden shrink-0 rounded-[8px] border border-white/80 bg-white/90 shadow-soft backdrop-blur transition-all duration-300 lg:block",
            sidebarCollapsed ? "w-[76px] p-3" : "w-64 p-4"
          )}
        >
          <div
            className={cn(
              "mb-8 flex items-center",
              sidebarCollapsed ? "flex-col gap-3" : "justify-between gap-3"
            )}
          >
            <div className={cn("flex min-w-0 items-center gap-3", sidebarCollapsed && "justify-center")}>
              <Logo />
              <div className={cn("min-w-0 transition-opacity", sidebarCollapsed && "sr-only")}>
                <p className="truncate font-semibold text-ink">CrewFlow</p>
                <p className="truncate text-xs text-steel">Operations OS</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-mist text-ink transition hover:bg-pine hover:text-white"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex h-11 w-full items-center rounded-[8px] text-sm font-medium transition",
                  sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3 text-left",
                  view === item.id
                    ? "bg-pine text-white"
                    : "text-steel hover:bg-mist hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn("truncate", sidebarCollapsed && "sr-only")}>{item.label}</span>
              </button>
            ))}
          </nav>
          <div
            className={cn(
              "mt-8 rounded-[8px] bg-mist",
              sidebarCollapsed ? "flex h-12 items-center justify-center p-0" : "p-3"
            )}
            title={`API: ${health.data?.database ?? "checking"}`}
          >
            <p className={cn("text-xs uppercase tracking-[0.18em] text-steel", sidebarCollapsed && "sr-only")}>API</p>
            <div className={cn("flex items-center gap-2", !sidebarCollapsed && "mt-2")}>
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  health.data?.status === "ok" ? "bg-mint" : "bg-amber"
                )}
              />
              <span className={cn("text-sm font-medium text-ink", sidebarCollapsed && "sr-only")}>
                {health.data?.database ?? "checking"}
              </span>
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
                  activation={activation.data}
                  tenant={tenant.data}
                  loading={dashboard.isLoading}
                  onOpen={setDrawer}
                  onView={setView}
                />
              ) : null}
              {view === "inbox" ? <InboxView items={inbox.data} onOpen={setDrawer} /> : null}
              {view === "leads" ? (
                <LeadsView
                  items={leads.data}
                  analytics={leadAnalytics.data}
                  customers={customers.data}
                  staff={staff.data}
                  onOpen={setDrawer}
                />
              ) : null}
              {view === "retention" ? (
                <RetentionView data={retention.data} onOpen={setDrawer} />
              ) : null}
              {view === "customers" ? <CustomersView items={customers.data} onOpen={setDrawer} /> : null}
              {view === "bookings" ? <BookingsView items={bookings.data} onOpen={setDrawer} /> : null}
              {view === "field" ? <FieldView items={field.data} onOpen={setDrawer} /> : null}
              {view === "money" ? <MoneyView invoices={invoices.data} payments={payments.data} onOpen={setDrawer} /> : null}
              {view === "actions" ? <ActionsView items={actions.data} onOpen={setDrawer} /> : null}
              {view === "settings" ? (
                <SettingsView
                  tenant={tenant.data}
                  billing={tenantBilling.data}
                  onboarding={onboarding.data}
                  services={services.data}
                  staff={staff.data}
                />
              ) : null}
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
  activation,
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
  activation?: TenantActivationSummary;
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
        activation={activation}
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

      <RevenuePipeline data={data} actions={actions} />

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
  const [filter, setFilter] = useState("active");
  const filtered = useMemo(() => {
    const source = items ?? [];
    if (filter === "active") {
      return source.filter((item) => !["RESOLVED", "CLOSED"].includes(item.status));
    }
    if (filter === "intent") {
      return source.filter((item) => item.bookingIntents?.some((intent) => intent.status !== "BOOKED"));
    }
    return source.filter((item) => item.status === filter);
  }, [items, filter]);

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
      <div className="min-w-0">
        <ReceptionistSimulator onOpen={onOpen} />
      </div>
      <div className="min-w-0">
        <Panel title="Customer inbox" icon={MessageSquareText}>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["active", "Active"],
              ["intent", "Revenue intent"],
              ["BOOKING_READY", "Booking ready"],
              ["WAITING_ON_CUSTOMER", "Waiting"],
              ["RESOLVED", "Resolved"]
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "h-9 shrink-0 rounded-[8px] px-3 text-sm font-semibold",
                  filter === value ? "bg-pine text-white" : "bg-mist text-steel"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid min-w-0 gap-3">
            {filtered.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                onClick={() => onOpen({ type: "conversation", item })}
              />
            ))}
            <Empty show={!filtered.length} label="No conversations found" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ConversationRow({ item, onClick }: { item: Conversation; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid min-h-[72px] min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[8px] border border-ink/5 bg-mist/80 p-3 text-left transition hover:border-pine/30 hover:bg-white lg:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <Avatar name={item.customer?.name} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-semibold text-ink">{item.customer?.name ?? "New inquiry"}</p>
          <span className="hidden shrink-0 text-xs font-medium text-steel sm:inline">
            {shortDate(item.lastMessageAt)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-steel">
          {item.messages?.[0]?.content ?? item.channel}
        </p>
      </div>
      <div className="hidden shrink-0 flex-wrap justify-end gap-2 lg:flex">
        {item.bookingIntents?.[0] ? <Status label={item.bookingIntents[0].status} /> : null}
        <Status label={item.status} />
      </div>
    </button>
  );
}

function LeadsView({
  items,
  analytics,
  customers,
  staff,
  onOpen
}: {
  items?: Lead[];
  analytics?: LeadAnalytics;
  customers?: Customer[];
  staff?: StaffMember[];
  onOpen: (state: DrawerState) => void;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [source, setSource] = useState<LeadSource>("MANUAL");
  const [estimatedValue, setEstimatedValue] = useState("299");
  const [followUpAt, setFollowUpAt] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items ?? [];
    return (items ?? []).filter((lead) =>
      [
        lead.title,
        lead.status,
        lead.source,
        lead.customer?.name ?? "",
        lead.customer?.phone ?? "",
        lead.assignedTo?.name ?? "",
        lead.notes ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [items, query]);

  const create = useMutation({
    mutationFn: () =>
      api.createLead({
        title,
        source,
        customerId: customerId || undefined,
        assignedToId: assignedToId || undefined,
        estimatedValueCents: Math.round(Number(estimatedValue || 0) * 100),
        followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined,
        conversionProbability: 25
      }),
    onSuccess: () => {
      setTitle("");
      setCustomerId("");
      setAssignedToId("");
      setEstimatedValue("299");
      setFollowUpAt("");
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
    }
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Target} label="Open pipeline" value={money(analytics?.openPipelineCents)} tone="pine" />
        <Metric icon={TrendingUp} label="Weighted value" value={money(analytics?.weightedPipelineCents)} tone="mint" />
        <Metric icon={Clock3} label="Follow-ups due" value={analytics?.followUpsDue ?? 0} tone="amber" />
        <Metric icon={DollarSign} label="Lead conversion" value={`${analytics?.conversionRate ?? 0}%`} tone="coral" />
      </div>

      <Panel
        title="Pipeline board"
        icon={Target}
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads..."
            className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-3 text-sm outline-none focus:border-pine sm:w-80"
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {leadStatuses.map((stage) => {
            const stageLeads = filtered.filter((lead) => lead.status === stage.value);
            const stageValue = stageLeads.reduce(
              (sum, lead) => sum + (lead.estimatedValueCents ?? 0),
              0
            );
            return (
              <section key={stage.value} className="min-h-[420px] rounded-[8px] bg-mist p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{stage.label}</p>
                    <p className="mt-1 text-sm font-medium text-steel">
                      {stageLeads.length} leads · {money(stageValue)}
                    </p>
                  </div>
                  <Status label={stage.value} />
                </div>
                <div className="grid gap-3">
                  {stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      staff={staff ?? []}
                      onOpen={onOpen}
                    />
                  ))}
                  <Empty show={!stageLeads.length} label="No leads here" />
                </div>
              </section>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="New lead" icon={Plus}>
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Lead title" value={title} onChange={setTitle} />
            <SelectField label="Customer" value={customerId} onChange={setCustomerId}>
              <option value="">Unlinked lead</option>
              {(customers ?? []).map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · {customer.phone}
                </option>
              ))}
            </SelectField>
            <SelectField label="Assigned to" value={assignedToId} onChange={setAssignedToId}>
              <option value="">Unassigned</option>
              {(staff ?? []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.role}
                </option>
              ))}
            </SelectField>
            <SelectField label="Source" value={source} onChange={(value) => setSource(value as LeadSource)}>
              {leadSources.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </SelectField>
            <InputField label="Estimated value" value={estimatedValue} onChange={setEstimatedValue} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Follow-up</span>
              <input
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
                className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
              />
            </label>
          </div>
          {create.error ? <ErrorText error={create.error} /> : null}
          <button
            onClick={() => create.mutate()}
            disabled={!title.trim() || create.isPending}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add lead
          </button>
        </Panel>

        <Panel title="Lead-to-booking" icon={TrendingUp}>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Won leads" value={analytics?.wonCount ?? 0} />
            <MiniStat label="Lost leads" value={analytics?.lostCount ?? 0} danger={(analytics?.lostCount ?? 0) > 0} />
            <MiniStat label="Booked value" value={money(analytics?.leadToBooking.bookingValueCents)} />
          </div>
          <div className="mt-4 rounded-[8px] bg-mist p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Best sources</p>
            <div className="mt-3 grid gap-2">
              {Object.entries(analytics?.bySource ?? {})
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([sourceName, count]) => (
                  <div key={sourceName} className="flex items-center justify-between rounded-[8px] bg-white px-3 py-2 text-sm">
                    <span className="font-medium text-ink">{sourceName.replaceAll("_", " ")}</span>
                    <span className="font-semibold text-steel">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RetentionView({
  data,
  onOpen
}: {
  data?: RetentionSummary;
  onOpen: (state: DrawerState) => void;
}) {
  const queryClient = useQueryClient();
  const scan = useMutation({
    mutationFn: api.scanRetention,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["retention"] });
      void queryClient.invalidateQueries({ queryKey: ["actions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Banknote} label="Retained revenue" value={money(data?.retainedRevenueCents)} tone="pine" />
        <Metric icon={Repeat2} label="Repeat opportunity" value={money(data?.repeatOpportunityCents)} tone="mint" />
        <Metric icon={HeartPulse} label="Win-back value" value={money(data?.winBackOpportunityCents)} tone="amber" />
        <Metric icon={UsersRound} label="Customers to act on" value={(data?.repeatCandidates.length ?? 0) + (data?.winBackCandidates.length ?? 0)} tone="coral" />
      </div>

      <Panel
        title="Retention engine"
        icon={Repeat2}
        action={
          <button
            onClick={() => scan.mutate()}
            disabled={scan.isPending}
            className="flex h-9 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {scan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Scan retention
          </button>
        }
      >
        {scan.isSuccess ? (
          <p className="mb-3 rounded-[8px] bg-mint/30 px-3 py-2 text-sm font-semibold text-ink">
            Retention scan found {scan.data.repeatCandidates} repeat and {scan.data.winBackCandidates} win-back opportunities.
          </p>
        ) : null}
        {scan.error ? <ErrorText error={scan.error} /> : null}
        <div className="grid gap-4 xl:grid-cols-2">
          <RetentionList
            title="Ready to rebook"
            icon={Repeat2}
            items={data?.repeatCandidates}
            empty="No repeat opportunities right now"
            onOpen={onOpen}
          />
          <RetentionList
            title="Win-back customers"
            icon={HeartPulse}
            items={data?.winBackCandidates}
            empty="No inactive customers to win back"
            onOpen={onOpen}
          />
        </div>
      </Panel>

      <Panel title="Top customers" icon={UsersRound}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.topCustomers ?? []).map((item) => (
            <RetentionCustomerCard key={item.customer.id} item={item} onOpen={onOpen} />
          ))}
          <Empty show={!data?.topCustomers.length} label="No paid customer history yet" />
        </div>
      </Panel>
    </div>
  );
}

function RetentionList({
  title,
  icon: Icon,
  items,
  empty,
  onOpen
}: {
  title: string;
  icon: typeof Inbox;
  items?: RetentionCustomer[];
  empty: string;
  onOpen: (state: DrawerState) => void;
}) {
  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-pine">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <RetentionCustomerCard key={item.customer.id} item={item} onOpen={onOpen} />
        ))}
        <Empty show={!items?.length} label={empty} />
      </div>
    </section>
  );
}

function RetentionCustomerCard({
  item,
  onOpen
}: {
  item: RetentionCustomer;
  onOpen: (state: DrawerState) => void;
}) {
  return (
    <article className="rounded-[8px] bg-white p-3 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{item.customer.name}</p>
          <p className="mt-1 truncate text-sm text-steel">
            {item.serviceTitle} · {item.daysSinceLastBooking} days ago
          </p>
        </div>
        <Status label={item.recommendation} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniStat label="Lifetime" value={money(item.lifetimeValueCents)} />
        <MiniStat label="Next value" value={money(item.estimatedNextValueCents)} />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() =>
            onOpen({
              type: "customer",
              item: {
                id: item.customer.id,
                name: item.customer.name,
                phone: item.customer.phone,
                email: item.customer.email
              }
            })
          }
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink"
        >
          <ContactRound className="h-4 w-4" />
          Customer
        </button>
        <a
          href={`tel:${item.customer.phone}`}
          className="flex h-9 items-center justify-center rounded-[8px] bg-pine px-3 text-sm font-semibold text-white"
        >
          Call
        </a>
      </div>
    </article>
  );
}

function LeadCard({
  lead,
  staff,
  onOpen
}: {
  lead: Lead;
  staff: StaffMember[];
  onOpen: (state: DrawerState) => void;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assignedToId, setAssignedToId] = useState(lead.assignedTo?.id ?? "");
  const [probability, setProbability] = useState(String(lead.conversionProbability));
  const [followUpAt, setFollowUpAt] = useState(
    lead.followUpAt ? toDateTimeLocal(lead.followUpAt) : ""
  );
  const [now] = useState(() => Date.now());
  const update = useMutation({
    mutationFn: () =>
      api.updateLead(lead.id, {
        status,
        assignedToId: assignedToId || undefined,
        conversionProbability: Number(probability),
        followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
    }
  });
  const isDue = lead.followUpAt ? new Date(lead.followUpAt).getTime() <= now : false;

  return (
    <article className="rounded-[8px] border border-ink/5 bg-white p-3 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold leading-5 text-ink">{lead.title}</p>
          <p className="mt-1 truncate text-sm text-steel">
            {lead.customer?.name ?? "Unlinked"} · {lead.source.replaceAll("_", " ")}
          </p>
        </div>
        <Status label={`${lead.conversionProbability}%`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-[8px] bg-mist p-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Value</p>
          <p className="mt-1 font-semibold text-ink">{money(lead.estimatedValueCents)}</p>
        </div>
        <div className={cn("rounded-[8px] p-2", isDue ? "bg-coral/10" : "bg-mist")}>
          <p className={cn("text-xs font-semibold uppercase tracking-[0.14em]", isDue ? "text-coral" : "text-steel")}>
            Follow-up
          </p>
          <p className="mt-1 truncate font-semibold text-ink">{shortDate(lead.followUpAt)}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadStatus)}
          className="h-9 rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine"
        >
          {leadStatuses.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
        <select
          value={assignedToId}
          onChange={(event) => setAssignedToId(event.target.value)}
          className="h-9 rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine"
        >
          <option value="">Unassigned</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
            className="h-9 min-w-0 rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={probability}
            onChange={(event) => setProbability(event.target.value)}
            className="h-9 rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine"
          />
        </div>
      </div>
      {lead.wonLostReason ? (
        <p className="mt-3 rounded-[8px] bg-mist p-2 text-sm text-steel">{lead.wonLostReason}</p>
      ) : null}
      {update.error ? <ErrorText error={update.error} /> : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => update.mutate()}
          disabled={update.isPending}
          className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
        {lead.conversation ? (
          <button
            onClick={() => onOpen({ type: "conversation", item: lead.conversation! })}
            className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink"
          >
            <Inbox className="h-4 w-4" />
            Inbox
          </button>
        ) : lead.booking ? (
          <button
            onClick={() => onOpen({ type: "booking", item: lead.booking! })}
            className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink"
          >
            <CalendarDays className="h-4 w-4" />
            Job
          </button>
        ) : (
          <span className="flex h-9 items-center justify-center rounded-[8px] bg-mist px-3 text-sm font-semibold text-steel">
            Manual
          </span>
        )}
      </div>
    </article>
  );
}

function RevenuePipeline({
  data,
  actions
}: {
  data?: DashboardSummary;
  actions?: OperationalAction[];
}) {
  const hotLeadActions = (actions ?? []).filter((action) =>
    ["FOLLOW_UP_STALE_INQUIRY", "CONFIRM_BOOKING"].includes(action.type)
  ).length;
  const dispatchActions = (actions ?? []).filter((action) => action.type === "DISPATCH_STAFF").length;
  const collectActions = (actions ?? []).filter((action) => action.type === "COLLECT_PAYMENT").length;
  const reviewActions = (actions ?? []).filter((action) => action.type === "REQUEST_REVIEW").length;
  const stages = [
    { label: "Leads", value: hotLeadActions, icon: Inbox, tone: "bg-coral/10 text-coral" },
    { label: "Booked", value: data?.today.confirmed ?? 0, icon: CalendarDays, tone: "bg-pine/10 text-pine" },
    { label: "Dispatch", value: dispatchActions, icon: Route, tone: "bg-amber/20 text-ink" },
    { label: "Collect", value: collectActions || data?.pendingInvoices || 0, icon: CreditCard, tone: "bg-mint/40 text-ink" },
    { label: "Review", value: reviewActions, icon: Sparkles, tone: "bg-mist text-pine" }
  ];

  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Revenue pipeline</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Lead to paid job</h2>
        </div>
        <p className="text-sm font-semibold text-steel">{money(data?.revenue.atRiskTotalCents)} at risk</p>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.label} className="min-h-24 rounded-[8px] bg-mist p-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-[8px]", stage.tone)}>
              <stage.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-ink">{stage.value}</p>
            <p className="text-sm font-medium text-steel">{stage.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReceptionistSimulator({ onOpen }: { onOpen: (state: DrawerState) => void }) {
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = useState("Test Lead");
  const [phone, setPhone] = useState("+15550102020");
  const [message, setMessage] = useState(
    "Hi, I need a deep clean next Friday afternoon at 123 Main St. What is the price and can you book me?"
  );
  const [conversationId, setConversationId] = useState("");
  const [lastResult, setLastResult] = useState<{
    reply: string;
    conversationId: string;
    bookingIntent?: { status: string; missingFields?: string[]; service?: Service | null; quotedPriceCents?: number | null } | null;
    missingFields: string[];
    handoff: boolean;
  } | null>(null);

  const simulate = useMutation({
    mutationFn: () =>
      api.receptionistInquiry({
        customerName: customerName || undefined,
        phone: phone || undefined,
        message,
        conversationId: conversationId || undefined,
        channel: "WEB_CHAT"
      }),
    onSuccess: (result) => {
      setConversationId(result.conversationId);
      setLastResult(result);
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const openConversation = useMutation({
    mutationFn: () => api.conversation(lastResult!.conversationId),
    onSuccess: (conversation) => onOpen({ type: "conversation", item: conversation })
  });
  const canSend = Boolean(message.trim());

  return (
    <Panel title="Receptionist simulator" icon={Bot}>
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Customer name" value={customerName} onChange={setCustomerName} />
          <InputField label="Phone" value={phone} onChange={setPhone} />
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Inquiry</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-32 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
          />
        </label>
        <button
          onClick={() => simulate.mutate()}
          disabled={!canSend || simulate.isPending}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
        >
          {simulate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run intake
        </button>
        {simulate.error ? <ErrorText error={simulate.error} /> : null}
        {lastResult ? (
          <div className="rounded-[8px] bg-ink p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Assistant reply</p>
                <p className="mt-2 text-sm leading-6 text-white/78">{lastResult.reply}</p>
              </div>
              <Status label={lastResult.handoff ? "HANDOFF" : lastResult.bookingIntent?.status ?? "OPEN"} />
            </div>
            <div className="mt-4 grid gap-2 rounded-[8px] bg-white/8 p-3 text-sm text-white/75">
              <p>
                Service:{" "}
                <span className="font-semibold text-white">
                  {lastResult.bookingIntent?.service?.title ?? "Not detected"}
                </span>
              </p>
              <p>
                Quote:{" "}
                <span className="font-semibold text-white">
                  {lastResult.bookingIntent?.quotedPriceCents
                    ? money(lastResult.bookingIntent.quotedPriceCents)
                    : "Pending"}
                </span>
              </p>
              <p>
                Missing:{" "}
                <span className="font-semibold text-white">
                  {(lastResult.missingFields.length ? lastResult.missingFields : ["none"]).join(", ")}
                </span>
              </p>
            </div>
            <button
              onClick={() => openConversation.mutate()}
              disabled={openConversation.isPending}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-mint px-3 text-sm font-semibold text-ink"
            >
              {openConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Open intake
            </button>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function CustomersView({ items, onOpen }: { items?: Customer[]; onOpen: (state: DrawerState) => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [csv, setCsv] = useState("name,phone,email,notes\nAva Carter,+15550102020,ava@example.com,Prefers WhatsApp");
  const [importResult, setImportResult] = useState<string>("");

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items ?? [];
    return (items ?? []).filter((customer) =>
      [customer.name, customer.phone, customer.email ?? "", customer.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function reset(customer?: Customer | null) {
    setEditing(customer ?? null);
    setName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
    setEmail(customer?.email ?? "");
    setNotes(customer?.notes ?? "");
  }

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.updateCustomer(editing.id, { name, phone, email, notes })
        : api.createCustomer({ name, phone, email, notes }),
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const importCustomers = useMutation({
    mutationFn: () => api.importCustomers(parseCustomerCsv(csv)),
    onSuccess: (result) => {
      setImportResult(`${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const canSave = name.trim() && phone.trim();
  const preview = parseCustomerCsv(csv).slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Customer manager" icon={ContactRound}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers..."
            className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine md:max-w-sm"
          />
          <button
            onClick={() => reset()}
            className="flex h-11 items-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New customer
          </button>
        </div>

        <div className="grid gap-3">
          {filtered.map((customer) => (
            <Row key={customer.id} onClick={() => onOpen({ type: "customer", item: customer })}>
              <Avatar name={customer.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{customer.name}</p>
                <p className="truncate text-sm text-steel">
                  {customer.phone} · {customer.email ?? "No email"}
                </p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  reset(customer);
                }}
                className="h-9 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
              >
                Edit
              </button>
            </Row>
          ))}
          <Empty show={!filtered.length} label="No customers found" />
        </div>
      </Panel>

      <div className="grid gap-4">
        <Panel title={editing ? "Edit customer" : "Add customer"} icon={UserCheck}>
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Name" value={name} onChange={setName} />
            <InputField label="Phone" value={phone} onChange={setPhone} />
            <InputField label="Email" value={email} onChange={setEmail} />
          </div>
          <label className="mt-3 block">
            <span className="mb-2 block text-sm font-medium text-ink">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-[8px] border border-ink/10 bg-mist p-3 outline-none focus:border-pine"
            />
          </label>
          {save.error ? <ErrorText error={save.error} /> : null}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => save.mutate()}
              disabled={!canSave || save.isPending}
              className="flex h-10 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? "Save customer" : "Add customer"}
            </button>
            {editing ? (
              <button onClick={() => reset()} className="h-10 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink">
                Cancel
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel title="CSV import" icon={FileText}>
          <textarea
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            className="min-h-36 w-full rounded-[8px] border border-ink/10 bg-mist p-3 text-sm outline-none focus:border-pine"
          />
          <div className="mt-3 rounded-[8px] bg-mist p-3">
            <p className="text-sm font-semibold text-ink">Preview</p>
            <div className="mt-2 grid gap-2">
              {preview.map((row, index) => (
                <p key={`${row.phone}-${index}`} className="truncate text-sm text-steel">
                  {row.name} · {row.phone} · {row.email || "No email"}
                </p>
              ))}
              <Empty show={!preview.length} label="Paste CSV with name and phone" />
            </div>
          </div>
          {importCustomers.error ? <ErrorText error={importCustomers.error} /> : null}
          {importResult ? (
            <p className="mt-3 rounded-[8px] bg-mint/30 px-3 py-2 text-sm font-semibold text-ink">{importResult}</p>
          ) : null}
          <button
            onClick={() => importCustomers.mutate()}
            disabled={!preview.length || importCustomers.isPending}
            className="mt-3 flex h-10 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {importCustomers.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Import customers
          </button>
        </Panel>
      </div>
    </div>
  );
}

function BookingsView({ items, onOpen }: { items?: Booking[]; onOpen: (state: DrawerState) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (items ?? []).filter((booking) => {
      const matchesStatus = status === "all" || booking.status === status;
      const haystack = [
        booking.customer.name,
        booking.customer.phone,
        booking.service.title,
        booking.assignedStaff?.name ?? "",
        booking.status
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [items, search, status]);

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
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, service, staff..."
          className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine"
        >
          <option value="all">All statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">On the way</option>
          <option value="COMPLETED">Completed</option>
          <option value="NO_SHOW">No-show</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <BookingRows items={filtered} onOpen={onOpen} />
    </Panel>
  );
}

function SetupChecklist({
  customers,
  services,
  staff,
  bookings,
  onboarding,
  activation,
  tenant,
  onOpen,
  onView
}: {
  customers: number;
  services: number;
  staff: number;
  bookings: number;
  onboarding?: OnboardingProfile;
  activation?: TenantActivationSummary;
  tenant?: TenantProfile;
  onOpen: (state: DrawerState) => void;
  onView: (view: View) => void;
}) {
  const completedSteps = new Set(tenant?.onboardingProfile?.completedSteps ?? []);
  const whatsappReady =
    Boolean(onboarding?.whatsappNumber) ||
    completedSteps.has("whatsappPlanned") ||
    tenant?.onboardingProfile?.setupStatus === "READY";
  const localItems = [
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
      action: "Customers",
      onClick: () => onView("customers")
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
  const items = activation?.steps.length
    ? activation.steps.map((step) => ({
        label: step.label,
        detail: step.detail,
        done: step.done,
        icon: iconForActivationStep(step.id),
        action: actionForActivationTarget(step.target),
        onClick: () => handleActivationTarget(step.target, onView, onOpen)
      }))
    : localItems;
  const completed = items.filter((item) => item.done).length;
  const total = activation?.total ?? items.length;
  const score = activation?.score ?? Math.round((completed / items.length) * 100);

  return (
    <section className="overflow-hidden rounded-[8px] border border-white/80 bg-ink text-white shadow-soft">
      <div className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Activation playbook</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {activation?.launchReady ? "Tenant is launch-ready." : "Get the tenant revenue-ready."}
          </h2>
          <p className="mt-3 leading-7 text-white/68">
            This checklist keeps onboarding focused on the operating pieces that make a business pay:
            services, staff, bookings, customers, and automation.
          </p>
          {activation?.nextStep ? (
            <p className="mt-3 rounded-[8px] bg-white/8 p-3 text-sm leading-6 text-white/72">
              Next: {activation.nextStep.label}. {activation.nextStep.detail}
            </p>
          ) : onboarding?.biggestProblem ? (
            <p className="mt-3 rounded-[8px] bg-white/8 p-3 text-sm leading-6 text-white/72">
              Priority: {onboarding.biggestProblem}
            </p>
          ) : null}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span>{activation?.completed ?? completed} of {total} complete</span>
              <span>{score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-mint" style={{ width: `${score}%` }} />
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

function iconForActivationStep(id: string) {
  const icons: Record<string, typeof Building2> = {
    business_profile: Building2,
    service_catalog: Settings2,
    staff_ready: UsersRound,
    customer_base: ContactRound,
    first_booking: CalendarDays,
    automation_ready: MessageSquareText,
    billing_active: CreditCard
  };
  return icons[id] ?? ClipboardCheck;
}

function actionForActivationTarget(target: string) {
  const labels: Record<string, string> = {
    settings: "Settings",
    customers: "Customers",
    bookings: "Create"
  };
  return labels[target] ?? "Open";
}

function handleActivationTarget(
  target: string,
  onView: (view: View) => void,
  onOpen: (state: DrawerState) => void
) {
  if (target === "bookings") {
    onOpen({ type: "new-booking" });
    return;
  }
  if (target === "customers" || target === "settings") {
    onView(target);
  }
}

function FieldView({ items, onOpen }: { items?: Booking[]; onOpen: (state: DrawerState) => void }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [assigning, setAssigning] = useState<FieldDispatchJob | null>(null);
  const [staffId, setStaffId] = useState("");
  const [dispatchNote, setDispatchNote] = useState("");
  const dispatch = useQuery({
    queryKey: ["field-dispatch", date],
    queryFn: () => api.fieldDispatch(date)
  });
  const communicationHealth = useQuery({
    queryKey: ["communication-health"],
    queryFn: api.communicationHealth
  });
  const jobs = dispatch.data?.jobs ?? items ?? [];
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
  const assign = useMutation({
    mutationFn: () => {
      if (!assigning || !staffId) throw new Error("Choose a crew member");
      return api.assignFieldJob(assigning.id, { staffId, dispatchNote: dispatchNote || undefined });
    },
    onSuccess: () => {
      setAssigning(null);
      setStaffId("");
      setDispatchNote("");
      void queryClient.invalidateQueries();
    }
  });

  return (
    <div className="grid gap-4">
      <Panel title="Dispatch readiness" icon={Route}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <MiniStat label="Jobs" value={dispatch.data?.summary.totalJobs ?? jobs.length} />
            <MiniStat label="Ready" value={dispatch.data?.summary.ready ?? 0} />
            <MiniStat label="Unassigned" value={dispatch.data?.summary.unassigned ?? 0} danger={(dispatch.data?.summary.unassigned ?? 0) > 0} />
            <MiniStat label="Confirm" value={dispatch.data?.summary.needsConfirmation ?? 0} danger={(dispatch.data?.summary.needsConfirmation ?? 0) > 0} />
            <MiniStat label="Active" value={dispatch.data?.summary.inProgress ?? 0} />
            <MiniStat label="Done" value={dispatch.data?.summary.completed ?? 0} />
          </div>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-11 rounded-[8px] border border-ink/10 bg-mist px-3 text-sm font-semibold outline-none focus:border-pine"
          />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {(dispatch.data?.staffLoad ?? []).map((member) => (
            <div key={member.id} className="rounded-[8px] bg-mist p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-semibold text-ink">{member.name}</p>
                <Status label={`${member.jobs} jobs`} />
              </div>
              <p className="mt-1 text-sm text-steel">{Math.round(member.minutes / 60)}h scheduled</p>
              <p className="mt-2 truncate text-sm font-medium text-steel">
                {member.nextJob ? `Next: ${member.nextJob.service.title}` : "No active job"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Communication health" icon={MessageSquareText}>
        <div className="grid gap-3 sm:grid-cols-4">
          <MiniStat label="Risks" value={communicationHealth.data?.summary.risks ?? 0} danger={(communicationHealth.data?.summary.risks ?? 0) > 0} />
          <MiniStat label="Confirm" value={communicationHealth.data?.summary.missingConfirmation ?? 0} />
          <MiniStat label="On-way" value={communicationHealth.data?.summary.missingOnTheWay ?? 0} danger={(communicationHealth.data?.summary.missingOnTheWay ?? 0) > 0} />
          <MiniStat label="Review" value={communicationHealth.data?.summary.missingReview ?? 0} />
        </div>
        <div className="mt-4 grid gap-2">
          {(communicationHealth.data?.risks ?? []).slice(0, 5).map((risk) => (
            <button
              key={`${risk.bookingId}-${risk.type}`}
              onClick={() => {
                const match = jobs.find((job) => job.id === risk.bookingId);
                if (match) onOpen({ type: "booking", item: match });
              }}
              className="flex items-center justify-between gap-3 rounded-[8px] bg-mist p-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink">{risk.title}</span>
                <span className="block truncate text-sm text-steel">
                  {risk.customerName} · {risk.serviceTitle} · {shortDate(risk.startTime)}
                </span>
              </span>
              <Status label={risk.severity} />
            </button>
          ))}
          <Empty show={!communicationHealth.isLoading && !(communicationHealth.data?.risks.length)} label="No communication gaps" />
        </div>
      </Panel>

      <Panel title="Route and job readiness" icon={Wrench}>
        <div className="grid gap-3">
        {jobs.map((item) => {
          const dispatchJob = asDispatchJob(item);
          return (
          <Row key={item.id} onClick={() => onOpen({ type: "field-job", item })}>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-[8px]", dispatchJob?.readiness.ready ? "bg-mint/20 text-pine" : "bg-amber/20 text-ink")}>
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{item.service.title}</p>
              <p className="truncate text-sm text-steel">
                {item.customer.name} · {shortDate(item.startTime)} · {item.assignedStaff?.name ?? "Unassigned"}
              </p>
              {dispatchJob?.readiness.blockers.length ? (
                <p className="mt-1 truncate text-xs font-semibold text-coral">
                  {dispatchJob.readiness.blockers.join(" · ")}
                </p>
              ) : null}
            </div>
            {dispatchJob ? <Status label={`${dispatchJob.readiness.score}% ready`} /> : null}
            <Status label={item.status} />
            {item.fieldJobReport?.status ? <Status label={item.fieldJobReport.status} /> : null}
            {!item.assignedStaff ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setAssigning(dispatchJob ?? null);
                }}
                className="flex h-9 items-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white"
              >
                <UserCheck className="h-4 w-4" />
                Assign
              </button>
            ) : null}
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
          );
        })}
        <Empty show={!jobs.length && !dispatch.isLoading} label="No field jobs today" />
        {dispatch.isLoading ? <p className="text-sm font-semibold text-steel">Loading dispatch board...</p> : null}
      </div>
      </Panel>

      {assigning ? (
        <Panel title="Assign crew" icon={UserCheck}>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <SelectField label="Crew" value={staffId} onChange={setStaffId}>
              <option value="">Choose crew</option>
              {(dispatch.data?.staffLoad ?? []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.jobs} jobs
                </option>
              ))}
            </SelectField>
            <InputField label="Dispatch note" value={dispatchNote} onChange={setDispatchNote} />
            <button
              onClick={() => assign.mutate()}
              disabled={assign.isPending || !staffId}
              className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {assign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              Assign
            </button>
          </div>
          <p className="mt-3 text-sm text-steel">
            {assigning.customer.name} · {assigning.service.title} · {shortDate(assigning.startTime)}
          </p>
          {assign.error ? <ErrorText error={assign.error} /> : null}
        </Panel>
      ) : null}
    </div>
  );
}

function asDispatchJob(item: Booking | FieldDispatchJob): FieldDispatchJob | null {
  return "readiness" in item ? item : null;
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
  const overdueTotal = useMemo(
    () =>
      (invoices ?? [])
        .filter((invoice) => invoice.status === "OVERDUE")
        .reduce((sum, invoice) => sum + invoice.totalCents, 0),
    [invoices]
  );
  const openTotal = useMemo(
    () => openInvoices.reduce((sum, invoice) => sum + invoice.totalCents, 0),
    [openInvoices]
  );
  const paidTotal = useMemo(
    () =>
      (invoices ?? [])
        .filter((invoice) => invoice.status === "PAID")
        .reduce((sum, invoice) => sum + invoice.totalCents, 0),
    [invoices]
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={CreditCard} label="Open invoices" value={money(openTotal)} tone="amber" />
        <Metric icon={AlertTriangle} label="Overdue" value={money(overdueTotal)} tone="coral" />
        <Metric icon={Banknote} label="Paid" value={money(paidTotal)} tone="mint" />
      </div>

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
    </div>
  );
}

function SettingsView({
  tenant,
  billing,
  onboarding,
  services,
  staff
}: {
  tenant?: TenantProfile;
  billing?: TenantBillingSummary;
  onboarding?: OnboardingProfile;
  services?: Service[];
  staff?: StaffMember[];
}) {
  if (!tenant) return <LoadingPanel />;

  return (
    <SettingsForm
      key={`${tenant.id}-${onboarding?.updatedAt ?? "new"}`}
      tenant={tenant}
      billing={billing}
      onboarding={onboarding}
      services={services ?? []}
      staff={staff ?? []}
    />
  );
}

function SettingsForm({
  tenant,
  billing,
  onboarding,
  services,
  staff
}: {
  tenant: TenantProfile;
  billing?: TenantBillingSummary;
  onboarding?: OnboardingProfile;
  services: Service[];
  staff: StaffMember[];
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
  const whatsappStatus = useQuery({ queryKey: ["whatsapp-status"], queryFn: api.whatsappStatus });
  const whatsappOnboarding = useQuery({ queryKey: ["whatsapp-onboarding"], queryFn: api.whatsappOnboarding });
  const automationRuns = useQuery({ queryKey: ["automation-runs"], queryFn: api.automationRuns });
  const webhookEvents = useQuery({ queryKey: ["whatsapp-events"], queryFn: api.whatsappEvents });
  const createCheckout = useMutation({
    mutationFn: api.createTenantBillingCheckout,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tenant-billing"] });
      void queryClient.invalidateQueries({ queryKey: ["activation"] });
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    }
  });
  const createPortal = useMutation({
    mutationFn: api.createTenantBillingPortal,
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    }
  });
  const scanBilling = useMutation({
    mutationFn: api.scanBillingRecovery,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["actions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant-billing"] });
      void queryClient.invalidateQueries({ queryKey: ["activation"] });
    }
  });

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
      void queryClient.invalidateQueries({ queryKey: ["activation"] });
    }
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <BillingSelfServePanel
          billing={billing}
          checkoutPending={createCheckout.isPending}
          portalPending={createPortal.isPending}
          scanPending={scanBilling.isPending}
          error={createCheckout.error ?? createPortal.error ?? scanBilling.error}
          onCheckout={() => createCheckout.mutate()}
          onPortal={() => createPortal.mutate()}
          onScan={() => scanBilling.mutate()}
        />

        <PortalLinkPanel tenant={tenant} />

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

      <div className="grid gap-4 xl:grid-cols-2">
        <ServiceManager services={services} />
        <StaffManager staff={staff} />
      </div>

      <WhatsAppOpsPanel
        status={whatsappStatus.data}
        onboarding={whatsappOnboarding.data}
        runs={automationRuns.data}
        events={webhookEvents.data}
      />
    </div>
  );
}

function PortalLinkPanel({ tenant }: { tenant: TenantProfile }) {
  const [copied, setCopied] = useState(false);
  const portalPath = `/book/${tenant.slug}`;
  const portalUrl =
    typeof window === "undefined" ? portalPath : `${window.location.origin}${portalPath}`;

  async function copyLink() {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Panel title="Customer booking link" icon={CalendarDays}>
      <div className="rounded-[8px] bg-mist p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Public portal</p>
        <p className="mt-2 break-all text-lg font-semibold text-ink">{portalUrl}</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          onClick={copyLink}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 text-sm font-semibold text-white"
        >
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={portalPath}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Open portal
        </a>
      </div>
      <p className="mt-3 text-sm leading-6 text-steel">Bookings from this page enter the same operations queue.</p>
    </Panel>
  );
}

function BillingSelfServePanel({
  billing,
  checkoutPending,
  portalPending,
  scanPending,
  error,
  onCheckout,
  onPortal,
  onScan
}: {
  billing?: TenantBillingSummary;
  checkoutPending: boolean;
  portalPending: boolean;
  scanPending: boolean;
  error: unknown;
  onCheckout: () => void;
  onPortal: () => void;
  onScan: () => void;
}) {
  const limits = billing?.limits ?? {};
  const usage = billing?.usage ?? {};
  const blocked =
    billing?.subscriptionStatus === "CANCELED" ||
    billing?.subscriptionStatus === "UNPAID";
  return (
    <Panel title="Billing and plan" icon={CreditCard}>
      <div className="grid gap-3 sm:grid-cols-2">
        <PlanStat label="Plan" value={billing?.subscriptionPlan ?? "pilot"} />
        <PlanStat label="Status" value={billing?.subscriptionStatus ?? "TRIALING"} danger={blocked} />
        <PlanStat label="Monthly" value={money(billing?.monthlyPriceCents)} />
        <PlanStat label="Next bill" value={billing?.nextBillingAt ? shortDate(billing.nextBillingAt) : "Not set"} />
      </div>

      <div className="mt-4 grid gap-2">
        {(["staff", "customers", "leads", "monthlyBookings"] as const).map((key) => (
          <UsageBar key={key} label={key} used={usage[key] ?? 0} limit={limits[key]} />
        ))}
      </div>

      {billing?.pastDueAt ? (
        <p className="mt-4 rounded-[8px] bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
          Payment is past due since {shortDate(billing.pastDueAt)}.
        </p>
      ) : null}
      {error ? <ErrorText error={error} /> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onCheckout}
          disabled={checkoutPending}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {checkoutPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Upgrade plan
        </button>
        <button
          onClick={onPortal}
          disabled={portalPending || !billing?.hasStripeCustomer || !billing?.stripeConfigured}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {portalPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          Manage billing
        </button>
      </div>
      {billing?.paystackConfigured ? (
        <p className="mt-3 rounded-[8px] bg-mist px-3 py-2 text-sm font-medium text-steel">
          Paystack checkout is enabled for Nigeria/Africa payments.
        </p>
      ) : null}
      <button
        onClick={onScan}
        disabled={scanPending}
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
      >
        {scanPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Scan billing risk
      </button>
    </Panel>
  );
}

function PlanStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={cn("rounded-[8px] bg-mist p-3", danger && "ring-1 ring-coral/30")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", danger ? "text-coral" : "text-ink")}>
        {String(value).replaceAll("_", " ")}
      </p>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit?: number }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="rounded-[8px] bg-mist p-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold capitalize text-ink">{label.replace(/([A-Z])/g, " $1")}</span>
        <span className="text-steel">{limit ? `${used}/${limit}` : `${used}`}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className={cn("h-full rounded-full", pct > 85 ? "bg-coral" : "bg-pine")} style={{ width: `${limit ? pct : 12}%` }} />
      </div>
    </div>
  );
}

function WhatsAppOpsPanel({
  status,
  onboarding,
  runs,
  events
}: {
  status?: WhatsappStatus;
  onboarding?: WhatsappOnboarding;
  runs?: AutomationRun[];
  events?: WebhookEvent[];
}) {
  const queryClient = useQueryClient();
  const seedTemplates = useMutation({
    mutationFn: api.seedWhatsappTemplates,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-onboarding"] });
      void queryClient.invalidateQueries({ queryKey: ["automation-runs"] });
    }
  });
  const submitTemplate = useMutation({
    mutationFn: api.submitWhatsappTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-onboarding"] });
    }
  });
  const linkTemplate = useMutation({
    mutationFn: (input: { id: string; trigger: NonNullable<WhatsappOnboarding["templates"][number]["trigger"]> }) =>
      api.linkWhatsappTemplate(input.id, input.trigger),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-onboarding"] });
    }
  });
  const retry = useMutation({
    mutationFn: (id: string) => api.retryAutomationRun(id, "Manual retry from WhatsApp operations panel"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["automation-runs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const recentRuns = (runs ?? []).slice(0, 8);
  const recentEvents = (events ?? []).slice(0, 6);
  const failedRuns = (runs ?? []).filter((run) => run.status === "FAILED").length;
  const templates = onboarding?.templates ?? [];
  const approvedTemplates = templates.filter((template) => template.status === "APPROVED").length;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title="WhatsApp readiness" icon={MessageSquareText}>
        <div className="grid gap-3">
          <div className="rounded-[8px] bg-ink p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Meta Cloud API</p>
                <p className="mt-1 text-2xl font-semibold">{status?.provider.mode ?? "checking"}</p>
              </div>
              <Status label={status?.provider.ready ? "READY" : "SETUP"} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Live sending requires access token, phone number ID, verify token, and ideally app secret for webhook signature checks.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <ReadinessRow label="Access token" done={Boolean(status?.provider.checks.accessToken)} />
            <ReadinessRow label="Phone number ID" done={Boolean(status?.provider.checks.phoneNumberId)} />
            <ReadinessRow label="Verify token" done={Boolean(status?.provider.checks.verifyToken)} />
            <ReadinessRow label="Signature secret" done={Boolean(status?.provider.checks.appSecret)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Inbound" value={status?.messages.inbound ?? 0} />
            <MiniStat label="Outbound" value={status?.messages.outbound ?? 0} />
            <MiniStat label="Webhook fails" value={status?.webhook.failedEvents ?? 0} danger />
          </div>
          <div className="rounded-[8px] bg-mist p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Production onboarding</p>
                <p className="text-sm text-steel">{onboarding?.score ?? 0}% WhatsApp launch readiness</p>
              </div>
              <Status label={onboarding?.liveReady ? "LIVE" : "MOCK"} />
            </div>
            <div className="grid gap-2">
              {(onboarding?.steps ?? []).map((step) => (
                <ReadinessRow key={step.id} label={step.label} done={step.done} />
              ))}
            </div>
            <div className="mt-3 rounded-[8px] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Webhook URL</p>
              <p className="mt-1 break-all text-sm font-medium text-ink">{onboarding?.webhookUrl ?? "Loading..."}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Delivery monitor" icon={Send}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MiniStat label="Recent runs" value={recentRuns.length} />
          <MiniStat label="Failed runs" value={failedRuns} danger={failedRuns > 0} />
          <MiniStat label="Webhook events" value={status?.webhook.events ?? 0} />
        </div>
        <div className="grid gap-3">
          {recentRuns.map((run) => (
            <div key={run.id} className="rounded-[8px] bg-mist p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{run.trigger.replaceAll("_", " ")}</p>
                  <p className="truncate text-sm text-steel">
                    {run.customer?.name ?? run.provider} · {shortDate(run.sentAt ?? run.scheduledFor)}
                  </p>
                </div>
                <Status label={run.status} />
              </div>
              {run.error ? <p className="mt-2 text-sm font-medium text-coral">{run.error}</p> : null}
              {run.status === "FAILED" ? (
                <button
                  onClick={() => retry.mutate(run.id)}
                  disabled={retry.isPending}
                  className="mt-3 flex h-9 items-center gap-2 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  {retry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Retry
                </button>
              ) : null}
            </div>
          ))}
          <Empty show={!recentRuns.length} label="No automation deliveries yet" />
        </div>
        <div className="mt-4 rounded-[8px] bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-ink">Recent webhook events</p>
          <div className="grid gap-2">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-mist px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{event.providerEventId ?? event.id}</p>
                  <p className="text-xs text-steel">{shortDate(event.processedAt ?? event.createdAt)}</p>
                </div>
                <Status label={event.status} />
              </div>
            ))}
            <Empty show={!recentEvents.length} label="No WhatsApp webhook events yet" />
          </div>
        </div>
      </Panel>
      <Panel title="WhatsApp production templates" icon={FileText}>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MiniStat label="Templates" value={templates.length} />
          <MiniStat label="Approved" value={approvedTemplates} />
          <MiniStat label="Linked rules" value={(onboarding?.automationRules ?? []).filter((rule) => rule.whatsappTemplateId).length} />
        </div>
        <button
          onClick={() => seedTemplates.mutate()}
          disabled={seedTemplates.isPending}
          className="mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {seedTemplates.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Create default templates
        </button>
        <div className="grid gap-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-[8px] bg-mist p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{template.name}</p>
                  <p className="mt-1 text-sm text-steel">{template.trigger?.replaceAll("_", " ") ?? "Reusable"} · {template.language}</p>
                </div>
                <Status label={template.status} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-steel">{template.body}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => submitTemplate.mutate(template.id)}
                  disabled={submitTemplate.isPending}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  {submitTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit to Meta
                </button>
                {template.trigger ? (
                  <button
                    onClick={() =>
                      linkTemplate.mutate({
                        id: template.id,
                        trigger: template.trigger as NonNullable<typeof template.trigger>
                      })
                    }
                    disabled={linkTemplate.isPending}
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Wrench className="h-4 w-4" />
                    Link automation
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          <Empty show={!templates.length} label="No WhatsApp templates yet" />
        </div>
        {seedTemplates.error || submitTemplate.error || linkTemplate.error ? (
          <ErrorText error={seedTemplates.error ?? submitTemplate.error ?? linkTemplate.error} />
        ) : null}
      </Panel>
    </div>
  );
}

function MiniStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={cn("rounded-[8px] p-3", danger ? "bg-coral/10" : "bg-mist")}>
      <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", danger ? "text-coral" : "text-steel")}>{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ServiceManager({ services }: { services: Service[] }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("120");
  const [price, setPrice] = useState("199");

  function reset(service?: Service | null) {
    setEditing(service ?? null);
    setTitle(service?.title ?? "");
    setDescription(service?.description ?? "");
    setDurationMinutes(String(service?.durationMinutes ?? 120));
    setPrice(service ? String(service.priceCents / 100) : "199");
  }

  const save = useMutation({
    mutationFn: () => {
      const input = {
        title,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price)
      };
      return editing ? api.updateService(editing.id, input) : api.createService(input);
    },
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
    }
  });

  const toggle = useMutation({
    mutationFn: (service: Service) => api.updateService(service.id, { active: !service.active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["services"] });
    }
  });

  const canSave = title.trim() && Number(durationMinutes) >= 5 && Number(price) >= 0;

  return (
    <Panel title="Service catalog" icon={Settings2}>
      <div className="grid gap-3">
        {services.map((service) => (
          <Row key={service.id}>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{service.title}</p>
              <p className="truncate text-sm text-steel">
                {service.durationMinutes} min · {money(service.priceCents)}
              </p>
            </div>
            <Status label={service.active === false ? "INACTIVE" : "ACTIVE"} />
            <button
              onClick={() => reset(service)}
              className="h-9 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
            >
              Edit
            </button>
            <button
              onClick={() => toggle.mutate(service)}
              className="h-9 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink"
            >
              {service.active === false ? "Activate" : "Pause"}
            </button>
          </Row>
        ))}
        <Empty show={!services.length} label="No services yet" />
      </div>

      <div className="mt-4 rounded-[8px] bg-mist p-4">
        <p className="mb-3 font-semibold text-ink">{editing ? "Edit service" : "Add service"}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Title" value={title} onChange={setTitle} />
          <InputField label="Price" value={price} onChange={setPrice} />
          <InputField label="Duration minutes" value={durationMinutes} onChange={setDurationMinutes} />
          <InputField label="Description" value={description} onChange={setDescription} />
        </div>
        {save.error ? <ErrorText error={save.error} /> : null}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => save.mutate()}
            disabled={!canSave || save.isPending}
            className="flex h-10 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? "Save service" : "Add service"}
          </button>
          {editing ? (
            <button
              onClick={() => reset()}
              className="h-10 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function StaffManager({ staff }: { staff: StaffMember[] }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"OWNER" | "MANAGER" | "STAFF">("STAFF");
  const [password, setPassword] = useState("Password123!");

  function reset(member?: StaffMember | null) {
    setEditing(member ?? null);
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setPhone(member?.phone ?? "");
    setRole(member?.role === "OWNER" || member?.role === "MANAGER" || member?.role === "STAFF" ? member.role : "STAFF");
    setPassword("Password123!");
  }

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.updateStaff(editing.id, { name, email, phone, role })
        : api.createStaff({ name, email, phone, role, password }),
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
    }
  });

  const toggle = useMutation({
    mutationFn: (member: StaffMember) => api.updateStaff(member.id, { active: !member.active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    }
  });

  const canSave = name.trim() && /^\S+@\S+\.\S+$/.test(email) && (editing || password.length >= 8);

  return (
    <Panel title="Team roster" icon={UsersRound}>
      <div className="grid gap-3">
        {staff.map((member) => (
          <Row key={member.id}>
            <Avatar name={member.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{member.name}</p>
              <p className="truncate text-sm text-steel">{member.email}</p>
            </div>
            <Status label={member.role} />
            <Status label={member.active === false ? "INACTIVE" : "ACTIVE"} />
            <button
              onClick={() => reset(member)}
              className="h-9 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
            >
              Edit
            </button>
            <button
              onClick={() => toggle.mutate(member)}
              className="h-9 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink"
            >
              {member.active === false ? "Activate" : "Deactivate"}
            </button>
          </Row>
        ))}
        <Empty show={!staff.length} label="No staff yet" />
      </div>

      <div className="mt-4 rounded-[8px] bg-mist p-4">
        <p className="mb-3 font-semibold text-ink">{editing ? "Edit staff" : "Add staff"}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Name" value={name} onChange={setName} />
          <InputField label="Email" value={email} onChange={setEmail} />
          <InputField label="Phone" value={phone} onChange={setPhone} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as "OWNER" | "MANAGER" | "STAFF")}
              className="h-11 w-full rounded-[8px] border border-ink/10 bg-white px-3 outline-none focus:border-pine"
            >
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="OWNER">Owner</option>
            </select>
          </label>
          {!editing ? <InputField label="Temporary password" value={password} onChange={setPassword} /> : null}
        </div>
        {save.error ? <ErrorText error={save.error} /> : null}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => save.mutate()}
            disabled={!canSave || save.isPending}
            className="flex h-10 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? "Save staff" : "Add staff"}
          </button>
          {editing ? (
            <button
              onClick={() => reset()}
              className="h-10 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
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
  const queryClient = useQueryClient();
  const scanLeads = useMutation({
    mutationFn: api.scanLeadFollowUps,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["actions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
    }
  });
  const runAll = useMutation({
    mutationFn: api.schedulerRun,
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  return (
    <Panel
      title="Operational actions"
      icon={ClipboardCheck}
      action={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => scanLeads.mutate()}
            disabled={scanLeads.isPending}
            className="flex h-9 items-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {scanLeads.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            Scan leads
          </button>
          <button
            onClick={() => runAll.mutate()}
            disabled={runAll.isPending}
            className="flex h-9 items-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {runAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run scans
          </button>
        </div>
      }
    >
      {scanLeads.isSuccess ? (
        <p className="mb-3 rounded-[8px] bg-mint/30 px-3 py-2 text-sm font-semibold text-ink">
          Lead follow-up scan found {scanLeads.data.count} due leads.
        </p>
      ) : null}
      {scanLeads.error ? <ErrorText error={scanLeads.error} /> : null}
      {runAll.error ? <ErrorText error={runAll.error} /> : null}
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
              <div className="flex items-center gap-3">
                <Logo />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">
                    CrewFlow
                  </p>
                  <h2 className="text-xl font-semibold text-ink">{drawerTitle(state)}</h2>
                </div>
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
              {state.type === "customer" ? <CustomerDetail item={state.item} /> : null}
              {state.type === "invoice" ? <InvoiceDetail item={state.item} /> : null}
              {state.type === "action" ? <ActionDetail item={state.item} onDone={onClose} /> : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function NewBookingForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ["customers"], queryFn: () => api.customers() });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerNotes, setNewCustomerNotes] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState("none");
  const [repeatCount, setRepeatCount] = useState("4");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.createBooking({
        customerId: customerMode === "existing" ? customerId : undefined,
        inlineCustomer:
          customerMode === "new"
            ? {
                name: newCustomerName,
                phone: newCustomerPhone,
                email: newCustomerEmail || undefined,
                notes: newCustomerNotes || undefined
              }
            : undefined,
        serviceId,
        assignedStaffId: assignedStaffId || undefined,
        startTime: new Date(startTime).toISOString(),
        notes: notes || undefined,
        repeatFrequency: repeatFrequency as "none" | "weekly" | "biweekly" | "monthly",
        repeatCount: repeatFrequency === "none" ? undefined : Number(repeatCount) || 1
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      onDone();
    }
  });

  const hasCustomer =
    customerMode === "existing"
      ? Boolean(customerId)
      : Boolean(newCustomerName.trim() && newCustomerPhone.trim());
  const canSubmit = hasCustomer && serviceId && startTime;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) create.mutate();
      }}
    >
      <div className="grid grid-cols-2 gap-2 rounded-[8px] bg-mist p-1">
        {(["existing", "new"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setCustomerMode(mode)}
            className={cn(
              "h-10 rounded-[8px] text-sm font-semibold transition",
              customerMode === mode ? "bg-white text-ink shadow-soft" : "text-steel hover:text-ink"
            )}
          >
            {mode === "existing" ? "Existing customer" : "New lead"}
          </button>
        ))}
      </div>

      {customerMode === "existing" ? (
        <SelectField label="Customer" value={customerId} onChange={setCustomerId}>
          <option value="">Choose customer</option>
          {(customers.data ?? []).map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.phone}
            </option>
          ))}
        </SelectField>
      ) : (
        <div className="rounded-[8px] bg-mist p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Lead name" value={newCustomerName} onChange={setNewCustomerName} />
            <InputField label="Phone" value={newCustomerPhone} onChange={setNewCustomerPhone} />
            <InputField label="Email" value={newCustomerEmail} onChange={setNewCustomerEmail} />
            <InputField label="Customer notes" value={newCustomerNotes} onChange={setNewCustomerNotes} />
          </div>
        </div>
      )}

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
      <div className="grid gap-3 md:grid-cols-[1fr_140px]">
        <SelectField label="Repeat" value={repeatFrequency} onChange={setRepeatFrequency}>
          <option value="none">One-time</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 weeks</option>
          <option value="monthly">Monthly</option>
        </SelectField>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Occurrences</span>
          <input
            type="number"
            min={1}
            max={12}
            disabled={repeatFrequency === "none"}
            value={repeatFrequency === "none" ? "1" : repeatCount}
            onChange={(event) => setRepeatCount(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine disabled:opacity-50"
          />
        </label>
      </div>
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
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ["customers"], queryFn: () => api.customers() });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });
  const [customerId, setCustomerId] = useState(item.customer.id);
  const [serviceId, setServiceId] = useState(item.service.id);
  const [assignedStaffId, setAssignedStaffId] = useState(item.assignedStaff?.id ?? "");
  const [status, setStatus] = useState<BookingStatus>(item.status);
  const [startTime, setStartTime] = useState(toDateTimeLocal(item.startTime));
  const [notes, setNotes] = useState(item.notes ?? "");

  const update = useMutation({
    mutationFn: () =>
      api.updateBooking(item.id, {
        customerId,
        serviceId,
        assignedStaffId: assignedStaffId || undefined,
        status,
        startTime: new Date(startTime).toISOString(),
        notes: notes || undefined
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  const quickStatus = useMutation({
    mutationFn: (nextStatus: BookingStatus) => api.updateBooking(item.id, { status: nextStatus, serviceId }),
    onSuccess: (booking) => {
      setStatus(booking.status);
      void queryClient.invalidateQueries();
    }
  });
  const createInvoice = useMutation({
    mutationFn: () => api.createInvoiceFromBooking(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  return (
    <div className="grid gap-4">
      <DetailCard icon={CalendarDays} title="Booking controls">
        <div className="grid gap-3">
          <SelectField label="Customer" value={customerId} onChange={setCustomerId}>
            {(customers.data ?? [item.customer]).map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} · {customer.phone}
              </option>
            ))}
          </SelectField>
          <SelectField label="Service" value={serviceId} onChange={setServiceId}>
            {(services.data ?? [item.service]).map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} · {money(service.priceCents)}
              </option>
            ))}
          </SelectField>
          <SelectField label="Staff" value={assignedStaffId} onChange={setAssignedStaffId}>
            <option value="">Unassigned</option>
            {(staff.data ?? []).map((member) => (
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
              className="h-11 w-full rounded-[8px] border border-ink/10 bg-white px-3 outline-none focus:border-pine"
            />
          </label>
          <SelectField label="Status" value={status} onChange={(value) => setStatus(value as BookingStatus)}>
            <option value="REQUESTED">Requested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">On the way</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No-show</option>
            <option value="CANCELLED">Cancelled</option>
          </SelectField>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-[8px] border border-ink/10 bg-white p-3 outline-none focus:border-pine"
            />
          </label>
        </div>
        {update.error ? <ErrorText error={update.error} /> : null}
        {quickStatus.error ? <ErrorText error={quickStatus.error} /> : null}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
          <button
            onClick={() => quickStatus.mutate("IN_PROGRESS")}
            disabled={quickStatus.isPending || status !== "CONFIRMED"}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            <Route className="h-4 w-4" />
            On the way
          </button>
          <button
            onClick={() => quickStatus.mutate("COMPLETED")}
            disabled={quickStatus.isPending || !["CONFIRMED", "IN_PROGRESS"].includes(status)}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </button>
          <button
            onClick={() => quickStatus.mutate("NO_SHOW")}
            disabled={quickStatus.isPending || status !== "CONFIRMED"}
            className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-coral/10 px-3 text-sm font-semibold text-coral disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            No-show
          </button>
        </div>
      </DetailCard>
      <DetailCard icon={ContactRound} title={item.customer.name}>
        <Info label="Phone" value={item.customer.phone} />
        <Info label="Email" value={item.customer.email ?? "No email"} />
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
      ) : status === "COMPLETED" ? (
        <button
          onClick={() => createInvoice.mutate()}
          disabled={createInvoice.isPending}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
        >
          {createInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Create invoice
        </button>
      ) : null}
      {createInvoice.error ? <ErrorText error={createInvoice.error} /> : null}
      {item.fieldJobReport ? (
        <DetailCard icon={Route} title="Field report">
          <Info label="Status" value={item.fieldJobReport.status} />
          <Info label="Started" value={shortDate(item.fieldJobReport.startedAt)} />
          <Info label="Completed" value={shortDate(item.fieldJobReport.completedAt)} />
          {item.fieldJobReport.staffNotes ? <Info label="Staff notes" value={item.fieldJobReport.staffNotes} /> : null}
        </DetailCard>
      ) : null}
      <BookingCommunicationPanel booking={item} />
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
      <BookingCommunicationPanel booking={item} />
    </div>
  );
}

function BookingCommunicationPanel({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const communication = useQuery({
    queryKey: ["booking-communication", booking.id],
    queryFn: () => api.bookingCommunication(booking.id)
  });
  const send = useMutation({
    mutationFn: (type: BookingUpdateType) =>
      api.sendBookingUpdate(booking.id, {
        type,
        provider: "WHATSAPP",
        note: note || undefined
      }),
    onSuccess: () => {
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["booking-communication", booking.id] });
      void queryClient.invalidateQueries({ queryKey: ["communication-health"] });
    }
  });

  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Customer updates</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">Communication center</h3>
        </div>
        <Status label={`${communication.data?.timeline.length ?? 0} logs`} />
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-ink">Optional note</span>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Arrival window, gate code request, delay reason..."
          className="h-11 w-full rounded-[8px] border border-ink/10 bg-white px-3 outline-none focus:border-pine"
        />
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(communication.data?.suggestions ?? []).map((item) => (
          <button
            key={item.type}
            onClick={() => send.mutate(item.type)}
            disabled={send.isPending}
            className={cn(
              "rounded-[8px] p-3 text-left text-sm font-semibold transition disabled:opacity-50",
              item.sent ? "bg-white text-steel" : "bg-pine text-white"
            )}
          >
            <span className="flex items-center justify-between gap-2">
              {item.label}
              {item.sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </span>
            <span className={cn("mt-2 line-clamp-2 block text-xs leading-5", item.sent ? "text-steel" : "text-white/75")}>
              {item.preview}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => send.mutate("RUNNING_LATE")}
        disabled={send.isPending}
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-3 text-sm font-semibold text-ink disabled:opacity-50"
      >
        {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
        Send running late
      </button>

      {send.error ? <ErrorText error={send.error} /> : null}

      <div className="mt-4 grid gap-2">
        {(communication.data?.timeline ?? []).slice(0, 6).map((event) => (
          <div key={`${event.kind}-${event.id}`} className="rounded-[8px] bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-ink">{event.title}</p>
              <Status label={event.status} />
            </div>
            {event.content ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-steel">{event.content}</p> : null}
            {event.error ? <p className="mt-2 text-sm font-semibold text-coral">{event.error}</p> : null}
          </div>
        ))}
        <Empty show={!communication.isLoading && !(communication.data?.timeline.length)} label="No booking updates yet" />
      </div>
    </section>
  );
}

function ConversationDetail({ item }: { item: Conversation }) {
  const queryClient = useQueryClient();
  const full = useQuery({
    queryKey: ["conversation", item.id],
    queryFn: () => api.conversation(item.id)
  });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff });
  const services = useQuery({ queryKey: ["services"], queryFn: api.services });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: api.invoices });
  const [reply, setReply] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [startTime, setStartTime] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const conversation = full.data ?? item;
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
  const updateConversation = useMutation({
    mutationFn: (input: { status?: string; assignedToId?: string; followUpAt?: string }) =>
      api.updateConversation(item.id, input),
    onSuccess: () => void queryClient.invalidateQueries()
  });
  const convertLead = useMutation({
    mutationFn: () =>
      api.convertConversationToLead(item.id, {
        title: `${conversation.customer?.name ?? "Customer"} ${conversation.channel} inquiry`,
        status: "QUALIFIED",
        source: conversation.channel === "WHATSAPP" ? "WHATSAPP" : "WEB_CHAT",
        followUpAt: followUpAt ? new Date(followUpAt).toISOString() : undefined
      }),
    onSuccess: () => void queryClient.invalidateQueries()
  });
  const sendQuote = useMutation({
    mutationFn: () => api.sendConversationQuote(item.id, selectedServiceId, bookingNotes || undefined),
    onSuccess: () => void queryClient.invalidateQueries()
  });
  const sendInvoiceLink = useMutation({
    mutationFn: () => api.sendConversationInvoiceLink(item.id, selectedInvoiceId, "Here is your secure payment link."),
    onSuccess: () => void queryClient.invalidateQueries()
  });
  const customerInvoices = (invoices.data ?? []).filter((invoice) => invoice.customer.id === conversation.customer?.id && invoice.status !== "PAID" && invoice.status !== "VOID");
  const activeIntent = conversation.bookingIntents?.find((intent) =>
    ["READY", "COLLECTING"].includes(intent.status)
  );
  const bookIntent = useMutation({
    mutationFn: () =>
      api.bookConversationIntent(conversation.id, activeIntent!.id, {
        startTime: new Date(startTime).toISOString(),
        assignedStaffId: assignedStaffId || undefined,
        status: "CONFIRMED",
        notes: bookingNotes || undefined
      }),
    onSuccess: () => {
      setStartTime("");
      setAssignedStaffId("");
      setBookingNotes("");
      void queryClient.invalidateQueries();
    }
  });
  const canBook = Boolean(activeIntent?.service && conversation.customer && startTime);

  return (
    <div className="grid gap-4">
      <DetailCard icon={MessageSquareText} title={conversation.customer?.name ?? "New inquiry"}>
        <Info label="Channel" value={conversation.channel} />
        <Info label="Status" value={conversation.status} />
        <Info label="Last message" value={shortDate(conversation.lastMessageAt)} />
        {conversation.leads?.[0] ? <Info label="Lead" value={`${conversation.leads[0].status} · ${money(conversation.leads[0].estimatedValueCents)}`} /> : null}
      </DetailCard>

      <section className="rounded-[8px] bg-mist p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Conversion controls</p>
            <p className="text-sm text-steel">Turn this chat into booked or paid revenue.</p>
          </div>
          <Status label={conversation.assignedToId ? "ASSIGNED" : "UNASSIGNED"} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={assignedStaffId}
            onChange={(event) => {
              setAssignedStaffId(event.target.value);
              if (event.target.value) updateConversation.mutate({ assignedToId: event.target.value });
            }}
            className="h-11 rounded-[8px] border border-ink/10 bg-white px-3 text-sm outline-none focus:border-pine"
          >
            <option value="">Assign conversation</option>
            {(staff.data ?? []).map((member) => (
              <option key={member.id} value={member.id}>{member.name} · {member.role}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
            className="h-11 rounded-[8px] border border-ink/10 bg-white px-3 text-sm outline-none focus:border-pine"
          />
          <select
            value={selectedServiceId}
            onChange={(event) => setSelectedServiceId(event.target.value)}
            className="h-11 rounded-[8px] border border-ink/10 bg-white px-3 text-sm outline-none focus:border-pine"
          >
            <option value="">Choose service for quote</option>
            {(services.data ?? []).map((service) => (
              <option key={service.id} value={service.id}>{service.title} · {money(service.priceCents)}</option>
            ))}
          </select>
          <select
            value={selectedInvoiceId}
            onChange={(event) => setSelectedInvoiceId(event.target.value)}
            className="h-11 rounded-[8px] border border-ink/10 bg-white px-3 text-sm outline-none focus:border-pine"
          >
            <option value="">Choose invoice to send</option>
            {customerInvoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>{invoice.invoiceNo} · {money(invoice.totalCents)}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <button
            onClick={() => convertLead.mutate()}
            disabled={convertLead.isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {convertLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            Lead
          </button>
          <button
            onClick={() => sendQuote.mutate()}
            disabled={!selectedServiceId || sendQuote.isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sendQuote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
            Quote
          </button>
          <button
            onClick={() => sendInvoiceLink.mutate()}
            disabled={!selectedInvoiceId || sendInvoiceLink.isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sendInvoiceLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Pay link
          </button>
          <button
            onClick={() => updateConversation.mutate({ status: "RESOLVED" })}
            disabled={updateConversation.isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-mint px-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolve
          </button>
        </div>
        {convertLead.error || sendQuote.error || sendInvoiceLink.error || updateConversation.error ? (
          <ErrorText error={convertLead.error ?? sendQuote.error ?? sendInvoiceLink.error ?? updateConversation.error} />
        ) : null}
      </section>

      {activeIntent ? (
        <section className="rounded-[8px] bg-ink p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">Revenue intake</p>
              <h3 className="mt-2 text-xl font-semibold">
                {activeIntent.service?.title ?? "Service not selected"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/72">
                {activeIntent.quotedPriceCents ? `${money(activeIntent.quotedPriceCents)} quote captured` : "Quote pending"} · {activeIntent.preferredWindow ?? "No preferred window"}
              </p>
            </div>
            <Status label={activeIntent.status} />
          </div>
          <div className="mt-4 grid gap-3">
            {activeIntent.missingFields?.length ? (
              <p className="rounded-[8px] bg-white/10 px-3 py-2 text-sm font-medium text-white">
                Missing: {activeIntent.missingFields.join(", ")}
              </p>
            ) : null}
            {activeIntent.address ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Address</p>
                <p className="mt-1 text-sm font-medium text-white">{activeIntent.address}</p>
              </div>
            ) : null}
            {activeIntent.notes ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Notes</p>
                <p className="mt-1 text-sm font-medium text-white">{activeIntent.notes}</p>
              </div>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Confirmed start time</span>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-11 w-full rounded-[8px] border border-white/10 bg-white px-3 text-ink outline-none focus:border-mint"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Assign staff</span>
              <select
                value={assignedStaffId}
                onChange={(event) => setAssignedStaffId(event.target.value)}
                className="h-11 w-full rounded-[8px] border border-white/10 bg-white px-3 text-ink outline-none focus:border-mint"
              >
                <option value="">Unassigned</option>
                {(staff.data ?? []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.role}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={bookingNotes}
              onChange={(event) => setBookingNotes(event.target.value)}
              placeholder="Booking notes for crew..."
              className="min-h-20 w-full rounded-[8px] border border-white/10 bg-white p-3 text-ink outline-none focus:border-mint"
            />
            <button
              onClick={() => bookIntent.mutate()}
              disabled={!canBook || bookIntent.isPending}
              className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mint px-4 font-semibold text-ink disabled:opacity-50"
            >
              {bookIntent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
              Book this lead
            </button>
            {bookIntent.error ? <ErrorText error={bookIntent.error} /> : null}
          </div>
        </section>
      ) : null}

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

function CustomerDetail({ item }: { item: Customer }) {
  const timeline = useQuery({
    queryKey: ["customer-timeline", item.id],
    queryFn: () => api.customerTimeline(item.id)
  });
  const summary = timeline.data?.summary;

  return (
    <div className="grid gap-4">
      <DetailCard icon={ContactRound} title={item.name}>
        <Info label="Phone" value={item.phone} />
        <Info label="Email" value={item.email ?? "Not captured"} />
        {item.notes ? <Info label="Notes" value={item.notes} /> : null}
      </DetailCard>

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] bg-mist p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Paid revenue</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{money(summary.paidTotalCents)}</p>
          </div>
          <div className="rounded-[8px] bg-coral/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Open invoices</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{money(summary.openInvoiceCents)}</p>
          </div>
          <div className="rounded-[8px] bg-mist p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Last booking</p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {summary.lastBooking ? `${summary.lastBooking.service.title} · ${shortDate(summary.lastBooking.startTime)}` : "None yet"}
            </p>
          </div>
          <div className="rounded-[8px] bg-mint/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">Next booking</p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {summary.nextBooking ? `${summary.nextBooking.service.title} · ${shortDate(summary.nextBooking.startTime)}` : "Not scheduled"}
            </p>
          </div>
        </div>
      ) : null}

      <DetailCard icon={Clock3} title="Timeline">
        {timeline.isLoading ? (
          <div className="flex min-h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-pine" />
          </div>
        ) : null}
        {(timeline.data?.items ?? []).slice(0, 12).map((event, index) => (
          <div key={`${event.type}-${event.occurredAt}-${index}`} className="rounded-[8px] bg-white p-3">
            <p className="text-sm font-semibold text-ink">{event.type.replaceAll("_", " ")}</p>
            <p className="mt-1 text-xs text-steel">{shortDate(event.occurredAt)}</p>
          </div>
        ))}
        <Empty show={!timeline.isLoading && !(timeline.data?.items.length)} label="No customer activity yet" />
      </DetailCard>
    </div>
  );
}

function parseCustomerCsv(value: string) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hasHeader = lines[0]?.toLowerCase().includes("name") && lines[0]?.toLowerCase().includes("phone");
  const rows = hasHeader ? lines.slice(1) : lines;

  return rows
    .map((line) => {
      const [name = "", phone = "", email = "", notes = ""] = line.split(",").map((item) => item.trim());
      return { name, phone, email, notes };
    })
    .filter((row) => row.name && row.phone);
}

function InvoiceDetail({ item }: { item: Invoice }) {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(item);
  const paymentLink = useMutation({
    mutationFn: () => api.createPaymentLink(current.id),
    onSuccess: (result) => {
      setCurrent(result.invoice);
      void queryClient.invalidateQueries();
    }
  });
  const updateStatus = useMutation({
    mutationFn: (status: InvoiceStatus) => api.updateInvoiceStatus(current.id, status),
    onSuccess: (invoice) => {
      setCurrent(invoice);
      void queryClient.invalidateQueries();
    }
  });

  return (
    <div className="grid gap-4">
      <DetailCard icon={CreditCard} title={current.invoiceNo}>
        <Info label="Customer" value={current.customer.name} />
        {current.booking?.service ? <Info label="Booking" value={current.booking.service.title} /> : null}
        <Info label="Due" value={shortDate(current.dueDate)} />
        <Info label="Subtotal" value={money(current.subtotalCents ?? current.totalCents)} />
        <Info label="Tax" value={money(current.taxCents ?? 0)} />
        <Info label="Total" value={money(current.totalCents)} />
        <Info label="Status" value={current.status} />
        {current.paymentUrl ? <Info label="Payment link" value="Ready" /> : null}
      </DetailCard>

      {current.lineItems?.length ? (
        <DetailCard icon={FileText} title="Line items">
          {current.lineItems.map((line) => (
            <div key={line.id} className="flex items-center justify-between rounded-[8px] bg-white p-3">
              <div>
                <p className="font-semibold text-ink">{line.description}</p>
                <p className="text-sm text-steel">
                  {line.quantity} × {money(line.unitCents)}
                </p>
              </div>
              <p className="font-semibold text-ink">{money(line.totalCents)}</p>
            </div>
          ))}
        </DetailCard>
      ) : null}

      <button
        onClick={() => paymentLink.mutate()}
        disabled={paymentLink.isPending || current.status === "PAID" || current.status === "VOID"}
        className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50"
      >
        {paymentLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Create payment link
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => updateStatus.mutate("SENT")}
          disabled={updateStatus.isPending || current.status !== "DRAFT"}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Mark sent
        </button>
        <button
          onClick={() => updateStatus.mutate("PAID")}
          disabled={updateStatus.isPending || !["SENT", "OVERDUE"].includes(current.status)}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mint px-3 text-sm font-semibold text-ink disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark paid
        </button>
        <button
          onClick={() => updateStatus.mutate("OVERDUE")}
          disabled={updateStatus.isPending || current.status !== "SENT"}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-coral/10 px-3 text-sm font-semibold text-coral disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Mark overdue
        </button>
        <button
          onClick={() => updateStatus.mutate("VOID")}
          disabled={updateStatus.isPending || !["DRAFT", "SENT", "OVERDUE"].includes(current.status)}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Void
        </button>
      </div>
      {current.paymentUrl ? (
        <a
          href={current.paymentUrl}
          target="_blank"
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-mist px-4 font-semibold text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          Open payment page
        </a>
      ) : null}
      {paymentLink.error ? <ErrorText error={paymentLink.error} /> : null}
      {updateStatus.error ? <ErrorText error={updateStatus.error} /> : null}
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
  if (state.type === "customer") return "Customer profile";
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
    <div className="relative h-11 w-11 overflow-hidden rounded-[8px] bg-ink shadow-soft">
      <Image src={logoMark} alt="CrewFlow" fill sizes="44px" className="object-cover" />
    </div>
  );
}

function titleFor(view: View) {
  return {
    overview: "Operations overview",
    inbox: "Customer inbox",
    leads: "Lead pipeline CRM",
    retention: "Customer retention",
    customers: "Customer manager",
    bookings: "Booking board",
    field: "Field operations",
    money: "Invoices and payments",
    actions: "Manager action queue",
    settings: "Tenant settings"
  }[view];
}
