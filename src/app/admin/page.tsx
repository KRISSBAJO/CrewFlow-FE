"use client";

import {
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  TimerReset,
  UsersRound
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import {
  api,
  PlatformAuditLog,
  PlatformAutomationFailure,
  PlatformBillingEvent,
  PlatformBillingEventType,
  PlatformBillingSummary,
  PlatformMetrics,
  Readiness,
  PlatformSupportAccess,
  PlatformSupportNote,
  PlatformTenant,
  PlatformTenantDetail,
  PlatformTenantHealth,
  PlatformTenantUsage,
  PlatformWebhookFailure
} from "@/lib/api";
import { cn, money, shortDate } from "@/lib/utils";
import { useAuth } from "@/store/auth";

type AdminSection = "overview" | "tenants" | "failures" | "audit";

const adminNav: Array<{ id: AdminSection; label: string; icon: typeof ShieldCheck }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "failures", label: "Failures", icon: AlertTriangle },
  { id: "audit", label: "Audit", icon: ShieldCheck }
];

const tenantStatuses: PlatformTenant["status"][] = ["TRIAL", "ACTIVE", "SUSPENDED", "CHURNED"];
const subscriptionStatuses: NonNullable<PlatformTenant["subscriptionStatus"]>[] = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "UNPAID"
];

export default function AdminPage() {
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  if (!token || user?.role !== "PLATFORM_ADMIN") {
    return <AdminLogin />;
  }
  return <AdminConsole />;
}

