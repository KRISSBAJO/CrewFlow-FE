import { useAuth } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type LoginResponse = {
  accessToken: string;
  user: {
    id?: string;
    sub: string;
    tenantId: string;
    email: string;
    role: "OWNER" | "MANAGER" | "STAFF";
  };
  tenant?: {
    id: string;
    businessName: string;
    slug: string;
    industry: string;
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
  health: () => request<Health>("/health"),
  schedulerRun: () => request<unknown>("/scheduler/run-now", { method: "POST" }),
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

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  phone?: string | null;
  active?: boolean;
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
