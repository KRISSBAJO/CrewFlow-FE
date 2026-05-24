"use client";

import {
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
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
  Undo2,
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
  PlatformAction,
  PlatformRiskRow,
  PlatformUser,
  Readiness,
  PlatformSupportAccess,
  PlatformSupportNote,
  PlatformTenant,
  PlatformTenantCreateInput,
  PlatformTenantDetail,
  PlatformTenantHealth,
  PlatformTenantUsage,
  PlatformUserCreateInput,
  PlatformWebhookFailure
} from "@/lib/api";
import { cn, money, shortDate } from "@/lib/utils";
import { useAuth } from "@/store/auth";

type AdminSection = "overview" | "tenants" | "risk" | "search" | "users" | "actions" | "failures" | "audit";

const adminNav: Array<{ id: AdminSection; label: string; icon: typeof ShieldCheck }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "risk", label: "Risk", icon: AlertTriangle },
  { id: "search", label: "Search", icon: Search },
  { id: "users", label: "Users", icon: UsersRound },
  { id: "actions", label: "Actions", icon: LifeBuoy },
  { id: "failures", label: "Failures", icon: AlertTriangle },
  { id: "audit", label: "Audit", icon: ShieldCheck }
];

const tenantStatuses: PlatformTenant["status"][] = ["TRIAL", "ACTIVE", "SUSPENDED", "ARCHIVED", "CHURNED"];
const userRoles: PlatformUser["role"][] = ["PLATFORM_ADMIN", "PLATFORM_SUPPORT", "OWNER", "MANAGER", "STAFF"];
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
  if (!token || (user?.role !== "PLATFORM_ADMIN" && user?.role !== "PLATFORM_SUPPORT")) {
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
      if (data.user.role !== "PLATFORM_ADMIN" && data.user.role !== "PLATFORM_SUPPORT") {
        setError("This account is not a platform admin or support user.");
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
  const user = useAuth((state) => state.user);
  const canManagePlatform = user?.role === "PLATFORM_ADMIN";
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>("overview");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const metrics = useQuery({ queryKey: ["platform-metrics"], queryFn: api.platformMetrics });
  const risk = useQuery({ queryKey: ["platform-risk"], queryFn: api.platformRisk });
  const supportSessions = useQuery({ queryKey: ["platform-support-sessions"], queryFn: api.platformSupportSessions });
  const exportHistory = useQuery({ queryKey: ["platform-exports"], queryFn: api.platformExports });
  const tenants = useQuery({ queryKey: ["platform-tenants"], queryFn: api.platformTenants });
  const users = useQuery({ queryKey: ["platform-users"], queryFn: api.platformUsers });
  const platformActions = useQuery({ queryKey: ["platform-actions"], queryFn: api.platformActions });
  const automationFailures = useQuery({ queryKey: ["platform-automation-failures"], queryFn: api.platformAutomationFailures });
  const webhookFailures = useQuery({ queryKey: ["platform-webhook-failures"], queryFn: api.platformWebhookFailures });
  const audit = useQuery({ queryKey: ["platform-audit"], queryFn: () => api.platformAudit() });
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
                <Panel title="Admin workload" icon={LifeBuoy}>
                  <ActionList items={platformActions.data} />
                </Panel>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <RiskBoard rows={risk.data} compact />
                <SupportSessionList items={supportSessions.data} />
              </div>
            </>
          ) : null}

          {section === "tenants" ? (
            <section className="grid min-w-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <Panel title="Tenants" icon={Building2}>
                <CreateTenantBox canManage={canManagePlatform} />
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
                      canManage={canManagePlatform}
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

          {section === "users" ? (
            <Panel title="Platform users" icon={UsersRound}>
              <UserAdminList items={users.data} tenants={tenants.data} canManage={canManagePlatform} />
            </Panel>
          ) : null}

          {section === "search" ? (
            <Panel title="Platform-wide search" icon={Search}>
              <PlatformSearch />
            </Panel>
          ) : null}

          {section === "risk" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
              <RiskBoard rows={risk.data} />
              <div className="grid gap-4">
                <SupportSessionList items={supportSessions.data} expanded />
                <Panel title="Export history" icon={Download}>
                  <AuditList items={exportHistory.data} compact />
                </Panel>
              </div>
            </div>
          ) : null}

          {section === "actions" ? (
            <Panel title="Platform action queue" icon={LifeBuoy}>
              <ActionList items={platformActions.data} expanded />
            </Panel>
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
              <AuditExplorer tenants={tenants.data} initialItems={audit.data} />
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

function RiskBoard({ rows, compact }: { rows?: PlatformRiskRow[]; compact?: boolean }) {
  const visible = (rows ?? []).slice(0, compact ? 5 : 40);
  return (
    <Panel title="Tenant risk board" icon={AlertTriangle}>
      <div className="grid gap-3">
        {visible.map((row) => (
          <div key={row.tenant.id} className="rounded-[8px] bg-mist p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Status label={row.severity} />
                  <Status label={row.tenant.status} />
                  {row.tenant.subscriptionStatus ? <Status label={row.tenant.subscriptionStatus} /> : null}
                </div>
                <p className="mt-3 truncate font-semibold text-ink">{row.tenant.businessName}</p>
                <p className="mt-1 text-sm text-steel">{row.reasons.slice(0, 3).join(" · ")}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className={cn("text-3xl font-semibold", row.score < 45 ? "text-coral" : row.score < 70 ? "text-amber" : "text-pine")}>{row.score}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Risk score</p>
              </div>
            </div>
            {!compact ? (
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
                <TenantMiniStat label="Open actions" value={row.openActions} />
                <TenantMiniStat label="Overdue invoices" value={row.overdueInvoices} />
                <TenantMiniStat label="Hot leads" value={row.hotLeads} />
                <TenantMiniStat label="Support sessions" value={row.activeSupportSessions} />
              </div>
            ) : null}
          </div>
        ))}
        {!visible.length ? <Empty label="No tenant risk data" /> : null}
      </div>
    </Panel>
  );
}

function SupportSessionList({ items, expanded }: { items?: PlatformSupportAccess[]; expanded?: boolean }) {
  const queryClient = useQueryClient();
  const revoke = useMutation({
    mutationFn: (id: string) => api.revokePlatformSupportAccess(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-support-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-risk"] });
    }
  });
  const visible = (items ?? []).slice(0, expanded ? 50 : 6);
  return (
    <Panel title="Support sessions" icon={KeyRound}>
      <div className="grid gap-3">
        {visible.map((item) => {
          const active = !item.revokedAt && !item.usedAt;
          return (
            <div key={item.id} className="rounded-[8px] bg-mist p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Status label={item.revokedAt ? "REVOKED" : item.usedAt ? "USED" : active ? "ACTIVE" : "EXPIRED"} />
                    {item.tenant ? <Status label={item.tenant.status} /> : null}
                  </div>
                  <p className="mt-2 font-semibold text-ink">{item.tenant?.businessName ?? "Unknown tenant"}</p>
                  <p className="mt-1 text-sm text-steel">{item.admin?.email ?? "system"} · expires {shortDate(item.expiresAt)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-steel">{item.reason}</p>
                </div>
                {active ? (
                  <button onClick={() => revoke.mutate(item.id)} disabled={revoke.isPending} className="h-9 rounded-[8px] bg-coral px-3 text-xs font-semibold text-white disabled:opacity-50">
                    Revoke
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {!visible.length ? <Empty label="No support sessions" /> : null}
        {revoke.error ? <p className="text-sm font-medium text-coral">{revoke.error instanceof Error ? revoke.error.message : "Unable to revoke session"}</p> : null}
      </div>
    </Panel>
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
  canManage,
  onSelect
}: {
  tenant: PlatformTenant;
  selected: boolean;
  canManage: boolean;
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
          {canManage ? (
            <select
              value={tenant.status}
              onChange={(event) => update.mutate(event.target.value as PlatformTenant["status"])}
              className="h-9 min-w-[128px] rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine"
            >
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="ARCHIVED">Archived</option>
              <option value="CHURNED">Churned</option>
            </select>
          ) : null}
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

function CreateTenantBox({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("Cleaning + Home Services");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("Password123!");
  const [monthlyPrice, setMonthlyPrice] = useState("299");
  const [setupFee, setSetupFee] = useState("1000");
  const create = useMutation({
    mutationFn: () =>
      api.createPlatformTenant({
        businessName,
        industry,
        ownerName,
        ownerEmail,
        ownerPassword,
        monthlyPriceCents: Math.round(Number(monthlyPrice || 0) * 100),
        setupFeeCents: Math.round(Number(setupFee || 0) * 100),
        subscriptionPlan: "pilot"
      } satisfies PlatformTenantCreateInput),
    onSuccess: () => {
      setBusinessName("");
      setOwnerName("");
      setOwnerEmail("");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
    }
  });

  if (!open) {
    return (
      <button disabled={!canManage} onClick={() => setOpen(true)} className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50">
        <Building2 className="h-4 w-4" />
        {canManage ? "Create tenant" : "Create tenant locked"}
      </button>
    );
  }

  return (
    <div className="mb-4 rounded-[8px] bg-mist p-3">
      <p className="font-semibold text-ink">Create tenant</p>
      <div className="mt-3 grid gap-3">
        <AdminInput label="Business" value={businessName} onChange={setBusinessName} />
        <AdminInput label="Industry" value={industry} onChange={setIndustry} />
        <AdminInput label="Owner name" value={ownerName} onChange={setOwnerName} />
        <AdminInput label="Owner email" value={ownerEmail} onChange={setOwnerEmail} />
        <AdminInput label="Owner password" value={ownerPassword} onChange={setOwnerPassword} />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminInput label="Monthly $" value={monthlyPrice} onChange={setMonthlyPrice} inputMode="decimal" />
          <AdminInput label="Setup $" value={setupFee} onChange={setSetupFee} inputMode="decimal" />
        </div>
      </div>
      {create.error ? <p className="mt-3 text-sm font-medium text-coral">{create.error instanceof Error ? create.error.message : "Unable to create tenant"}</p> : null}
      <div className="mt-3 flex gap-2">
        <button onClick={() => create.mutate()} disabled={create.isPending || !businessName || !ownerEmail} className="h-10 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50">
          Create
        </button>
        <button onClick={() => setOpen(false)} className="h-10 rounded-[8px] bg-white px-3 text-sm font-semibold text-ink">
          Cancel
        </button>
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

function PlatformSearch() {
  const [query, setQuery] = useState("");
  const search = useQuery({
    queryKey: ["platform-search", query],
    queryFn: () => api.platformSearch(query),
    enabled: query.trim().length >= 2
  });
  const groups = search.data
    ? [
        { label: "Tenants", items: search.data.tenants.map((item) => ({ id: item.id, title: item.businessName, detail: `${item.slug} · ${item.status}` })) },
        { label: "Users", items: search.data.users.map((item) => ({ id: item.id, title: item.email, detail: `${item.role} · ${item.tenant?.businessName ?? "No tenant"}` })) },
        { label: "Customers", items: search.data.customers.map((item) => ({ id: item.id, title: item.name, detail: `${item.phone} · ${item.tenant?.businessName ?? "No tenant"}` })) },
        { label: "Bookings", items: search.data.bookings.map((item) => ({ id: item.id, title: item.service?.title ?? item.status, detail: `${item.customer?.name ?? "No customer"} · ${shortDate(item.startTime)}` })) },
        { label: "Leads", items: search.data.leads.map((item) => ({ id: item.id, title: item.title, detail: `${item.status} · ${item.tenant?.businessName ?? "No tenant"}` })) },
        { label: "Invoices", items: search.data.invoices.map((item) => ({ id: item.id, title: item.invoiceNo, detail: `${item.status} · ${money(item.totalCents)}` })) }
      ]
    : [];

  return (
    <div className="grid gap-4">
      <div className="flex h-12 items-center gap-2 rounded-[8px] bg-mist px-3">
        <Search className="h-4 w-4 text-steel" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tenants, users, customers, bookings, leads, invoices..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {query.trim().length < 2 ? <Empty label="Type at least 2 characters" /> : null}
      {search.isFetching ? <p className="text-sm font-medium text-steel">Searching...</p> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <section key={group.label} className="rounded-[8px] bg-mist p-4">
            <p className="font-semibold text-ink">{group.label}</p>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <div key={item.id} className="rounded-[8px] bg-white p-3">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-steel">{item.detail}</p>
                </div>
              ))}
              {!group.items.length ? <p className="text-sm text-steel">No matches</p> : null}
            </div>
          </section>
        ))}
      </div>
      {search.error ? <p className="text-sm font-medium text-coral">{search.error instanceof Error ? search.error.message : "Search failed"}</p> : null}
    </div>
  );
}

function TenantDetail({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const setSession = useAuth((state) => state.setSession);
  const currentUser = useAuth((state) => state.user);
  const canManagePlatform = currentUser?.role === "PLATFORM_ADMIN";
  const detail = useQuery({ queryKey: ["platform-tenant", tenantId], queryFn: () => api.platformTenant(tenantId) });
  const health = useQuery({ queryKey: ["platform-tenant-health", tenantId], queryFn: () => api.platformTenantHealth(tenantId) });
  const usage = useQuery({ queryKey: ["platform-tenant-usage", tenantId], queryFn: () => api.platformTenantUsage(tenantId) });
  const notes = useQuery({ queryKey: ["platform-support-notes", tenantId], queryFn: () => api.platformSupportNotes(tenantId) });
  const access = useQuery({ queryKey: ["platform-support-access", tenantId], queryFn: () => api.platformSupportAccess(tenantId) });
  const billing = useQuery({ queryKey: ["platform-billing", tenantId], queryFn: () => api.platformBilling(tenantId) });
  const timeline = useQuery({ queryKey: ["platform-tenant-timeline", tenantId], queryFn: () => api.platformTenantTimeline(tenantId) });
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("Support troubleshooting for tenant setup.");
  const [flags, setFlags] = useState("");
  const [limits, setLimits] = useState("");
  const [billingType, setBillingType] = useState<PlatformBillingEventType>("SUBSCRIPTION_RENEWED");
  const [billingAmount, setBillingAmount] = useState("299");
  const [setupAmount, setSetupAmount] = useState("1000");
  const [billingNote, setBillingNote] = useState("Manual payment recorded.");
  const [archiveReason, setArchiveReason] = useState("Customer no longer active.");
  const [archiveConfirm, setArchiveConfirm] = useState("");

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
  const impersonate = useMutation({
    mutationFn: (token: string) => api.impersonatePlatformTenant(token),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      window.location.href = "/app";
    }
  });
  const exportTenant = useMutation({
    mutationFn: () => api.exportPlatformTenant(tenantId),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${data.tenant.slug}-export.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant-timeline", tenantId] });
    }
  });
  const archiveTenant = useMutation({
    mutationFn: () => api.archivePlatformTenant(tenantId, { confirmation: archiveConfirm, reason: archiveReason }),
    onSuccess: () => {
      setArchiveConfirm("");
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant-timeline", tenantId] });
    }
  });
  const restoreTenant = useMutation({
    mutationFn: () => api.restorePlatformTenant(tenantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant", tenantId] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenant-timeline", tenantId] });
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
        {tenant ? (
          <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[8px] bg-mist p-4">
              <p className="font-semibold text-ink">Lifecycle safeguards</p>
              <p className="mt-1 text-sm text-steel">Archive hides a tenant from active operations without destroying customer data.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <AdminInput label="Archive reason" value={archiveReason} onChange={setArchiveReason} />
                <AdminInput label={`Type "${tenant.businessName}"`} value={archiveConfirm} onChange={setArchiveConfirm} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => archiveTenant.mutate()} disabled={!canManagePlatform || archiveTenant.isPending || archiveConfirm !== tenant.businessName} className="flex h-10 items-center gap-2 rounded-[8px] bg-coral px-3 text-sm font-semibold text-white disabled:opacity-50">
                  <Undo2 className="h-4 w-4" />
                  Archive tenant
                </button>
                <button onClick={() => restoreTenant.mutate()} disabled={!canManagePlatform || restoreTenant.isPending} className="h-10 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50">
                  Restore active
                </button>
                <button onClick={() => exportTenant.mutate()} disabled={exportTenant.isPending} className="flex h-10 items-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  Export data
                </button>
              </div>
              {archiveTenant.error || restoreTenant.error || exportTenant.error ? (
                <p className="mt-3 text-sm font-medium text-coral">
                  {((archiveTenant.error ?? restoreTenant.error ?? exportTenant.error) as Error).message}
                </p>
              ) : null}
            </div>
            <TenantTimeline items={timeline.data} />
          </section>
        ) : null}
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
              <div className="mt-3 rounded-[8px] bg-white p-2">
                <p className="break-all text-xs font-semibold text-ink">{createAccess.data.token}</p>
                <button onClick={() => impersonate.mutate(createAccess.data.token)} className="mt-2 h-9 rounded-[8px] bg-pine px-3 text-xs font-semibold text-white">
                  Open as tenant
                </button>
              </div>
            ) : null}
            <div className="mt-3 grid gap-2">
              {(access.data ?? []).slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-[8px] bg-white p-2 text-xs text-steel">
                  <p>{item.admin?.email} · expires {shortDate(item.expiresAt)}</p>
                  {!item.usedAt ? (
                    <button onClick={() => impersonate.mutate(item.token)} className="mt-2 h-8 rounded-[8px] bg-ink px-2 text-xs font-semibold text-white">
                      Impersonate
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {impersonate.error ? <p className="mt-3 text-sm font-medium text-coral">{impersonate.error instanceof Error ? impersonate.error.message : "Unable to impersonate"}</p> : null}
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

function TenantTimeline({ items }: { items?: Array<{ id: string; kind: string; title: string; summary?: string | null; amountCents?: number | null; createdAt: string; actor?: { email: string; role: string } | null }> }) {
  return (
    <section className="rounded-[8px] bg-mist p-4">
      <p className="font-semibold text-ink">Tenant activity timeline</p>
      <div className="mt-3 grid max-h-[360px] gap-2 overflow-auto pr-1">
        {(items ?? []).slice(0, 30).map((item) => (
          <div key={`${item.kind}-${item.id}`} className="rounded-[8px] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Status label={item.kind} />
              {item.amountCents ? <Status label={money(item.amountCents)} /> : null}
            </div>
            <p className="mt-2 font-semibold text-ink">{item.title}</p>
            {item.summary ? <p className="mt-1 text-sm text-steel">{item.summary}</p> : null}
            <p className="mt-2 text-xs font-medium text-steel">
              {item.actor?.email ?? "system"} · {shortDate(item.createdAt)}
            </p>
          </div>
        ))}
        {!items?.length ? <Empty label="No tenant activity yet" /> : null}
      </div>
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
  "CREDIT_APPLIED",
  "REFUND_ISSUED"
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

function UserAdminList({ items, tenants, canManage }: { items?: PlatformUser[]; tenants?: PlatformTenant[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState<PlatformUser["role"]>("MANAGER");
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PlatformUser> }) => api.updatePlatformUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    }
  });
  const create = useMutation({
    mutationFn: () =>
      api.createPlatformUser({
        tenantId,
        name,
        email,
        password,
        role
      } satisfies PlatformUserCreateInput),
    onSuccess: () => {
      setShowCreate(false);
      setName("");
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
    }
  });

  return (
    <div className="grid gap-3">
      <div className="rounded-[8px] bg-mist p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink">User control</p>
            <p className="text-sm text-steel">Create users, change roles, and disable access.</p>
          </div>
          <button disabled={!canManage} onClick={() => setShowCreate((value) => !value)} className="h-10 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white disabled:opacity-50">
            {showCreate ? "Close" : "Create user"}
          </button>
        </div>
        {showCreate ? (
          <div className="mt-4 grid gap-3 rounded-[8px] bg-white p-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-steel">Tenant</span>
              <select value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="h-10 w-full rounded-[8px] border border-ink/10 bg-mist px-2 text-sm outline-none focus:border-pine">
                <option value="">Select tenant</option>
                {(tenants ?? []).map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.businessName}</option>
                ))}
              </select>
            </label>
            <AdminInput label="Name" value={name} onChange={setName} />
            <AdminInput label="Email" value={email} onChange={setEmail} />
            <AdminInput label="Password" value={password} onChange={setPassword} />
            <AdminSelect label="Role" value={role} options={userRoles} onChange={(value) => setRole(value as PlatformUser["role"])} />
            <button onClick={() => create.mutate()} disabled={create.isPending || !tenantId || !name || !email} className="h-10 rounded-[8px] bg-pine px-3 text-sm font-semibold text-white disabled:opacity-50">
              Create
            </button>
          </div>
        ) : null}
        {create.error ? <p className="mt-3 text-sm font-medium text-coral">{create.error instanceof Error ? create.error.message : "Unable to create user"}</p> : null}
      </div>
      {(items ?? []).map((user) => (
        <div key={user.id} className="grid gap-3 rounded-[8px] bg-mist p-4 xl:grid-cols-[minmax(0,1fr)_220px_160px_auto] xl:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-pine" />
              <p className="truncate font-semibold text-ink">{user.name}</p>
              {!user.active ? <Status label="INACTIVE" /> : null}
            </div>
            <p className="mt-1 truncate text-sm text-steel">{user.email}</p>
            <p className="mt-1 truncate text-xs font-medium text-steel">
              {user.tenant?.businessName ?? "No tenant"} · {user.phone ?? "No phone"}
            </p>
          </div>
          <select
            value={user.role}
            onChange={(event) => update.mutate({ id: user.id, input: { role: event.target.value as PlatformUser["role"] } })}
            disabled={!canManage}
            className="h-10 rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine"
          >
            {userRoles.map((role) => (
              <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
            ))}
          </select>
          <Status label={user.tenant?.status ?? "NO TENANT"} />
          <button
            onClick={() => update.mutate({ id: user.id, input: { active: !user.active } })}
            disabled={!canManage}
            className={cn("h-10 rounded-[8px] px-3 text-sm font-semibold", user.active ? "bg-coral text-white" : "bg-pine text-white")}
          >
            {user.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ))}
      {!items?.length ? <Empty label="No platform users" /> : null}
      {update.error ? <p className="text-sm font-medium text-coral">{update.error instanceof Error ? update.error.message : "Unable to update user"}</p> : null}
    </div>
  );
}

function ActionList({ items, expanded }: { items?: PlatformAction[]; expanded?: boolean }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updatePlatformAction(id, { status, note: `Platform marked ${status.toLowerCase()}` }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-actions"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    }
  });
  const visible = (items ?? []).slice(0, expanded ? 80 : 8);
  return (
    <div className="grid gap-3">
      {visible.map((item) => (
        <div key={item.id} className="rounded-[8px] bg-mist p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Status label={item.priority} />
                <Status label={item.status} />
                <Status label={item.type} />
              </div>
              <p className="mt-3 font-semibold text-ink">{item.title}</p>
              {item.description ? <p className="mt-1 line-clamp-2 text-sm text-steel">{item.description}</p> : null}
            </div>
            <div className="shrink-0 text-sm text-steel lg:text-right">
              <p className="font-semibold text-ink">{item.tenant?.businessName ?? "No tenant"}</p>
              <p>{item.assignedTo?.email ?? "Unassigned"}</p>
              <p>{item.dueAt ? shortDate(item.dueAt) : shortDate(item.createdAt ?? null)}</p>
              <div className="mt-3 flex gap-2 lg:justify-end">
                <button onClick={() => update.mutate({ id: item.id, status: "COMPLETED" })} className="h-9 rounded-[8px] bg-pine px-3 text-xs font-semibold text-white">
                  Complete
                </button>
                <button onClick={() => update.mutate({ id: item.id, status: "DISMISSED" })} className="h-9 rounded-[8px] bg-white px-3 text-xs font-semibold text-ink">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {!visible.length ? <Empty label="No platform actions" /> : null}
      {update.error ? <p className="text-sm font-medium text-coral">{update.error instanceof Error ? update.error.message : "Unable to update action"}</p> : null}
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
  const queryClient = useQueryClient();
  const retryAutomation = useMutation({
    mutationFn: (id: string) => api.retryPlatformAutomationFailure(id, "Retried from platform admin failure queue."),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-automation-failures"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    }
  });
  const replayWebhook = useMutation({
    mutationFn: (id: string) => api.replayPlatformWebhookFailure(id, "Replayed from platform admin failure queue."),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-webhook-failures"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-audit"] });
      void queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
    }
  });
  const items = [
    ...(automation ?? []).map((item) => ({
      id: item.id,
      kind: "automation" as const,
      title: item.trigger,
      tenant: item.tenant?.businessName,
      error: item.error,
      createdAt: item.createdAt
    })),
    ...(webhooks ?? []).map((item) => ({
      id: item.id,
      kind: "webhook" as const,
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
          <button
            onClick={() => item.kind === "automation" ? retryAutomation.mutate(item.id) : replayWebhook.mutate(item.id)}
            className="mt-3 h-9 rounded-[8px] bg-ink px-3 text-xs font-semibold text-white disabled:opacity-50"
            disabled={retryAutomation.isPending || replayWebhook.isPending}
          >
            {item.kind === "automation" ? "Retry automation" : "Replay webhook"}
          </button>
        </div>
      ))}
      {!items.length ? <Empty label="No platform failures" /> : null}
      {retryAutomation.error || replayWebhook.error ? (
        <p className="text-sm font-medium text-coral">{((retryAutomation.error ?? replayWebhook.error) as Error).message}</p>
      ) : null}
    </div>
  );
}

function AuditExplorer({ tenants, initialItems }: { tenants?: PlatformTenant[]; initialItems?: PlatformAuditLog[] }) {
  const [q, setQ] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [action, setAction] = useState("");
  const audit = useQuery({
    queryKey: ["platform-audit-filtered", q, tenantId, action],
    queryFn: () => api.platformAudit({ q: q || undefined, tenantId: tenantId || undefined, action: action || undefined, limit: 300 }),
    enabled: Boolean(q || tenantId || action)
  });
  const items = q || tenantId || action ? audit.data : initialItems;
  const actions = Array.from(new Set((initialItems ?? []).map((item) => item.action))).slice(0, 30);
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-[8px] bg-mist p-3 md:grid-cols-[1fr_220px_220px]">
        <div className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3">
          <Search className="h-4 w-4 text-steel" />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search audit summary, actor, action..." className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="h-10 rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine">
          <option value="">All tenants</option>
          {(tenants ?? []).map((tenant) => (
            <option key={tenant.id} value={tenant.id}>{tenant.businessName}</option>
          ))}
        </select>
        <select value={action} onChange={(event) => setAction(event.target.value)} className="h-10 rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine">
          <option value="">All actions</option>
          {actions.map((item) => (
            <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>
      {audit.isFetching ? <p className="text-sm font-medium text-steel">Loading audit...</p> : null}
      <AuditList items={items} />
    </div>
  );
}

function AuditList({ items, compact }: { items?: PlatformAuditLog[]; compact?: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {(items ?? []).slice(0, compact ? 8 : 48).map((item) => (
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