function AdminLogin() {
  const setSession = useAuth((state) => state.setSession);
  const [email, setEmail] = useState("admin@crewflow.test");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const login = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (data) => {
      if (data.user.role !== "PLATFORM_ADMIN") {
        setError("This account is not a platform admin.");
        return;
      }
      setSession(data.accessToken, data.user);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Login failed")
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    login.mutate();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[8px] border border-white/80 bg-white/90 p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-ink text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Platform admin</h1>
            <p className="text-sm text-steel">CrewFlow control center</p>
          </div>
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-ink">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-[8px] border border-ink/10 bg-mist px-3 outline-none focus:border-pine" />
        </label>
        {error ? <p className="mt-4 rounded-[8px] bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{error}</p> : null}
        <button disabled={login.isPending} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-pine px-4 font-semibold text-white disabled:opacity-50">
          {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Sign in
        </button>
      </form>
    </main>
  );
}

function AdminConsole() {
  const logout = useAuth((state) => state.logout);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>("overview");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const metrics = useQuery({ queryKey: ["platform-metrics"], queryFn: api.platformMetrics });
  const tenants = useQuery({ queryKey: ["platform-tenants"], queryFn: api.platformTenants });
  const automationFailures = useQuery({ queryKey: ["platform-automation-failures"], queryFn: api.platformAutomationFailures });
  const webhookFailures = useQuery({ queryKey: ["platform-webhook-failures"], queryFn: api.platformWebhookFailures });
  const audit = useQuery({ queryKey: ["platform-audit"], queryFn: api.platformAudit });
  const readiness = useQuery({
    queryKey: ["platform-readiness"],
    queryFn: api.readiness,
    refetchInterval: 60_000
  });
  const filteredTenants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return tenants.data ?? [];
    return (tenants.data ?? []).filter((tenant) =>
      [
        tenant.businessName,
        tenant.slug,
        tenant.industry,
        tenant.status,
        tenant.subscriptionStatus ?? "",
        tenant.subscriptionPlan
      ].join(" ").toLowerCase().includes(needle)
    );
  }, [search, tenants.data]);
  const selectedTenant = filteredTenants.find((tenant) => tenant.id === selectedTenantId) ?? null;

  return (
    <main className="min-h-screen p-3 md:p-4">
      <div className="mx-auto grid max-w-[1800px] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-ink text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">CrewFlow Admin</p>
              <p className="truncate text-xs text-steel">Platform operations</p>
            </div>
          </div>
          <nav className="grid gap-1">
            {adminNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[8px] px-3 text-left text-sm font-semibold transition",
                  section === item.id ? "bg-pine text-white" : "text-steel hover:bg-mist hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-[8px] bg-mist p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">System</p>
            <div className="mt-3 grid gap-2 text-sm font-medium text-ink">
              <span>{readiness.data?.environment ?? "checking"}</span>
              <span>{readiness.data?.productionReady ? "Production ready" : `${readiness.data?.warnings.length ?? 0} warnings`}</span>
              <span>{metrics.data?.tenantStatus.ACTIVE ?? 0} active tenants</span>
            </div>
          </div>
          <button onClick={logout} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <section className="grid min-w-0 gap-4">
          <header className="rounded-[8px] border border-white/80 bg-white/90 p-5 shadow-soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">CrewFlow</p>
                <h1 className="text-2xl font-semibold text-ink md:text-3xl">Platform control center</h1>
                <p className="mt-1 max-w-3xl text-sm text-steel">
                  Manage tenants, billing, support access, launch readiness, failures, and audit history.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => queryClient.invalidateQueries()} className="flex h-10 items-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </header>

          {section === "overview" ? (
            <>
              <ReadinessPanel
                data={readiness.data}
                loading={readiness.isLoading}
                error={readiness.error}
                onRefresh={() => void readiness.refetch()}
              />
              <Metrics data={metrics.data} readiness={readiness.data} />
              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <PlatformSummary data={metrics.data} tenants={tenants.data} />
                <Panel title="Failure monitor" icon={AlertTriangle}>
                  <FailureList automation={automationFailures.data} webhooks={webhookFailures.data} />
                </Panel>
              </div>
            </>
          ) : null}

          {section === "tenants" ? (
            <section className="grid min-w-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <Panel title="Tenants" icon={Building2}>
                <div className="mb-4 flex h-11 items-center gap-2 rounded-[8px] bg-mist px-3">
                  <Search className="h-4 w-4 text-steel" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tenants, plans, status..."
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="grid gap-3">
                  {filteredTenants.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      selected={selectedTenantId === tenant.id}
                      onSelect={() => setSelectedTenantId(tenant.id)}
                    />
                  ))}
                  {!filteredTenants.length ? <Empty label="No tenants found" /> : null}
                </div>
              </Panel>
              {selectedTenantId ? (
                <TenantDetail tenantId={selectedTenantId} />
              ) : (
                <Panel title="Select tenant" icon={SlidersHorizontal}>
                  <div className="flex min-h-[360px] items-center justify-center rounded-[8px] bg-mist p-6 text-center">
                    <div>
                      <Building2 className="mx-auto h-8 w-8 text-pine" />
                      <p className="mt-3 font-semibold text-ink">Choose a tenant to control</p>
                      <p className="mt-1 text-sm text-steel">Status, subscription, pricing, support access, billing, feature flags, and limits live here.</p>
                    </div>
                  </div>
                </Panel>
              )}
            </section>
          ) : null}

          {section === "failures" ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <Panel title="Automation failures" icon={Activity}>
                <FailureList automation={automationFailures.data} />
              </Panel>
              <Panel title="Webhook failures" icon={AlertTriangle}>
                <FailureList webhooks={webhookFailures.data} />
              </Panel>
            </div>
          ) : null}

          {section === "audit" ? (
            <Panel title="Audit stream" icon={ShieldCheck}>
              <AuditList items={audit.data} />
            </Panel>
          ) : null}

          {section !== "tenants" && selectedTenant ? (
            <button
              onClick={() => setSection("tenants")}
              className="fixed bottom-5 right-5 rounded-[8px] bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft"
            >
              Managing {selectedTenant.businessName}
            </button>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Metrics({ data, readiness }: { data?: PlatformMetrics; readiness?: Readiness }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Building2} label="Active tenants" value={data?.tenantStatus.ACTIVE ?? 0} />
      <Metric icon={CreditCard} label="Monthly recurring revenue" value={money(data?.mrrCents)} />
      <Metric icon={AlertTriangle} label="Past-due tenants" value={data?.pastDueTenants ?? 0} danger={(data?.pastDueTenants ?? 0) > 0} />
      <Metric icon={UsersRound} label={readiness?.productionReady ? "Active users" : "Launch blockers"} value={readiness?.productionReady ? data?.activeUsers ?? 0 : readiness?.warnings.length ?? 0} danger={!readiness?.productionReady} />
    </div>
  );
}

function PlatformSummary({ data, tenants }: { data?: PlatformMetrics; tenants?: PlatformTenant[] }) {
  const atRisk = (tenants ?? []).filter((tenant) =>
    tenant.status === "SUSPENDED" ||
    tenant.subscriptionStatus === "PAST_DUE" ||
    tenant.subscriptionStatus === "UNPAID"
  );
  return (
    <Panel title="Operator command board" icon={ListChecks}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <CommandStat label="Total tenants" value={(tenants ?? []).length} />
        <CommandStat label="Bookings" value={data?.bookings ?? 0} />
        <CommandStat label="Open actions" value={data?.openActions ?? 0} danger={(data?.openActions ?? 0) > 20} />
        <CommandStat label="Failed automations" value={data?.failedAutomations ?? 0} danger={(data?.failedAutomations ?? 0) > 0} />
        <CommandStat label="Failed webhooks" value={data?.failedWebhooks ?? 0} danger={(data?.failedWebhooks ?? 0) > 0} />
        <CommandStat label="Paid revenue" value={money(data?.paidRevenueCents)} />
      </div>
      <div className="mt-4 grid gap-2">
        {atRisk.slice(0, 5).map((tenant) => (
          <div key={tenant.id} className="flex items-center justify-between rounded-[8px] bg-coral/10 p-3">
            <div>
              <p className="font-semibold text-ink">{tenant.businessName}</p>
              <p className="text-sm text-steel">{tenant.subscriptionStatus ?? tenant.status}</p>
            </div>
            <Status label={tenant.status} />
          </div>
        ))}
        {!atRisk.length ? <Empty label="No at-risk tenants" /> : null}
      </div>
    </Panel>
  );
}

function CommandStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={cn("rounded-[8px] bg-mist p-3 ring-1", danger ? "ring-coral/25" : "ring-ink/5")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold", danger ? "text-coral" : "text-ink")}>{value}</p>
    </div>
  );
}

function ReadinessPanel({
  data,
  loading,
  error,
  onRefresh
}: {
  data?: Readiness;
  loading: boolean;
  error: unknown;
  onRefresh: () => void;
}) {
  const warnings = data?.warnings ?? [];
  const healthy = Boolean(data?.productionReady);
  const checks = data?.checks;
  return (
    <Panel title="System readiness" icon={ServerCog}>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className={cn("rounded-[8px] p-4", healthy ? "bg-pine text-white" : "bg-coral text-white")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-80">Launch posture</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "Checking" : healthy ? "Ready" : "Needs work"}</p>
            </div>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : healthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>
          <div className="mt-5 grid gap-2 text-sm font-medium opacity-90 sm:grid-cols-3">
            <span>{data?.environment ?? "environment"}</span>
            <span>{data?.status ?? "unknown"}</span>
            <span>{data ? `${data.latencyMs}ms` : "latency"}</span>
          </div>
          <button onClick={onRefresh} className="mt-5 inline-flex h-10 items-center gap-2 rounded-[8px] bg-white/15 px-3 text-sm font-semibold text-white ring-1 ring-white/20">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ReadinessCheck label="Database" value={checks?.database ?? "checking"} good={checks?.database === "ok"} />
          <ReadinessCheck label="Security" value={`${checks?.security.corsOrigins ?? 0} origins`} good={Boolean(checks?.security.rateLimitEnabled && checks.security.jwtConfigured)} />
          <ReadinessCheck label="WhatsApp" value={checks?.integrations.whatsapp.mode ?? "checking"} good={Boolean(checks?.integrations.whatsapp.configured && checks.integrations.whatsapp.appSecretConfigured)} muted={checks?.integrations.whatsapp.mode === "mock"} />
          <ReadinessCheck label="Scheduler" value={checks?.scheduler.enabled ? "enabled" : "off"} good={Boolean(checks?.scheduler.enabled)} muted={!checks?.scheduler.enabled} />
          <ReadinessCheck label="Stripe" value={checks?.integrations.stripe.configured ? "configured" : "mock"} good={Boolean(checks?.integrations.stripe.configured && checks.integrations.stripe.webhookSecretConfigured)} muted={!checks?.integrations.stripe.configured} />
          <ReadinessCheck label="OpenAI" value={checks?.integrations.openai.configured ? checks.integrations.openai.model : "mock"} good={Boolean(checks?.integrations.openai.configured)} muted={!checks?.integrations.openai.configured} />
          <ReadinessCheck label="Public API" value={checks?.api.publicUrlConfigured ? checks.api.https ? "https" : "local" : "unset"} good={Boolean(checks?.api.publicUrlConfigured)} muted={!checks?.api.https} />
          <ReadinessCheck label="Uptime" value={data ? formatUptime(data.uptimeSeconds) : "checking"} good={Boolean(data?.uptimeSeconds)} />
        </section>
      </div>

      {error ? <p className="mt-4 rounded-[8px] bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">{error instanceof Error ? error.message : "Unable to load readiness"}</p> : null}

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {warnings.length ? warnings.map((warning) => (
          <div key={warning} className="flex items-start gap-2 rounded-[8px] bg-coral/10 p-3 text-sm font-medium text-coral">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{warning}</span>
          </div>
        )) : (
          <div className="flex items-center gap-2 rounded-[8px] bg-pine/10 p-3 text-sm font-medium text-pine">
            <CheckCircle2 className="h-4 w-4" />
            <span>No launch blockers detected.</span>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ReadinessCheck({
  label,
  value,
  good,
  muted
}: {
  label: string;
  value: string;
  good: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("rounded-[8px] bg-mist p-3 ring-1", good ? "ring-pine/20" : muted ? "ring-amber/30" : "ring-coral/25")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
        {good ? <CheckCircle2 className="h-4 w-4 text-pine" /> : muted ? <TimerReset className="h-4 w-4 text-amber" /> : <AlertTriangle className="h-4 w-4 text-coral" />}
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function TenantRow({
  tenant,
  selected,
  onSelect
}: {
  tenant: PlatformTenant;
  selected: boolean;
  onSelect: () => void;
}) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: (status: PlatformTenant["status"]) => api.updatePlatformTenant(tenant.id, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    }
  });
  return (
    <div className={cn("rounded-[8px] p-4", selected ? "bg-pine/10 ring-1 ring-pine/30" : "bg-mist")}>
      <div className="grid gap-3">
        <button onClick={onSelect} className="min-w-0 text-left">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{tenant.businessName}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-steel">
                {tenant.slug} · {tenant.industry}
              </p>
            </div>
            <Status label={tenant.status} />
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Status label={tenant.subscriptionStatus ?? "TRIALING"} />
          <Status label={tenant.subscriptionPlan} />
          <select
            value={tenant.status}
            onChange={(event) => update.mutate(event.target.value as PlatformTenant["status"])}
            className="h-9 min-w-[128px] rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine"
          >
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CHURNED">Churned</option>
          </select>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <TenantMiniStat label="Users" value={tenant._count?.users ?? 0} />
        <TenantMiniStat label="Customers" value={tenant._count?.customers ?? 0} />
        <TenantMiniStat label="Bookings" value={tenant._count?.bookings ?? 0} />
        <TenantMiniStat label="Leads" value={tenant._count?.leads ?? 0} />
        <TenantMiniStat label="Actions" value={tenant._count?.operationalActions ?? 0} />
        <TenantMiniStat label="Monthly" value={money(tenant.monthlyPriceCents)} />
      </div>
    </div>
  );
}

function TenantMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[8px] bg-white/70 p-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-1 truncate font-semibold text-ink">{value}</p>
    </div>
  );
}

function TenantDetail({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["platform-tenant", tenantId], queryFn: () => api.platformTenant(tenantId) });
  const health = useQuery({ queryKey: ["platform-tenant-health", tenantId], queryFn: () => api.platformTenantHealth(tenantId) });
  const usage = useQuery({ queryKey: ["platform-tenant-usage", tenantId], queryFn: () => api.platformTenantUsage(tenantId) });
  const notes = useQuery({ queryKey: ["platform-support-notes", tenantId], queryFn: () => api.platformSupportNotes(tenantId) });
  const access = useQuery({ queryKey: ["platform-support-access", tenantId], queryFn: () => api.platformSupportAccess(tenantId) });
  const billing = useQuery({ queryKey: ["platform-billing", tenantId], queryFn: () => api.platformBilling(tenantId) });
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("Support troubleshooting for tenant setup.");
  const [flags, setFlags] = useState("");
  const [limits, setLimits] = useState("");
  const [billingType, setBillingType] = useState<PlatformBillingEventType>("SUBSCRIPTION_RENEWED");
  const [billingAmount, setBillingAmount] = useState("299");
  const [setupAmount, setSetupAmount] = useState("1000");
  const [billingNote, setBillingNote] = useState("Manual payment recorded.");

  const saveConfig = useMutation({
    mutationFn: () =>
      api.updatePlatformTenant(tenantId, {
        featureFlags: flags ? JSON.parse(flags) as Record<string, boolean> : undefined,
        planLimits: limits ? JSON.parse(limits) as Record<string, number> : undefined
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant-usage"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
    }
  });
  const addNote = useMutation({
    mutationFn: () => api.addPlatformSupportNote(tenantId, note),
    onSuccess: () => {
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["platform-support-notes", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
    }
  });
  const createAccess = useMutation({
    mutationFn: () => api.createPlatformSupportAccess(tenantId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-support-access", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
    }
  });
  const createBillingEvent = useMutation({
    mutationFn: () => {
      const parsedAmount = Number(billingAmount);
      return api.createPlatformBillingEvent(tenantId, {
        type: billingType,
        amountCents: billingAmount.trim() && Number.isFinite(parsedAmount) ? Math.round(parsedAmount * 100) : undefined,
        provider: "manual",
        note: billingNote.trim() || undefined
      });
    },
    onSuccess: () => {
      setBillingNote("");
      void queryClient.invalidateQueries({ queryKey: ["platform-billing", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
    }
  });
  const createCheckout = useMutation({
    mutationFn: () => {
      const monthly = Number(billingAmount);
      const setup = Number(setupAmount);
      return api.createPlatformBillingCheckout(tenantId, {
        monthlyPriceCents: billingAmount.trim() && Number.isFinite(monthly) ? Math.round(monthly * 100) : undefined,
        setupFeeCents: setupAmount.trim() && Number.isFinite(setup) ? Math.round(setup * 100) : undefined,
        collectSetupFee: true
      });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["platform-billing", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    }
  });
  const createPortal = useMutation({
    mutationFn: () => api.createPlatformBillingPortal(tenantId),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    }
  });

  const tenant = detail.data;
  const effectiveFlags = flags || JSON.stringify(usage.data?.featureFlags ?? tenant?.featureFlags ?? {}, null, 2);
  const effectiveLimits = limits || JSON.stringify(usage.data?.planLimits ?? tenant?.planLimits ?? {}, null, 2);

  return (
    <Panel title={tenant?.businessName ?? "Tenant detail"} icon={ShieldCheck}>
      <div className="grid gap-4">
        <HealthPanel health={health.data} usage={usage.data} tenant={tenant} />
        {tenant ? <TenantControlPanel key={tenant.id} tenant={tenant} /> : null}
        <BillingPanel
          summary={billing.data}
          type={billingType}
          amount={billingAmount}
          setupAmount={setupAmount}
          note={billingNote}
          pending={createBillingEvent.isPending}
          checkoutPending={createCheckout.isPending}
          portalPending={createPortal.isPending}
          error={createBillingEvent.error ?? createCheckout.error ?? createPortal.error}
          onTypeChange={setBillingType}
          onAmountChange={setBillingAmount}
          onSetupAmountChange={setSetupAmount}
          onNoteChange={setBillingNote}
          onSubmit={() => createBillingEvent.mutate()}
          onCheckout={() => createCheckout.mutate()}
          onPortal={() => createPortal.mutate()}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[8px] bg-mist p-3">
            <p className="font-semibold text-ink">Feature flags and limits</p>
            <label className="mt-3 block">
              <span className="mb-2 block text-sm font-medium text-steel">Feature flags JSON</span>
              <textarea value={effectiveFlags} onChange={(event) => setFlags(event.target.value)} className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-white p-3 text-sm outline-none focus:border-pine" />
            </label>
            <label className="mt-3 block">
              <span className="mb-2 block text-sm font-medium text-steel">Plan limits JSON</span>
              <textarea value={effectiveLimits} onChange={(event) => setLimits(event.target.value)} className="min-h-28 w-full rounded-[8px] border border-ink/10 bg-white p-3 text-sm outline-none focus:border-pine" />
            </label>
            {saveConfig.error ? <p className="mt-3 text-sm font-medium text-coral">{saveConfig.error instanceof Error ? saveConfig.error.message : "Invalid JSON"}</p> : null}
            <button onClick={() => saveConfig.mutate()} className="mt-3 h-10 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white">
              Save config
            </button>
          </section>

          <section className="rounded-[8px] bg-mist p-3">
            <p className="font-semibold text-ink">Support access</p>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-3 min-h-20 w-full rounded-[8px] border border-ink/10 bg-white p-3 text-sm outline-none focus:border-pine" />
            <button onClick={() => createAccess.mutate()} disabled={createAccess.isPending} className="mt-3 h-10 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50">
              Create audited token
            </button>
            {createAccess.data ? (
              <p className="mt-3 break-all rounded-[8px] bg-white p-2 text-xs font-semibold text-ink">{createAccess.data.token}</p>
            ) : null}
            <div className="mt-3 grid gap-2">
              {(access.data ?? []).slice(0, 4).map((item) => (
                <p key={item.id} className="rounded-[8px] bg-white p-2 text-xs text-steel">
                  {item.admin?.email} · expires {shortDate(item.expiresAt)}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[8px] bg-mist p-3">
          <p className="font-semibold text-ink">Support notes</p>
          <div className="mt-3 flex gap-2">
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add support note..." className="h-10 min-w-0 flex-1 rounded-[8px] border border-ink/10 bg-white px-3 text-sm outline-none focus:border-pine" />
            <button onClick={() => addNote.mutate()} disabled={!note.trim() || addNote.isPending} className="h-10 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50">
              Add
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {(notes.data ?? []).map((item) => (
              <SupportNote key={item.id} item={item} />
            ))}
            {!notes.data?.length ? <Empty label="No support notes" /> : null}
          </div>
        </section>
      </div>
    </Panel>
  );
}

function TenantControlPanel({ tenant }: { tenant: PlatformTenantDetail }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PlatformTenant["status"]>(tenant.status);
  const [subscriptionStatus, setSubscriptionStatus] = useState<NonNullable<PlatformTenant["subscriptionStatus"]>>(tenant.subscriptionStatus ?? "TRIALING");
  const [subscriptionPlan, setSubscriptionPlan] = useState(tenant.subscriptionPlan ?? "pilot");
  const [billingEmail, setBillingEmail] = useState(tenant.billingEmail ?? "");
  const [monthlyPrice, setMonthlyPrice] = useState(String((tenant.monthlyPriceCents ?? 0) / 100));
  const [setupFee, setSetupFee] = useState(String((tenant.setupFeeCents ?? 0) / 100));
  const [nextBillingAt, setNextBillingAt] = useState(tenant.nextBillingAt ? tenant.nextBillingAt.slice(0, 10) : "");
  const [stripeCustomerId, setStripeCustomerId] = useState(tenant.stripeCustomerId ?? "");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(tenant.stripeSubscriptionId ?? "");

  const invalidateTenant = () => {
    void queryClient.invalidateQueries({ queryKey: ["platform-tenant", tenant.id] });
    void queryClient.invalidateQueries({ queryKey: ["platform-billing", tenant.id] });
    void queryClient.invalidateQueries({ queryKey: ["platform-tenant-health", tenant.id] });
    void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
    void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
  };

  const saveTenantControl = useMutation({
    mutationFn: () =>
      api.updatePlatformTenant(tenant.id, {
        status,
        subscriptionStatus,
        subscriptionPlan: subscriptionPlan.trim(),
        billingEmail: billingEmail.trim() || undefined,
        monthlyPriceCents: Math.round(Number(monthlyPrice || 0) * 100),
        setupFeeCents: Math.round(Number(setupFee || 0) * 100),
        nextBillingAt: nextBillingAt ? new Date(`${nextBillingAt}T12:00:00.000Z`).toISOString() : undefined,
        stripeCustomerId: stripeCustomerId.trim() || undefined,
        stripeSubscriptionId: stripeSubscriptionId.trim() || undefined
      }),
    onSuccess: invalidateTenant
  });

  const quickTenantUpdate = useMutation({
    mutationFn: (input: Partial<PlatformTenant>) => api.updatePlatformTenant(tenant.id, input),
    onSuccess: invalidateTenant
  });

  const error = saveTenantControl.error ?? quickTenantUpdate.error;

  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div>
          <p className="font-semibold text-ink">Tenant command controls</p>
          <p className="mt-1 text-sm text-steel">
            Change plan, billing state, pricing, Stripe linkage, and tenant access from one control surface.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button
            onClick={() => quickTenantUpdate.mutate({ status: "ACTIVE", subscriptionStatus: "ACTIVE" })}
            disabled={quickTenantUpdate.isPending}
            className="h-10 rounded-[8px] bg-pine px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Activate
          </button>
          <button
            onClick={() => quickTenantUpdate.mutate({ status: "SUSPENDED", subscriptionStatus: "PAST_DUE" })}
            disabled={quickTenantUpdate.isPending}
            className="h-10 rounded-[8px] bg-amber px-4 text-sm font-semibold text-ink disabled:opacity-50"
          >
            Suspend
          </button>
          <button
            onClick={() => quickTenantUpdate.mutate({ status: "CHURNED", subscriptionStatus: "CANCELED" })}
            disabled={quickTenantUpdate.isPending}
            className="h-10 rounded-[8px] bg-coral px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Churn
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 rounded-[8px] bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminSelect label="Tenant status" value={status} options={tenantStatuses} onChange={(value) => setStatus(value as PlatformTenant["status"])} />
        <AdminSelect label="Subscription" value={subscriptionStatus} options={subscriptionStatuses} onChange={(value) => setSubscriptionStatus(value as NonNullable<PlatformTenant["subscriptionStatus"]>)} />
        <AdminInput label="Plan" value={subscriptionPlan} onChange={setSubscriptionPlan} />
        <AdminInput label="Billing email" value={billingEmail} onChange={setBillingEmail} />
        <AdminInput label="Monthly $" value={monthlyPrice} onChange={setMonthlyPrice} inputMode="decimal" />
        <AdminInput label="Setup $" value={setupFee} onChange={setSetupFee} inputMode="decimal" />
        <AdminInput label="Next billing" value={nextBillingAt} onChange={setNextBillingAt} type="date" />
        <div className="rounded-[8px] bg-mist p-3 md:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Tenant ID</p>
          <p className="mt-2 truncate text-sm font-semibold text-ink">{tenant?.id ?? "loading"}</p>
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <AdminInput label="Stripe customer ID" value={stripeCustomerId} onChange={setStripeCustomerId} />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <AdminInput label="Stripe subscription ID" value={stripeSubscriptionId} onChange={setStripeSubscriptionId} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1 text-sm text-steel sm:grid-cols-3 sm:gap-4">
          <span>Created {tenant?.createdAt ? shortDate(tenant.createdAt) : "loading"}</span>
          <span>{tenant?._count?.users ?? 0} users</span>
          <span>{tenant?._count?.invoices ?? 0} invoices</span>
        </div>
        <button onClick={() => saveTenantControl.mutate()} disabled={saveTenantControl.isPending} className="h-11 rounded-[8px] bg-ink px-5 text-sm font-semibold text-white disabled:opacity-50">
          {saveTenantControl.isPending ? "Saving..." : "Save tenant controls"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-coral">{error instanceof Error ? error.message : "Unable to update tenant"}</p> : null}
    </section>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-steel">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-3 text-sm outline-none focus:border-pine"
      />
    </label>
  );
}

function AdminSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-steel">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}

function HealthPanel({
  health,
  usage,
  tenant
}: {
  health?: PlatformTenantHealth;
  usage?: PlatformTenantUsage;
  tenant?: PlatformTenantDetail;
}) {
  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-steel">Health score</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{health?.score ?? 0}</p>
        </div>
        <Status label={tenant?.status ?? "loading"} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <HealthMiniStat label="Active users" value={health?.activeUsers ?? 0} />
        <HealthMiniStat label="Bookings 30d" value={health?.recentBookings ?? 0} />
        <HealthMiniStat label="Open actions" value={health?.openActions ?? 0} />
        <HealthMiniStat label="Overdue invoices" value={health?.overdueInvoices ?? 0} />
        <HealthMiniStat label="Hot leads" value={health?.hotLeads ?? 0} />
        <HealthMiniStat label="Messages" value={usage?._count.messages ?? 0} />
      </div>
    </section>
  );
}

function HealthMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[8px] bg-white/75 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

const billingEventTypes: PlatformBillingEventType[] = [
  "SETUP_FEE_INVOICED",
  "SETUP_FEE_PAID",
  "SUBSCRIPTION_STARTED",
  "SUBSCRIPTION_RENEWED",
  "PAYMENT_FAILED",
  "PAST_DUE",
  "CANCELED",
  "CREDIT_APPLIED"
];

function BillingPanel({
  summary,
  type,
  amount,
  setupAmount,
  note,
  pending,
  checkoutPending,
  portalPending,
  error,
  onTypeChange,
  onAmountChange,
  onSetupAmountChange,
  onNoteChange,
  onSubmit,
  onCheckout,
  onPortal
}: {
  summary?: PlatformBillingSummary;
  type: PlatformBillingEventType;
  amount: string;
  setupAmount: string;
  note: string;
  pending: boolean;
  checkoutPending: boolean;
  portalPending: boolean;
  error: unknown;
  onTypeChange: (type: PlatformBillingEventType) => void;
  onAmountChange: (value: string) => void;
  onSetupAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  onCheckout: () => void;
  onPortal: () => void;
}) {
  const events = summary?.events ?? [];
  return (
    <section className="rounded-[8px] bg-mist p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-semibold text-ink">Billing control</p>
          <p className="mt-1 text-sm text-steel">Track subscription state, setup fees, failed payments, and manual collections.</p>
        </div>
        <Status label={summary?.subscriptionStatus ?? "TRIALING"} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <BillingStat label="Monthly price" value={money(summary?.monthlyPriceCents)} />
        <BillingStat label="Setup fee" value={money(summary?.setupFeeCents)} />
        <BillingStat label="Collected" value={money(summary?.collectedCents)} />
        <BillingStat label="Failed payments" value={summary?.failedCount ?? 0} danger={(summary?.failedCount ?? 0) > 0} />
        <BillingStat label="Next billing" value={summary?.nextBillingAt ? shortDate(summary.nextBillingAt) : "Not set"} />
      </div>

      <div className="mt-4 grid gap-4 rounded-[8px] bg-white p-4 lg:grid-cols-2 2xl:grid-cols-[1fr_0.7fr_0.7fr_auto_auto] 2xl:items-end">
        <label>
          <span className="mb-2 block text-sm font-medium text-steel">Monthly</span>
          <input value={amount} onChange={(event) => onAmountChange(event.target.value)} inputMode="decimal" className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-3 text-sm outline-none focus:border-pine" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-steel">Setup</span>
          <input value={setupAmount} onChange={(event) => onSetupAmountChange(event.target.value)} inputMode="decimal" className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-3 text-sm outline-none focus:border-pine" />
        </label>
        <div className="rounded-[8px] bg-mist px-3 py-2 text-xs font-semibold text-steel">
          {summary?.stripeConfigured ? "Stripe live" : "Mock checkout"}
          <br />
          {summary?.stripeCustomerId ? "Customer linked" : "No customer yet"}
        </div>
        <button onClick={onCheckout} disabled={checkoutPending} className="h-10 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50">
          Checkout
        </button>
        <button onClick={onPortal} disabled={portalPending || !summary?.stripeCustomerId || !summary?.stripeConfigured} className="h-10 rounded-[8px] bg-pine px-4 text-sm font-semibold text-white disabled:opacity-50">
          Portal
        </button>
      </div>

      <div className="mt-3 grid gap-4 rounded-[8px] bg-white p-4 lg:grid-cols-[1fr_1.4fr_auto] lg:items-end">
        <label>
          <span className="mb-2 block text-sm font-medium text-steel">Event type</span>
          <select value={type} onChange={(event) => onTypeChange(event.target.value as PlatformBillingEventType)} className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine">
            {billingEventTypes.map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-steel">Note</span>
          <input value={note} onChange={(event) => onNoteChange(event.target.value)} className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-3 text-sm outline-none focus:border-pine" />
        </label>
        <button onClick={onSubmit} disabled={pending} className="h-10 rounded-[8px] bg-pine px-4 text-sm font-semibold text-white disabled:opacity-50">
          Record
        </button>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-coral">{error instanceof Error ? error.message : "Unable to record billing event"}</p> : null}

      <div className="mt-4 grid gap-2 lg:grid-cols-2">
        {events.slice(0, 6).map((event) => (
          <BillingEventRow key={event.id} event={event} />
        ))}
        {!events.length ? <Empty label="No billing events yet" /> : null}
      </div>
    </section>
  );
}

function BillingStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className={cn("rounded-[8px] bg-white p-3", danger ? "ring-1 ring-coral/30" : "")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className={cn("mt-2 text-lg font-semibold", danger ? "text-coral" : "text-ink")}>{value}</p>
    </div>
  );
}

function BillingEventRow({ event }: { event: PlatformBillingEvent }) {
  return (
    <div className="rounded-[8px] bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{event.type.replaceAll("_", " ")}</p>
          <p className="mt-1 text-sm text-steel">{event.note ?? "No note"}</p>
        </div>
        <p className="whitespace-nowrap text-sm font-semibold text-ink">{money(event.amountCents)}</p>
      </div>
      <p className="mt-2 text-xs font-medium text-steel">
        {event.provider} · {event.actor?.email ?? "system"} · {shortDate(event.createdAt)}
      </p>
    </div>
  );
}

function SupportNote({ item }: { item: PlatformSupportNote }) {
  return (
    <div className="rounded-[8px] bg-white p-3">
      <p className="text-sm text-ink">{item.note}</p>
      <p className="mt-2 text-xs font-medium text-steel">
        {item.author?.email ?? "system"} · {shortDate(item.createdAt)}
      </p>
    </div>
  );
}

function FailureList({
  automation,
  webhooks
}: {
  automation?: PlatformAutomationFailure[];
  webhooks?: PlatformWebhookFailure[];
}) {
  const items = [
    ...(automation ?? []).map((item) => ({
      id: item.id,
      title: item.trigger,
      tenant: item.tenant?.businessName,
      error: item.error,
      createdAt: item.createdAt
    })),
    ...(webhooks ?? []).map((item) => ({
      id: item.id,
      title: `${item.provider} webhook`,
      tenant: item.tenant?.businessName,
      error: item.error,
      createdAt: item.createdAt
    }))
  ].slice(0, 12);
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[8px] bg-mist p-3">
          <p className="font-semibold text-ink">{item.title}</p>
          <p className="text-sm text-steel">{item.tenant ?? "No tenant"} · {shortDate(item.createdAt)}</p>
          {item.error ? <p className="mt-2 text-sm font-medium text-coral">{item.error}</p> : null}
        </div>
      ))}
      {!items.length ? <Empty label="No platform failures" /> : null}
    </div>
  );
}

function AuditList({ items }: { items?: PlatformAuditLog[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {(items ?? []).slice(0, 24).map((item) => (
        <div key={item.id} className="rounded-[8px] bg-mist p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{item.action}</p>
              <p className="mt-1 text-sm text-steel">{item.summary}</p>
            </div>
            <Status label={item.entityType} />
          </div>
          <p className="mt-2 text-xs font-medium text-steel">
            {item.tenant?.businessName ?? "Platform"} · {item.actor?.email ?? "system"} · {shortDate(item.createdAt)}
          </p>
        </div>
      ))}
      {!items?.length ? <Empty label="No audit events" /> : null}
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-5 shadow-soft">
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
  danger
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft">
      <div className={cn("mb-5 flex h-10 w-10 items-center justify-center rounded-[8px]", danger ? "bg-coral text-white" : "bg-pine text-white")}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-steel">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
    </section>
  );
}

function Status({ label }: { label: string }) {
  return <span className="rounded-[8px] bg-white px-2.5 py-1 text-xs font-semibold text-steel">{label.replaceAll("_", " ")}</span>;
}

function formatUptime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex min-h-[110px] items-center justify-center rounded-[8px] border border-dashed border-ink/15 bg-white/50 text-sm font-medium text-steel">
      {label}
    </div>
  );
}
