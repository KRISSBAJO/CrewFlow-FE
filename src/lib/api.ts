import { useAuth } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type LoginResponse = {
  accessToken: string;
  user: {
    id?: string;
    sub: string;
    tenantId: string;
    email: string;
    role: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" | "OWNER" | "MANAGER" | "STAFF";
  };
  tenant?: {
    id: string;
    businessName: string;
    slug: string;
    industry: string;
    status?: string;
  };
  onboardingProfile?: {
    id: string;
    setupStatus: string;
    services: string[];
    staffCount?: string | null;
    whatsappNumber?: string | null;
    biggestProblem?: string | null;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuth.getState().token;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    let parsed: { message?: string | string[]; error?: string } | null = null;
    try {
      parsed = JSON.parse(message) as { message?: string | string[]; error?: string };
    } catch {
      parsed = null;
    }
    const detail = Array.isArray(parsed?.message) ? parsed.message.join(", ") : parsed?.message;
    throw new Error(detail || parsed?.error || message || `Request failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  register: (input: RegisterInput) =>
    request<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  dashboard: () => request<DashboardSummary>("/dashboard"),
  weeklyDigest: () => request<OwnerWeeklyDigest>("/dashboard/weekly-digest"),
  sendWeeklyDigest: () =>
    request<{ sentAt: string; message: MessageLog; digest: OwnerWeeklyDigest }>("/dashboard/weekly-digest/send", {
      method: "POST"
    }),
  inbox: () => request<Conversation[]>("/inbox"),
  conversation: (id: string) => request<Conversation>(`/inbox/${id}`),
  updateConversation: (
    id: string,
    input: { status?: string; assignedToId?: string; followUpAt?: string }
  ) =>
    request<Conversation>(`/inbox/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  replyConversation: (id: string, content: string) =>
    request<{ message: MessageLog }>(`/inbox/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  convertConversationToLead: (id: string, input: Partial<LeadInput>) =>
    request<Lead>(`/inbox/${id}/lead`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  sendConversationQuote: (id: string, serviceId: string, note?: string) =>
    request<{ message: MessageLog }>(`/inbox/${id}/quote`, {
      method: "POST",
      body: JSON.stringify({ serviceId, note })
    }),
  sendConversationInvoiceLink: (id: string, invoiceId: string, note?: string) =>
    request<{ invoice: Invoice; payment: Payment; reply: { message: MessageLog } }>(`/inbox/${id}/invoice-link`, {
      method: "POST",
      body: JSON.stringify({ invoiceId, note })
    }),
  suggestReply: (id: string) =>
    request<{ reply: string; mode: string }>(`/inbox/${id}/ai-suggest`, {
      method: "POST"
    }),
  whatsappStatus: () => request<WhatsappStatus>("/webhooks/whatsapp/status"),
  whatsappEvents: () => request<WebhookEvent[]>("/webhooks/whatsapp/events"),
  whatsappOnboarding: () => request<WhatsappOnboarding>("/tenant/whatsapp/onboarding"),
  whatsappTemplates: () => request<WhatsappTemplate[]>("/automations/whatsapp-templates"),
  seedWhatsappTemplates: () =>
    request<{ count: number; templates: WhatsappTemplate[] }>("/automations/whatsapp-templates/defaults", {
      method: "POST"
    }),
  submitWhatsappTemplate: (id: string) =>
    request<{ mode: "live" | "mock"; template: WhatsappTemplate; payload?: unknown; raw?: unknown }>(
      `/automations/whatsapp-templates/${id}/submit`,
      { method: "POST" }
    ),
  linkWhatsappTemplate: (id: string, trigger: AutomationTrigger) =>
    request<AutomationRule>(`/automations/whatsapp-templates/${id}/link`, {
      method: "POST",
      body: JSON.stringify({ trigger })
    }),
  automationRuns: () => request<AutomationRun[]>("/automations/runs"),
  retryAutomationRun: (id: string, reason?: string) =>
    request<AutomationRun>(`/automations/runs/${id}/retry`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  bookConversationIntent: (
    conversationId: string,
    intentId: string,
    input: {
      startTime: string;
      assignedStaffId?: string;
      status?: BookingStatus;
      notes?: string;
    }
  ) =>
    request<{ booking: Booking; bookingIntent: BookingIntent; conversation: Conversation }>(
      `/inbox/${conversationId}/booking-intents/${intentId}/book`,
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    ),
  receptionistInquiry: (input: ReceptionistInquiryInput) =>
    request<ReceptionistInquiryResult>("/receptionist/inquiry", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  actions: () => request<OperationalAction[]>("/actions"),
  updateAction: (id: string, status: "IN_PROGRESS" | "COMPLETED" | "DISMISSED") =>
    request<OperationalAction>(`/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  leads: () => request<Lead[]>("/leads"),
  leadAnalytics: () => request<LeadAnalytics>("/leads/analytics"),
  createLead: (input: LeadInput) =>
    request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateLead: (id: string, input: Partial<LeadInput> & { wonLostReason?: string }) =>
    request<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  portal: (slug: string) => request<PublicBookingPortal>(`/portal/${slug}`),
  portalAvailability: (slug: string, serviceId: string, date: string) =>
    request<AvailabilityResponse>(
      `/portal/${slug}/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`
    ),
  portalBooking: (slug: string, bookingId: string) =>
    request<PublicBookingStatus>(`/portal/${slug}/bookings/${bookingId}`),
  portalInvoice: (slug: string, invoiceId: string) =>
    request<PublicInvoiceStatus>(`/portal/${slug}/invoices/${invoiceId}`),
  createPortalBooking: (slug: string, input: PublicBookingInput) =>
    request<PublicBookingResult>(`/portal/${slug}/book`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  bookings: () => request<Booking[]>("/bookings"),
  createBooking: (input: BookingInput) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateBooking: (id: string, input: Partial<BookingInput> & { status?: BookingStatus }) =>
    request<Booking>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  communicationHealth: () => request<CommunicationHealth>("/communications/health"),
  bookingCommunication: (bookingId: string) =>
    request<BookingCommunication>(`/communications/bookings/${bookingId}`),
  sendBookingUpdate: (bookingId: string, input: { type: BookingUpdateType; provider?: string; note?: string }) =>
    request<{ message: MessageLog; provider: unknown }>(`/communications/bookings/${bookingId}/send`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  customers: (search?: string) =>
    request<Customer[]>(search ? `/customers?search=${encodeURIComponent(search)}` : "/customers"),
  customerTimeline: (id: string) => request<CustomerTimeline>(`/customers/${id}/timeline`),
  createCustomer: (input: CustomerInput) =>
    request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateCustomer: (id: string, input: Partial<CustomerInput>) =>
    request<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  importCustomers: (customers: CustomerInput[]) =>
    request<CustomerImportResult>("/customers/import", {
      method: "POST",
      body: JSON.stringify({ customers })
    }),
  importWhatsAppCustomers: (input: { text: string; createLeads?: boolean }) =>
    request<WhatsAppCustomerImportResult>("/customers/import/whatsapp", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  services: () => request<Service[]>("/services"),
  createService: (input: ServiceInput) =>
    request<Service>("/services", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateService: (id: string, input: Partial<ServiceInput> & { active?: boolean }) =>
    request<Service>(`/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  tenant: () => request<TenantProfile>("/tenant"),
  onboarding: () => request<OnboardingProfile>("/tenant/onboarding"),
  activation: () => request<TenantActivationSummary>("/tenant/activation"),
  tenantBilling: () => request<TenantBillingSummary>("/tenant/billing"),
  createTenantBillingCheckout: () =>
    request<TenantBillingSession>("/tenant/billing/checkout", { method: "POST" }),
  createTenantBillingPortal: () =>
    request<TenantBillingSession>("/tenant/billing/portal", { method: "POST" }),
  updateTenant: (input: UpdateTenantInput) =>
    request<TenantProfile>("/tenant", {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  staff: () => request<StaffMember[]>("/tenant/staff"),
  createStaff: (input: StaffInput) =>
    request<StaffMember>("/tenant/staff", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateStaff: (id: string, input: Partial<Omit<StaffInput, "password">> & { active?: boolean }) =>
    request<StaffMember>(`/tenant/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  fieldJobs: () => request<Booking[]>("/field/jobs"),
  fieldDispatch: (date?: string) =>
    request<FieldDispatchBoard>(date ? `/field/dispatch?date=${encodeURIComponent(date)}` : "/field/dispatch"),
  schedulingConflicts: (date?: string) =>
    request<SchedulingConflicts>(date ? `/scheduling/conflicts?date=${encodeURIComponent(date)}` : "/scheduling/conflicts"),
  staffSuggestions: (serviceId: string, startTime: string) =>
    request<StaffSuggestion[]>(
      `/scheduling/staff-suggestions?serviceId=${encodeURIComponent(serviceId)}&startTime=${encodeURIComponent(startTime)}`
    ),
  assignFieldJob: (bookingId: string, input: { staffId: string; dispatchNote?: string }) =>
    request<{ booking: Booking; readiness: FieldDispatchJob }>(`/field/jobs/${bookingId}/assign`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  startFieldJob: (bookingId: string) =>
    request<Booking>(`/field/jobs/${bookingId}/start`, { method: "POST" }),
  saveFieldNotes: (
    bookingId: string,
    input: { staffNotes?: string; photoUrls?: string[] }
  ) =>
    request<FieldJobReport>(`/field/jobs/${bookingId}/notes`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  invoices: () => request<Invoice[]>("/invoices"),
  createInvoiceFromBooking: (bookingId: string) =>
    request<Invoice>(`/invoices/from-booking/${bookingId}`, {
      method: "POST"
    }),
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) =>
    request<Invoice>(`/invoices/${invoiceId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  createPaymentLink: (invoiceId: string) =>
    request<{ invoice: Invoice; payment: Payment }>(`/invoices/${invoiceId}/payment-link`, {
      method: "POST",
      body: JSON.stringify({ provider: "MOCK" })
    }),
  payments: () => request<Payment[]>("/payments"),
  collectionSummary: () => request<CollectionSummary>("/collections/summary"),
  collectionTimeline: (invoiceId: string) =>
    request<CollectionTimeline>(`/collections/invoices/${invoiceId}/timeline`),
  runCollectionAction: (invoiceId: string, input: CollectionActionInput) =>
    request<CollectionActionResult>(`/collections/invoices/${invoiceId}/action`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  scanCollections: () =>
    request<{ scannedAt: string; overdueMarked: number }>("/collections/scan", {
      method: "POST"
    }),
  runCollectionsAutomation: () => request<CollectionsAutomationResult>("/collections/automation/run", { method: "POST" }),
  retention: () => request<RetentionSummary>("/retention"),
  revenueEngine: () => request<CustomerRevenueEngine>("/retention/revenue-engine"),
  scanRetention: () =>
    request<{ scannedAt: string; repeatCandidates: number; winBackCandidates: number; actionsCreatedOrUpdated: number }>(
      "/retention/scan",
      { method: "POST" }
  ),
  sendRevenueCampaign: (input: RevenueCampaignInput) =>
    request<{ sentAt: string; type: string; provider: string; requested: number; sent: number }>("/retention/campaigns/send", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  health: () => request<Health>("/health"),
  readiness: () => request<Readiness>("/health/readiness"),
  schedulerRun: () => request<unknown>("/scheduler/run-now", { method: "POST" }),
  scanLeadFollowUps: () =>
    request<{ scannedAt: string; count: number; actionsCreatedOrUpdated: number }>(
      "/workflows/scan-lead-follow-ups",
      { method: "POST" }
    ),
  scanBillingRecovery: () =>
    request<{ scannedAt: string; actionsCreatedOrUpdated: number }>(
      "/workflows/scan-billing-recovery",
      { method: "POST" }
    ),
  platformMetrics: () => request<PlatformMetrics>("/platform/metrics"),
  platformProviderHealth: () => request<PlatformProviderHealth>("/platform/provider-health"),
  scanPlatformTrials: () =>
    request<PlatformBillingScanResult>("/platform/billing/scan-trials", {
      method: "POST"
    }),
  scanPlatformPastDue: () =>
    request<PlatformBillingScanResult>("/platform/billing/scan-past-due", {
      method: "POST"
    }),
  platformRisk: () => request<PlatformRiskRow[]>("/platform/risk"),
  platformSupportSessions: () => request<PlatformSupportAccess[]>("/platform/support-sessions"),
  platformTenants: () => request<PlatformTenant[]>("/platform/tenants"),
  platformPlans: () => request<PlatformSubscriptionPlan[]>("/platform/plans"),
  createPlatformPlan: (input: PlatformSubscriptionPlanInput) =>
    request<PlatformSubscriptionPlan>("/platform/plans", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updatePlatformPlan: (id: string, input: PlatformSubscriptionPlanInput) =>
    request<PlatformSubscriptionPlan>(`/platform/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  createPlatformTenant: (input: PlatformTenantCreateInput) =>
    request<PlatformTenantDetail>("/platform/tenants", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  platformUsers: () => request<PlatformUser[]>("/platform/users"),
  createPlatformUser: (input: PlatformUserCreateInput) =>
    request<PlatformUser>("/platform/users", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updatePlatformUser: (id: string, input: Partial<Pick<PlatformUser, "name" | "email" | "phone" | "role" | "active">>) =>
    request<PlatformUser>(`/platform/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  platformActions: () => request<PlatformAction[]>("/platform/actions"),
  updatePlatformAction: (id: string, input: Partial<Pick<PlatformAction, "status" | "priority" | "assignedToId" | "dueAt">> & { note?: string }) =>
    request<PlatformAction>(`/platform/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  platformSearch: (q: string) => request<PlatformSearchResult>(`/platform/search?q=${encodeURIComponent(q)}`),
  platformTenant: (id: string) => request<PlatformTenantDetail>(`/platform/tenants/${id}`),
  platformTenantHealth: (id: string) => request<PlatformTenantHealth>(`/platform/tenants/${id}/health`),
  platformTenantUsage: (id: string) => request<PlatformTenantUsage>(`/platform/tenants/${id}/usage`),
  updatePlatformTenant: (
    id: string,
    input: Partial<
      Pick<
        PlatformTenant,
        | "status"
        | "subscriptionStatus"
        | "subscriptionPlan"
        | "subscriptionPlanId"
        | "billingEmail"
        | "monthlyPriceCents"
        | "setupFeeCents"
        | "trialEndsAt"
        | "currentPeriodEnd"
        | "nextBillingAt"
        | "stripeCustomerId"
        | "stripeSubscriptionId"
        | "paystackCustomerCode"
        | "paystackSubscriptionCode"
        | "featureFlags"
        | "planLimits"
      >
    >
  ) =>
    request<PlatformTenant>(`/platform/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  applyPlatformPlan: (id: string, input: { planId: string; overwriteBilling?: boolean; overwriteFeatures?: boolean }) =>
    request<PlatformTenantDetail>(`/platform/tenants/${id}/apply-plan`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  archivePlatformTenant: (id: string, input: { confirmation: string; reason: string }) =>
    request<PlatformTenant>(`/platform/tenants/${id}/archive`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  restorePlatformTenant: (id: string) =>
    request<PlatformTenant>(`/platform/tenants/${id}/restore`, {
      method: "POST"
    }),
  exportPlatformTenant: (id: string) => request<PlatformTenantExport>(`/platform/tenants/${id}/export`),
  platformTenantTimeline: (id: string) => request<PlatformTimelineItem[]>(`/platform/tenants/${id}/timeline`),
  platformSupportNotes: (id: string) => request<PlatformSupportNote[]>(`/platform/tenants/${id}/support-notes`),
  addPlatformSupportNote: (id: string, note: string) =>
    request<PlatformSupportNote>(`/platform/tenants/${id}/support-notes`, {
      method: "POST",
      body: JSON.stringify({ note })
    }),
  platformSupportAccess: (id: string) => request<PlatformSupportAccess[]>(`/platform/tenants/${id}/support-access`),
  createPlatformSupportAccess: (id: string, reason: string) =>
    request<PlatformSupportAccess>(`/platform/tenants/${id}/support-access`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  impersonatePlatformTenant: (token: string) =>
    request<LoginResponse>(`/platform/support-access/${token}/impersonate`, {
      method: "POST"
    }),
  revokePlatformSupportAccess: (id: string) =>
    request<PlatformSupportAccess>(`/platform/support-access/${id}/revoke`, {
      method: "POST"
    }),
  platformBilling: (id: string) => request<PlatformBillingSummary>(`/platform/tenants/${id}/billing`),
  platformBillingEvents: (id: string) => request<PlatformBillingEvent[]>(`/platform/tenants/${id}/billing-events`),
  createPlatformBillingEvent: (id: string, input: PlatformBillingEventInput) =>
    request<PlatformBillingEvent>(`/platform/tenants/${id}/billing-events`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  createPlatformBillingCheckout: (id: string, input: PlatformBillingCheckoutInput) =>
    request<PlatformBillingCheckout>(`/platform/tenants/${id}/billing/checkout`, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  createPlatformBillingPortal: (id: string) =>
    request<PlatformBillingPortal>(`/platform/tenants/${id}/billing/portal`, {
      method: "POST"
    }),
  platformAutomationFailures: () => request<PlatformAutomationFailure[]>("/platform/automation-failures"),
  platformWebhookFailures: () => request<PlatformWebhookFailure[]>("/platform/webhook-failures"),
  retryPlatformAutomationFailure: (id: string, reason?: string) =>
    request<PlatformAutomationFailure>(`/platform/automation-failures/${id}/retry`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  replayPlatformWebhookFailure: (id: string, reason?: string) =>
    request<PlatformWebhookFailure>(`/platform/webhook-failures/${id}/replay`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),
  platformExports: () => request<PlatformAuditLog[]>("/platform/exports"),
  platformAudit: (filters?: { tenantId?: string; action?: string; q?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.tenantId) params.set("tenantId", filters.tenantId);
    if (filters?.action) params.set("action", filters.action);
    if (filters?.q) params.set("q", filters.q);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return request<PlatformAuditLog[]>(`/platform/audit${query ? `?${query}` : ""}`);
  },
  completeFieldJob: (
    bookingId: string,
    input?: {
      checklist?: Array<{ label: string; done: boolean; note?: string }>;
      photoUrls?: string[];
      staffNotes?: string;
      customerSignatureName?: string;
      customerSignatureUrl?: string;
      autoInvoice?: boolean;
    }
  ) =>
    request<{ booking: Booking; report: FieldJobReport; invoice?: Invoice | null }>(`/field/jobs/${bookingId}/complete`, {
      method: "POST",
      body: JSON.stringify(
        input ?? {
          checklist: [
            { label: "Service completed", done: true },
            { label: "Customer notified", done: true }
          ],
          staffNotes: "Completed from CrewFlow console.",
          autoInvoice: true
        }
      )
    })
};

export type RegisterInput = {
  businessName: string;
  industry: string;
  ownerName: string;
  phone?: string;
  email: string;
  password: string;
  services?: string[];
  staffCount?: string;
  whatsappNumber?: string;
  biggestProblem?: string;
};

export type Health = {
  status: string;
  database: string;
  latencyMs: number;
};

export type Readiness = {
  status: string;
  productionReady: boolean;
  checks: {
    database: string;
    api: {
      publicUrlConfigured: boolean;
      https: boolean;
    };
    security: {
      corsOrigins: number;
      rateLimitEnabled: boolean;
      jwtConfigured: boolean;
    };
    integrations: {
      stripe: {
        configured: boolean;
        webhookSecretConfigured: boolean;
      };
      paystack?: {
        configured: boolean;
        currency: string;
        platformPlanConfigured: boolean;
        tenantPlanConfigured: boolean;
      };
      whatsapp: {
        configured: boolean;
        appSecretConfigured: boolean;
        mode: string;
      };
      openai: {
        configured: boolean;
        model: string;
      };
    };
    scheduler: {
      enabled: boolean;
      intervalMs: number;
    };
  };
  warnings: string[];
  uptimeSeconds: number;
  latencyMs: number;
  environment: string;
  timestamp: string;
};

export type TenantProfile = {
  id: string;
  businessName: string;
  slug: string;
  industry: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  brandColor?: string | null;
  subscriptionPlan: string;
  subscriptionStatus?: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  billingEmail?: string | null;
  monthlyPriceCents?: number | null;
  setupFeeCents?: number | null;
  currentPeriodEnd?: string | null;
  nextBillingAt?: string | null;
  pastDueAt?: string | null;
  canceledAt?: string | null;
  featureFlags?: Record<string, boolean> | null;
  planLimits?: Record<string, number> | null;
  createdAt: string;
  onboardingProfile?: OnboardingProfile & { completedSteps?: string[] };
  receptionistConfig?: {
    displayName: string;
    serviceArea?: string | null;
    businessHours?: Record<string, string> | null;
    enabled: boolean;
  } | null;
};

export type TenantBillingSummary = {
  tenantId: string;
  subscriptionPlan: string;
  subscriptionStatus: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  monthlyPriceCents?: number | null;
  setupFeeCents?: number | null;
  billingEmail?: string | null;
  currentPeriodEnd?: string | null;
  nextBillingAt?: string | null;
  pastDueAt?: string | null;
  canceledAt?: string | null;
  stripeConfigured: boolean;
  paystackConfigured?: boolean;
  hasStripeCustomer: boolean;
  hasPaystackCustomer?: boolean;
  limits: Record<string, number>;
  usage: Record<string, number>;
  events: PlatformBillingEvent[];
};

export type TenantBillingSession = {
  provider: string;
  mock?: boolean;
  sessionId: string;
  url?: string | null;
};

export type TenantActivationStep = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  target: string;
};

export type TenantActivationSummary = {
  score: number;
  completed: number;
  total: number;
  setupStatus: string;
  launchReady: boolean;
  nextStep?: TenantActivationStep | null;
  steps: TenantActivationStep[];
  counts: Record<string, number>;
  biggestProblem?: string | null;
};

export type OnboardingProfile = {
  id: string;
  tenantId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  staffCount?: string | null;
  whatsappNumber?: string | null;
  services: string[];
  biggestProblem?: string | null;
  setupStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTenantInput = {
  businessName?: string;
  industry?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  brandColor?: string;
  whatsappNumber?: string;
  serviceArea?: string;
  businessHours?: Record<string, string>;
  biggestProblem?: string;
  staffCount?: string;
  completedSteps?: string[];
  whatsappPlanned?: boolean;
};

export type ServiceInput = {
  title: string;
  description?: string;
  imageUrl?: string;
  durationMinutes: number;
  price: number;
};

export type StaffInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  role: "OWNER" | "MANAGER" | "STAFF";
};

export type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  notes?: string;
};

export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export type RepeatFrequency = "none" | "weekly" | "biweekly" | "monthly";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "BOOKING_READY"
  | "WON"
  | "LOST";

export type LeadSource =
  | "AI_RECEPTIONIST"
  | "WEB_CHAT"
  | "WHATSAPP"
  | "SMS"
  | "EMAIL"
  | "PHONE"
  | "REFERRAL"
  | "MANUAL";

export type LeadInput = {
  title: string;
  status?: LeadStatus;
  source?: LeadSource;
  customerId?: string;
  conversationId?: string;
  assignedToId?: string;
  estimatedValueCents?: number;
  conversionProbability?: number;
  followUpAt?: string;
  notes?: string;
};

export type BookingInput = {
  customerId?: string;
  inlineCustomer?: CustomerInput;
  serviceId: string;
  assignedStaffId?: string;
  startTime: string;
  status?: BookingStatus;
  source?: string;
  notes?: string;
  repeatFrequency?: RepeatFrequency;
  repeatCount?: number;
};

export type BookingUpdateType =
  | "CONFIRM_APPOINTMENT"
  | "CREW_ASSIGNED"
  | "ON_THE_WAY"
  | "RUNNING_LATE"
  | "INVOICE_READY"
  | "REVIEW_REQUEST";

export type BookingCommunication = {
  booking: Booking;
  timeline: Array<{
    id: string;
    kind: "message" | "automation";
    createdAt: string;
    title: string;
    status: string;
    provider: string;
    content?: string | null;
    error?: string | null;
  }>;
  suggestions: Array<{
    type: BookingUpdateType;
    label: string;
    sent: boolean;
    preview: string;
  }>;
};

export type CommunicationHealth = {
  generatedAt: string;
  summary: {
    checkedBookings: number;
    risks: number;
    missingConfirmation: number;
    missingOnTheWay: number;
    missingReview: number;
  };
  risks: Array<{
    bookingId: string;
    customerName: string;
    serviceTitle: string;
    startTime: string;
    type: BookingUpdateType;
    title: string;
    severity: "warning" | "critical";
  }>;
};

export type PublicBookingPortal = {
  tenant: {
    id: string;
    businessName: string;
    slug: string;
    industry: string;
    status: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    brandColor?: string | null;
  };
  booking: {
    paymentEnabled: boolean;
    defaultStatus: BookingStatus;
    source: string;
  };
  receptionist?: {
    serviceArea?: string | null;
    businessHours?: unknown;
    quoteDisclaimer?: string;
    bookingBufferMinutes?: number;
    maxAdvanceDays?: number;
  } | null;
  services: Service[];
};

export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
  reason?: string;
};

export type AvailabilityResponse = {
  date: string;
  service: Pick<Service, "id" | "title" | "durationMinutes" | "priceCents">;
  rules: {
    slotMinutes: number;
    bookingBufferMinutes: number;
    maxAdvanceDays: number;
  };
  slots: AvailabilitySlot[];
  recommended?: AvailabilitySlot | null;
};

export type SchedulingConflicts = {
  date: string;
  summary: {
    bookings: number;
    risks: number;
    critical: number;
  };
  risks: Array<{
    type: string;
    title: string;
    score: number;
    bookingId: string;
    customerName: string;
    serviceTitle: string;
    startTime: string;
    assignedStaffName?: string | null;
  }>;
};

export type StaffSuggestion = StaffMember & {
  available: boolean;
  dailyMinutes: number;
  score: number;
  conflicts: Booking[];
};

export type PublicBookingInput = {
  serviceId: string;
  startTime: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  payNow?: boolean;
};

export type PublicBookingResult = {
  booking: Booking;
  customer: Customer;
  invoice?: Invoice | null;
  payment?: Payment | null;
  links?: {
    successPath: string;
    invoicePath?: string | null;
  };
};

export type PublicBookingStatus = {
  tenant: PublicBookingPortal["tenant"];
  booking: Booking;
  invoice?: Invoice | null;
  payment?: Payment | null;
  nextSteps: string[];
};

export type PublicInvoiceStatus = {
  tenant: PublicBookingPortal["tenant"];
  invoice: Invoice;
  payment?: Payment | null;
  checkoutUrl?: string | null;
};

export type DashboardSummary = {
  today: {
    appointments: Booking[];
    confirmed: number;
  };
  revenue: {
    paidTotalCents: number;
    unpaidTotalCents: number;
    noShowRiskCents: number;
    atRiskTotalCents: number;
  };
  pendingInvoices: number;
  overdueInvoices: number;
  activeStaff: number;
  recentMessages: MessageLog[];
  operations: {
    unassignedToday: number;
    pendingRequests: number;
    urgentActions: OperationalAction[];
    alerts: Array<{
      key: string;
      severity: "info" | "warning" | "critical";
      title: string;
      value?: number;
      amountCents?: number;
    }>;
  };
};

export type OwnerWeeklyDigest = {
  businessName: string;
  recipient: string;
  period: { from: string; to: string };
  metrics: {
    collectedCents: number;
    paidInvoiceCount: number;
    openInvoiceCents: number;
    openInvoiceCount: number;
    overdueInvoiceCents: number;
    overdueInvoiceCount: number;
    completedBookings: number;
    upcomingBookings: number;
    noShowCount: number;
    noShowRiskCents: number;
    leadsCreated: number;
    wonLeads: number;
    bookingReadyLeadCount: number;
    bookingReadyLeadValueCents: number;
    retentionActions: number;
    dispatchIssues: number;
  };
  topRisks: Array<{
    title: string;
    severity: "info" | "warning" | "critical";
    amountCents?: number;
    count?: number;
  }>;
  recommendedActions: Array<{
    id: string;
    title: string;
    priority: string;
    type: string;
    dueAt?: string | null;
    customerName?: string | null;
    invoiceNo?: string | null;
    serviceTitle?: string | null;
  }>;
  text: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
  notes?: string | null;
  updatedAt?: string;
};

export type CustomerImportResult = {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  results: Array<{
    phone: string;
    status: "created" | "updated" | "skipped";
    id?: string;
    reason?: string;
  }>;
};

export type WhatsAppCustomerImportResult = CustomerImportResult & {
  parsedMessages: number;
  ignoredLines: number;
  conversationsCreated: number;
  messagesCreated: number;
  leadsCreated: number;
};

export type CustomerTimeline = {
  customerId: string;
  summary?: {
    paidTotalCents: number;
    openInvoiceCents: number;
    bookingCount: number;
    invoiceCount: number;
    lastBooking?: Booking | null;
    nextBooking?: Booking | null;
  };
  items: Array<{
    type: string;
    occurredAt: string;
    item: unknown;
  }>;
};

export type RetentionCustomer = {
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  completedBookings: number;
  paidTotalCents: number;
  openInvoiceCents: number;
  lastBookingAt?: string | null;
  lastBookingId?: string | null;
  serviceTitle: string;
  daysSinceLastBooking: number;
  hasFutureBooking: boolean;
  estimatedNextValueCents: number;
  lifetimeValueCents: number;
  recommendation: string;
  segmentTags?: string[];
  riskScore?: number;
  nextBestAction?: {
    type: string;
    label: string;
    message: string;
    priorityScore: number;
  };
};

export type RetentionSummary = {
  retainedRevenueCents: number;
  paidRevenueCents: number;
  repeatOpportunityCents: number;
  winBackOpportunityCents: number;
  repeatCandidates: RetentionCustomer[];
  winBackCandidates: RetentionCustomer[];
  topCustomers: RetentionCustomer[];
};

export type CustomerRevenueEngine = {
  generatedAt: string;
  summary: {
    customers: number;
    lifetimeValueCents: number;
    openInvoiceCents: number;
    repeatReadyCents: number;
    winBackCents: number;
    highValueCount: number;
    atRiskCount: number;
  };
  segments: {
    highValue: RetentionCustomer[];
    overduePayers: RetentionCustomer[];
    inactive: RetentionCustomer[];
    repeatReady: RetentionCustomer[];
    newCustomers: RetentionCustomer[];
  };
  nextBestActions: RetentionCustomer[];
  customers: RetentionCustomer[];
};

export type RevenueCampaignInput = {
  type: "REBOOKING" | "WIN_BACK" | "VIP_CHECK_IN" | "PAYMENT_RECOVERY";
  customerIds: string[];
  provider?: "WHATSAPP" | "SMS" | "WEB_CHAT";
  note?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" | "OWNER" | "MANAGER" | "STAFF";
  phone?: string | null;
  avatarUrl?: string | null;
  active?: boolean;
};

export type PlatformMetrics = {
  tenantStatus: Record<string, number>;
  activeUsers: number;
  bookings: number;
  leads: number;
  openActions: number;
  failedAutomations: number;
  failedWebhooks: number;
  paidRevenueCents: number;
  mrrCents: number;
  pastDueTenants: number;
};

export type PlatformBillingScanResult = {
  scannedAt: string;
  tenantCount: number;
  actionsCreatedOrUpdated: number;
  results: Array<{
    scannedAt: string;
    subscriptionStatus: string;
    actionsCreatedOrUpdated: number;
  }>;
};

export type PlatformProviderHealth = {
  checkedAt: string;
  integrations: {
    whatsapp: {
      configured: boolean;
      verifyTokenConfigured: boolean;
      appSecretConfigured: boolean;
    };
    stripe: {
      configured: boolean;
      webhookSecretConfigured: boolean;
    };
    paystack: {
      configured: boolean;
      currency: string;
      platformPlanConfigured: boolean;
      tenantPlanConfigured: boolean;
    };
  };
  queues: {
    failedAutomations: number;
    pendingAutomations: number;
  };
  webhooks: Record<string, Record<string, number>>;
  recentWebhooks: PlatformWebhookFailure[];
  recentRuns: PlatformAutomationFailure[];
};

export type PlatformRiskRow = {
  tenant: PlatformTenant;
  score: number;
  severity: "critical" | "warning" | "healthy";
  reasons: string[];
  failedAutomations: number;
  failedWebhooks: number;
  openActions: number;
  overdueInvoices: number;
  hotLeads: number;
  recentBookings: number;
  activeSupportSessions: number;
  lastActivityAt: string;
};

export type PlatformTenant = {
  id: string;
  businessName: string;
  slug: string;
  industry: string;
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | "CHURNED";
  subscriptionStatus?: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  subscriptionPlan: string;
  subscriptionPlanId?: string | null;
  plan?: PlatformSubscriptionPlan | null;
  billingEmail?: string | null;
  monthlyPriceCents?: number | null;
  setupFeeCents?: number | null;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  nextBillingAt?: string | null;
  pastDueAt?: string | null;
  canceledAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  paystackCustomerCode?: string | null;
  paystackSubscriptionCode?: string | null;
  featureFlags?: Record<string, boolean> | null;
  planLimits?: Record<string, number> | null;
  suspendedAt?: string | null;
  createdAt: string;
  _count?: {
    users: number;
    customers: number;
    bookings: number;
    leads: number;
    invoices: number;
    operationalActions: number;
  };
};

export type PlatformSubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  currency: string;
  monthlyPriceCents: number;
  setupFeeCents: number;
  stripePriceId?: string | null;
  paystackPlanCode?: string | null;
  featureFlags?: Record<string, boolean> | null;
  planLimits?: Record<string, number> | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { tenants: number };
};

export type PlatformSubscriptionPlanInput = Partial<
  Pick<
    PlatformSubscriptionPlan,
    | "name"
    | "slug"
    | "description"
    | "active"
    | "currency"
    | "monthlyPriceCents"
    | "setupFeeCents"
    | "stripePriceId"
    | "paystackPlanCode"
    | "featureFlags"
    | "planLimits"
    | "sortOrder"
  >
>;

export type PlatformTenantCreateInput = {
  businessName: string;
  industry: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
  slug?: string;
  status?: PlatformTenant["status"];
  subscriptionStatus?: PlatformTenant["subscriptionStatus"];
  subscriptionPlan?: string;
  subscriptionPlanId?: string;
  monthlyPriceCents?: number;
  setupFeeCents?: number;
  featureFlags?: Record<string, boolean>;
  planLimits?: Record<string, number>;
};

export type PlatformTenantDetail = PlatformTenant & {
  users?: StaffMember[];
  receptionistConfig?: unknown;
  onboardingProfile?: OnboardingProfile | null;
};

export type PlatformUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" | "OWNER" | "MANAGER" | "STAFF";
  phone?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tenant?: Pick<PlatformTenant, "id" | "businessName" | "slug" | "status" | "subscriptionStatus">;
};

export type PlatformUserCreateInput = {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: PlatformUser["role"];
};

export type PlatformAction = OperationalAction & {
  tenant?: PlatformTenant;
  assignedTo?: { id: string; name: string; email: string; role: string } | null;
  assignedToId?: string | null;
};

export type PlatformTenantHealth = {
  score: number;
  status: string;
  openActions: number;
  failedAutomations: number;
  failedWebhooks: number;
  overdueInvoices: number;
  hotLeads: number;
  recentBookings: number;
  activeUsers: number;
  lastActivityAt: string;
};

export type PlatformTenantUsage = {
  id: string;
  businessName: string;
  featureFlags?: Record<string, boolean> | null;
  planLimits?: Record<string, number> | null;
  _count: Record<string, number>;
};

export type PlatformSupportNote = {
  id: string;
  note: string;
  createdAt: string;
  author?: { id: string; email: string; role: string } | null;
};

export type PlatformSupportAccess = {
  id: string;
  reason: string;
  token: string;
  expiresAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  tenant?: PlatformTenant | null;
  admin?: { id: string; email: string; role: string } | null;
};

export type PlatformBillingEventType =
  | "SETUP_FEE_INVOICED"
  | "SETUP_FEE_PAID"
  | "SUBSCRIPTION_STARTED"
  | "SUBSCRIPTION_RENEWED"
  | "PAYMENT_FAILED"
  | "PAST_DUE"
  | "CANCELED"
  | "CREDIT_APPLIED"
  | "REFUND_ISSUED";

export type PlatformBillingEventInput = {
  type: PlatformBillingEventType;
  amountCents?: number;
  provider?: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export type PlatformBillingEvent = {
  id: string;
  type: PlatformBillingEventType;
  amountCents?: number | null;
  provider: string;
  note?: string | null;
  createdAt: string;
  actor?: { id: string; email: string; role: string } | null;
};

export type PlatformBillingCheckoutInput = {
  provider?: "stripe" | "paystack" | "mock";
  currency?: string;
  paystackPlanCode?: string;
  monthlyPriceCents?: number;
  setupFeeCents?: number;
  collectSetupFee?: boolean;
  successUrl?: string;
  cancelUrl?: string;
};

export type PlatformBillingCheckout = {
  provider: string;
  mock: boolean;
  url?: string | null;
  sessionId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  currency?: string | null;
};

export type PlatformBillingPortal = {
  provider: string;
  sessionId: string;
  url?: string | null;
};

export type PlatformBillingSummary = {
  tenantId: string;
  subscriptionStatus: string;
  monthlyPriceCents?: number | null;
  setupFeeCents?: number | null;
  billingEmail?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  paystackCustomerCode?: string | null;
  paystackSubscriptionCode?: string | null;
  stripeConfigured: boolean;
  paystackConfigured?: boolean;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  nextBillingAt?: string | null;
  pastDueAt?: string | null;
  canceledAt?: string | null;
  collectedCents: number;
  failedCount: number;
  events: PlatformBillingEvent[];
};

export type PlatformAutomationFailure = {
  id: string;
  trigger: string;
  provider: string;
  status: string;
  error?: string | null;
  createdAt: string;
  tenant?: PlatformTenant | null;
  customer?: Customer | null;
};

export type PlatformWebhookFailure = {
  id: string;
  provider: string;
  status: string;
  error?: string | null;
  createdAt: string;
  tenant?: PlatformTenant | null;
};

export type PlatformAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  createdAt: string;
  tenant?: PlatformTenant | null;
  actor?: { id: string; email: string; role: string } | null;
};

export type PlatformSearchResult = {
  query: string;
  tenants: PlatformTenant[];
  users: PlatformUser[];
  customers: Array<Customer & { tenant?: PlatformTenant }>;
  bookings: Array<Booking & { tenant?: PlatformTenant; customer?: Customer; service?: Service }>;
  leads: Array<Lead & { tenant?: PlatformTenant; customer?: Customer }>;
  invoices: Array<Invoice & { tenant?: PlatformTenant; customer?: Customer }>;
};

export type PlatformTimelineItem = {
  id: string;
  kind: string;
  title: string;
  summary?: string | null;
  amountCents?: number | null;
  createdAt: string;
  actor?: { id: string; email: string; role: string } | null;
};

export type PlatformTenantExport = {
  exportedAt: string;
  tenant: PlatformTenantDetail & Record<string, unknown>;
};

export type Service = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents: number;
  durationMinutes: number;
  active?: boolean;
};

export type Booking = {
  id: string;
  startTime: string;
  endTime?: string | null;
  status: BookingStatus;
  notes?: string | null;
  customer: Customer;
  service: Service;
  assignedStaff?: { id: string; name: string } | null;
  invoice?: Invoice | null;
  fieldJobReport?: FieldJobReport | null;
};

export type FieldDispatchJob = Booking & {
  readiness: {
    ready: boolean;
    assigned: boolean;
    confirmed: boolean;
    hasCustomerPhone: boolean;
    hasServiceWindow: boolean;
    reportStarted: boolean;
    completed: boolean;
    blockers: string[];
    score: number;
  };
};

export type FieldDispatchBoard = {
  date: string;
  summary: {
    totalJobs: number;
    unassigned: number;
    needsConfirmation: number;
    ready: number;
    inProgress: number;
    completed: number;
  };
  jobs: FieldDispatchJob[];
  staffLoad: Array<StaffMember & { jobs: number; minutes: number; nextJob?: Booking | null }>;
  openDispatchActions: OperationalAction[];
};

export type FieldJobReport = {
  id: string;
  status: string;
  checklist?: Array<{ label: string; done: boolean; note?: string }> | null;
  photoUrls: string[];
  staffNotes?: string | null;
  customerSignatureName?: string | null;
  customerSignatureUrl?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  subtotalCents?: number;
  taxCents?: number;
  totalCents: number;
  dueDate: string;
  customer: Customer;
  booking?: { id: string; service?: Service } | null;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitCents: number;
    totalCents: number;
  }>;
  paymentUrl?: string | null;
  paymentProvider?: string | null;
  daysPastDue?: number;
  agingBucket?: string;
  hasPaymentLink?: boolean;
  latestPaymentStatus?: string | null;
  pendingPaymentAttempts?: number;
  collectionRisk?: number;
};

export type Payment = {
  id: string;
  status: string;
  amountCents: number;
  provider: string;
  checkoutUrl?: string | null;
  invoice: Invoice;
};

export type MessageLog = {
  id: string;
  direction: string;
  content: string;
  provider: string;
  createdAt: string;
  customer?: Customer | null;
};

export type CollectionSummary = {
  generatedAt: string;
  summary: {
    openCents: number;
    overdueCents: number;
    paidLast30Cents: number;
    openCount: number;
    overdueCount: number;
    noPaymentLinkCount: number;
    highRiskCount: number;
  };
  agingBuckets: Array<{
    key: string;
    label: string;
    count: number;
    totalCents: number;
  }>;
  priorityInvoices: Invoice[];
  invoices: Invoice[];
};

export type CollectionTimelineEvent = {
  id: string;
  type: "payment" | "message" | "audit";
  label: string;
  detail: string;
  createdAt: string;
  actor?: { id: string; name?: string | null; email: string; role: string } | null;
};

export type CollectionTimeline = {
  invoice: Invoice;
  events: CollectionTimelineEvent[];
};

export type CollectionActionInput = {
  type: "SEND_PAYMENT_LINK" | "SEND_REMINDER" | "MARK_PAID" | "VOID_INVOICE" | "PROMISE_TO_PAY";
  provider?: "WHATSAPP" | "SMS" | "WEB_CHAT";
  note?: string;
  promiseDate?: string;
};

export type CollectionActionResult = {
  action: CollectionActionInput["type"];
  invoice: Invoice;
  payment?: Payment | null;
  message?: MessageLog;
  timeline?: CollectionTimeline;
};

export type CollectionsAutomationResult = {
  scannedAt: string;
  invoicesScanned: number;
  messagesSent: number;
  actionsCreatedOrUpdated: number;
  paymentLinksCreated: number;
  receiptsSent: number;
  promiseFollowUpsCreatedOrUpdated: number;
};

export type WhatsappStatus = {
  provider: {
    mode: "live" | "mock";
    ready: boolean;
    checks: {
      accessToken: boolean;
      phoneNumberId: boolean;
      verifyToken: boolean;
      appSecret: boolean;
      signatureVerification: boolean;
    };
  };
  webhook: {
    verifyTokenConfigured: boolean;
    appSecretConfigured: boolean;
    events: number;
    failedEvents: number;
  };
  messages: {
    inbound: number;
    outbound: number;
  };
};

export type WebhookEvent = {
  id: string;
  provider: string;
  providerEventId?: string | null;
  status: string;
  error?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

export type AutomationTrigger =
  | "BOOKING_CONFIRMED"
  | "STAFF_ON_THE_WAY"
  | "MISSED_APPOINTMENT"
  | "INVOICE_DUE"
  | "REVIEW_REQUEST"
  | "LEAD_FOLLOW_UP"
  | "REBOOKING_REMINDER"
  | "CUSTOMER_WINBACK";

export type WhatsappTemplate = {
  id: string;
  tenantId: string;
  trigger?: AutomationTrigger | null;
  name: string;
  language: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAUSED";
  body: string;
  sampleValues?: Record<string, string> | null;
  variableKeys: string[];
  metaTemplateId?: string | null;
  rejectionReason?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AutomationRule = {
  id: string;
  trigger: AutomationTrigger;
  provider: string;
  template: string;
  whatsappTemplateId?: string | null;
  active: boolean;
  delayMinutes: number;
  whatsappTemplate?: WhatsappTemplate | null;
};

export type WhatsappOnboarding = {
  liveReady: boolean;
  webhookUrl: string;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  businessAccountConfigured: boolean;
  templates: WhatsappTemplate[];
  automationRules: AutomationRule[];
  score: number;
  steps: Array<{
    id: string;
    label: string;
    detail: string;
    done: boolean;
  }>;
};

export type AutomationRun = {
  id: string;
  trigger: string;
  provider: string;
  status: string;
  scheduledFor: string;
  sentAt?: string | null;
  content?: string | null;
  error?: string | null;
  customer?: Customer | null;
  booking?: Booking | null;
  invoice?: Invoice | null;
};

export type Conversation = {
  id: string;
  status: string;
  channel: string;
  lastMessageAt: string;
  assignedToId?: string | null;
  followUpAt?: string | null;
  customer?: Customer | null;
  messages?: Array<{ id?: string; content: string; role: string; createdAt: string }>;
  bookingIntents?: BookingIntent[];
  leads?: Lead[];
};

export type Lead = {
  id: string;
  title: string;
  status: LeadStatus;
  source: LeadSource;
  estimatedValueCents?: number | null;
  conversionProbability: number;
  followUpAt?: string | null;
  wonLostReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer | null;
  conversation?: Conversation | null;
  bookingIntent?: BookingIntent | null;
  booking?: Booking | null;
  assignedTo?: StaffMember | null;
};

export type LeadAnalytics = {
  total: number;
  open: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  openPipelineCents: number;
  weightedPipelineCents: number;
  wonValueCents: number;
  wonCount: number;
  lostCount: number;
  conversionRate: number;
  followUpsDue: number;
  leadToBooking: {
    wonBookings: number;
    bookingValueCents: number;
  };
};

export type BookingIntent = {
  id: string;
  status: "COLLECTING" | "READY" | "BOOKED" | "HANDED_OFF" | "CANCELLED";
  requestedDate?: string | null;
  preferredWindow?: string | null;
  address?: string | null;
  notes?: string | null;
  quotedPriceCents?: number | null;
  missingFields: string[];
  customer?: Customer | null;
  service?: Service | null;
  booking?: Booking | null;
};

export type ReceptionistInquiryInput = {
  customerName?: string;
  phone?: string;
  message: string;
  conversationId?: string;
  channel?: "WHATSAPP" | "SMS" | "WEB_CHAT" | "EMAIL" | "SYSTEM";
};

export type ReceptionistInquiryResult = {
  reply: string;
  customer?: Customer | null;
  conversationId: string;
  bookingIntent?: BookingIntent | null;
  suggestedSlots?: string[];
  missingFields: string[];
  handoff: boolean;
};

export type OperationalAction = {
  id: string;
  type: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  createdAt?: string;
  customer?: Customer | null;
  invoice?: Invoice | null;
  booking?: Booking | null;
};
