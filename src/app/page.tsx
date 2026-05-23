"use client";

import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Headphones,
  HeartPulse,
  Inbox,
  Loader2,
  LogOut,
  MessageSquareText,
  Play,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench
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
  OperationalAction,
  Payment
} from "@/lib/api";
import { cn, initials, money, shortDate } from "@/lib/utils";
import { useAuth } from "@/store/auth";

const nav = [
  { id: "overview", label: "Overview", icon: HeartPulse },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "field", label: "Field", icon: Route },
  { id: "money", label: "Money", icon: CreditCard },
  { id: "actions", label: "Actions", icon: ClipboardCheck }
] as const;

type View = (typeof nav)[number]["id"];

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
                <p className="text-sm font-medium text-steel">Sparkle Home Services</p>
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
                <Overview data={dashboard.data} actions={actions.data} loading={dashboard.isLoading} />
              ) : null}
              {view === "inbox" ? <InboxView items={inbox.data} /> : null}
              {view === "bookings" ? <BookingsView items={bookings.data} /> : null}
              {view === "field" ? <FieldView items={field.data} /> : null}
              {view === "money" ? <MoneyView invoices={invoices.data} payments={payments.data} /> : null}
              {view === "actions" ? <ActionsView items={actions.data} /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

function Overview({
  data,
  actions,
  loading
}: {
  data?: DashboardSummary;
  actions?: OperationalAction[];
  loading: boolean;
}) {
  if (loading) return <LoadingPanel />;
  return (
    <div className="grid gap-4">
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
          <ActionList items={actions?.slice(0, 5)} />
        </Panel>
      </div>

      <Panel title="Today’s appointments" icon={Clock3}>
        <BookingRows items={data?.today.appointments} />
      </Panel>
    </div>
  );
}

function InboxView({ items }: { items?: Conversation[] }) {
  return (
    <Panel title="Customer inbox" icon={MessageSquareText}>
      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <Row key={item.id}>
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

function BookingsView({ items }: { items?: Booking[] }) {
  return (
    <Panel title="Booking board" icon={CalendarDays}>
      <BookingRows items={items} />
    </Panel>
  );
}

function FieldView({ items }: { items?: Booking[] }) {
  const queryClient = useQueryClient();
  const complete = useMutation({
    mutationFn: (bookingId: string) => api.completeFieldJob(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    }
  });

  return (
    <Panel title="Field jobs" icon={Route}>
      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <Row key={item.id}>
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
            {item.status !== "COMPLETED" ? (
              <button
                onClick={() => complete.mutate(item.id)}
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
  payments
}: {
  invoices?: Invoice[];
  payments?: Payment[];
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
            <Row key={invoice.id}>
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

function ActionsView({ items }: { items?: OperationalAction[] }) {
  return (
    <Panel title="Operational actions" icon={ClipboardCheck}>
      <ActionList items={items} />
    </Panel>
  );
}

function ActionList({ items }: { items?: OperationalAction[] }) {
  return (
    <div className="grid gap-3">
      {(items ?? []).map((item) => (
        <Row key={item.id}>
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

function BookingRows({ items }: { items?: Booking[] }) {
  return (
    <div className="grid gap-3">
      {(items ?? []).map((item) => (
        <Row key={item.id}>
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
  children
}: {
  title: string;
  icon: typeof Inbox;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-mist text-pine">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
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

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[64px] items-center gap-3 rounded-[8px] border border-ink/5 bg-mist/80 p-3">
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
    actions: "Manager action queue"
  }[view];
}
