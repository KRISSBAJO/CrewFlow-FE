"use client";

import {
  AlertTriangle,
  Building2,
  CreditCard,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import {
  api,
  PlatformAuditLog,
  PlatformAutomationFailure,
  PlatformMetrics,
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
  const queryClient = useQueryClient();
  const metrics = useQuery({ queryKey: ["platform-metrics"], queryFn: api.platformMetrics });
  const tenants = useQuery({ queryKey: ["platform-tenants"], queryFn: api.platformTenants });
  const automationFailures = useQuery({ queryKey: ["platform-automation-failures"], queryFn: api.platformAutomationFailures });
  const webhookFailures = useQuery({ queryKey: ["platform-webhook-failures"], queryFn: api.platformWebhookFailures });
  const audit = useQuery({ queryKey: ["platform-audit"], queryFn: api.platformAudit });

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-[1500px] gap-4">
        <header className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">CrewFlow</p>
              <h1 className="text-2xl font-semibold text-ink md:text-3xl">Platform control center</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => queryClient.invalidateQueries()} className="flex h-10 items-center gap-2 rounded-[8px] bg-mist px-3 text-sm font-semibold text-ink">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button onClick={logout} className="flex h-10 items-center gap-2 rounded-[8px] bg-ink px-3 text-sm font-semibold text-white">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <Metrics data={metrics.data} />

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel title="Tenants" icon={Building2}>
            <div className="grid gap-3">
              {(tenants.data ?? []).map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  selected={selectedTenantId === tenant.id}
                  onSelect={() => setSelectedTenantId(tenant.id)}
                />
              ))}
            </div>
          </Panel>
          {selectedTenantId ? (
            <TenantDetail tenantId={selectedTenantId} />
          ) : (
            <Panel title="Failures" icon={AlertTriangle}>
              <FailureList automation={automationFailures.data} webhooks={webhookFailures.data} />
            </Panel>
          )}
        </section>

        <Panel title="Audit stream" icon={ShieldCheck}>
          <AuditList items={audit.data} />
        </Panel>
      </div>
    </main>
  );
}

function Metrics({ data }: { data?: PlatformMetrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Building2} label="Active tenants" value={data?.tenantStatus.ACTIVE ?? 0} />
      <Metric icon={UsersRound} label="Active users" value={data?.activeUsers ?? 0} />
      <Metric icon={CreditCard} label="Paid service revenue" value={money(data?.paidRevenueCents)} />
      <Metric icon={AlertTriangle} label="Failures" value={(data?.failedAutomations ?? 0) + (data?.failedWebhooks ?? 0)} danger />
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
    <div className={cn("rounded-[8px] p-3", selected ? "bg-pine/10 ring-1 ring-pine/30" : "bg-mist")}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button onClick={onSelect} className="min-w-0 text-left">
          <p className="font-semibold text-ink">{tenant.businessName}</p>
          <p className="text-sm text-steel">{tenant.slug} · {tenant.industry}</p>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Status label={tenant.status} />
          <Status label={tenant.subscriptionPlan} />
          <select
            value={tenant.status}
            onChange={(event) => update.mutate(event.target.value as PlatformTenant["status"])}
            className="h-9 rounded-[8px] border border-ink/10 bg-white px-2 text-sm outline-none focus:border-pine"
          >
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CHURNED">Churned</option>
          </select>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-steel sm:grid-cols-3 lg:grid-cols-6">
        <span>{tenant._count?.users ?? 0} users</span>
        <span>{tenant._count?.customers ?? 0} customers</span>
        <span>{tenant._count?.bookings ?? 0} bookings</span>
        <span>{tenant._count?.leads ?? 0} leads</span>
        <span>{tenant._count?.operationalActions ?? 0} actions</span>
        <span>{money(tenant.monthlyPriceCents)} / mo</span>
      </div>
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
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("Support troubleshooting for tenant setup.");
  const [flags, setFlags] = useState("");
  const [limits, setLimits] = useState("");

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

  const tenant = detail.data;
  const effectiveFlags = flags || JSON.stringify(usage.data?.featureFlags ?? tenant?.featureFlags ?? {}, null, 2);
  const effectiveLimits = limits || JSON.stringify(usage.data?.planLimits ?? tenant?.planLimits ?? {}, null, 2);

  return (
    <Panel title={tenant?.businessName ?? "Tenant detail"} icon={ShieldCheck}>
      <div className="grid gap-4">
        <HealthPanel health={health.data} usage={usage.data} tenant={tenant} />
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
    <section className="rounded-[8px] bg-mist p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-steel">Health score</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{health?.score ?? 0}</p>
        </div>
        <Status label={tenant?.status ?? "loading"} />
      </div>
      <div className="mt-3 grid gap-2 text-sm text-steel sm:grid-cols-2">
        <span>{health?.activeUsers ?? 0} active users</span>
        <span>{health?.recentBookings ?? 0} bookings in 30 days</span>
        <span>{health?.openActions ?? 0} open actions</span>
        <span>{health?.overdueInvoices ?? 0} overdue invoices</span>
        <span>{health?.hotLeads ?? 0} hot leads</span>
        <span>{usage?._count.messages ?? 0} messages</span>
      </div>
    </section>
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
    <section className="rounded-[8px] border border-white/80 bg-white/90 p-4 shadow-soft">
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

function Empty({ label }: { label: string }) {
  return (
    <div className="flex min-h-[110px] items-center justify-center rounded-[8px] border border-dashed border-ink/15 bg-white/50 text-sm font-medium text-steel">
      {label}
    </div>
  );
}
