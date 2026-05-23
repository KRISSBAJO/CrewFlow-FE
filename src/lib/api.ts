import { useAuth } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

type LoginResponse = {
  accessToken: string;
  user: {
    sub: string;
    tenantId: string;
    email: string;
    role: "OWNER" | "MANAGER" | "STAFF";
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
    throw new Error(message || `Request failed with ${response.status}`);
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
  actions: () => request<OperationalAction[]>("/actions"),
  updateAction: (id: string, status: "IN_PROGRESS" | "COMPLETED" | "DISMISSED") =>
    request<OperationalAction>(`/actions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  bookings: () => request<Booking[]>("/bookings"),
  createBooking: (input: {
    customerId: string;
    serviceId: string;
    assignedStaffId?: string;
    startTime: string;
    notes?: string;
  }) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(input)
    }),
  customers: () => request<Customer[]>("/customers"),
  services: () => request<Service[]>("/services"),
  staff: () => request<StaffMember[]>("/tenant/staff"),
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

export type Health = {
  status: string;
  database: string;
  latencyMs: number;
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
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  phone?: string | null;
};

export type Service = {
  id: string;
  title: string;
  priceCents: number;
  durationMinutes: number;
};

export type Booking = {
  id: string;
  startTime: string;
  endTime?: string | null;
  status: string;
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
  status: string;
  totalCents: number;
  dueDate: string;
  customer: Customer;
  paymentUrl?: string | null;
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

export type Conversation = {
  id: string;
  status: string;
  channel: string;
  lastMessageAt: string;
  customer?: Customer | null;
  messages?: Array<{ id?: string; content: string; role: string; createdAt: string }>;
  bookingIntents?: unknown[];
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
