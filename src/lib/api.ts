import { useAuth } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type LoginResponse = {
  accessToken: string;
  user: {
    id?: string;
    sub: string;
    tenantId: string;
    email: string;
    role: "PLATFORM_ADMIN" | "OWNER" | "MANAGER" | "STAFF";
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
  inbox: () => request<Conversation[]>("/inbox"),
  conversation: (id: string) => request<Conversation>(`/inbox/${id}`),
  replyConversation: (id: string, content: string) =>
    request<{ message: MessageLog }>(`/inbox/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  suggestReply: (id: string) =>
    request<{ reply: string; mode: string }>(`/inbox/${id}/ai-suggest`, {
      method: "POST"
    }),
  whatsappStatus: () => request<WhatsappStatus>("/webhooks/whatsapp/status"),
  whatsappEvents: () => request<WebhookEvent[]>("/webhooks/whatsapp/events"),
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
  retention: () => request<RetentionSummary>("/retention"),
  scanRetention: () =>
    request<{ scannedAt: string; repeatCandidates: number; winBackCandidates: number; actionsCreatedOrUpdated: number }>(
      "/retention/scan",
      { method: "POST" }
    ),
  health: () => request<Health>("/health"),
  schedulerRun: () => request<unknown>("/scheduler/run-now", { method: "POST" }),
  scanLeadFollowUps: () =>
    request<{ scannedAt: string; count: number; actionsCreatedOrUpdated: number }>(
      "/workflows/scan-lead-follow-ups",
      { method: "POST" }
    ),
  platformMetrics: () => request<PlatformMetrics>("/platform/metrics"),
  platformTenants: () => request<PlatformTenant[]>("/platform/tenants"),
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
        | "billingEmail"
        | "monthlyPriceCents"
        | "setupFeeCents"
        | "trialEndsAt"
        | "currentPeriodEnd"
        | "nextBillingAt"
        | "stripeCustomerId"
        | "stripeSubscriptionId"
        | "featureFlags"
        | "planLimits"
      >
    >
  ) =>
    request<PlatformTenant>(`/platform/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
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
  platformAudit: () => request<PlatformAuditLog[]>("/platform/audit"),
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

export type TenantProfile = {
  id: string;
  businessName: string;
  slug: string;
  industry: string;
  subscriptionPlan: string;
  createdAt: string;
  onboardingProfile?: OnboardingProfile & { completedSteps?: string[] };
  receptionistConfig?: {
    displayName: string;
    serviceArea?: string | null;
    businessHours?: Record<string, string> | null;
    enabled: boolean;
  } | null;
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
  durationMinutes: number;
  price: number;
};

export type StaffInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "OWNER" | "MANAGER" | "STAFF";
};

export type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
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

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
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

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "PLATFORM_ADMIN" | "OWNER" | "MANAGER" | "STAFF";
  phone?: string | null;
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

export type PlatformTenant = {
  id: string;
  businessName: string;
  slug: string;
  industry: string;
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CHURNED";
  subscriptionStatus?: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  subscriptionPlan: string;
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

export type PlatformTenantDetail = PlatformTenant & {
  users?: StaffMember[];
  receptionistConfig?: unknown;
  onboardingProfile?: OnboardingProfile | null;
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
  createdAt: string;
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
  | "CREDIT_APPLIED";

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
  stripeConfigured: boolean;
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

export type Service = {
  id: string;
  title: string;
  description?: string | null;
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
};

export type Payment = {
  id: string;
  status: string;
  amountCents: number;
  provider: string;
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
  customer?: Customer | null;
  messages?: Array<{ id?: string; content: string; role: string; createdAt: string }>;
  bookingIntents?: BookingIntent[];
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
  customer?: Customer | null;
  invoice?: Invoice | null;
  booking?: Booking | null;
};
