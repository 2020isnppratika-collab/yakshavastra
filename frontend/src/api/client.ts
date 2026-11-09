import { Costume, CartItem, User, Booking, CategoryInfo, EventDetails, PricingBreakdown } from "../types";

const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("yaksha_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${cleanEndpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // not JSON
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: any) => apiRequest<{ access_token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => apiRequest<{ access_token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    getMe: () => apiRequest<User>("/auth/me"),
  },

  // Costumes
  costumes: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const cleanParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") cleanParams.append(k, String(v));
      });
      return apiRequest<{ items: Costume[]; total: number; page: number; total_pages: number }>(`/costumes?${cleanParams.toString()}`);
    },
    getById: (id: string) => apiRequest<Costume>(`/costumes/${id}`),
    getAvailability: (id: string, params: Record<string, string | number | undefined> = {}) => {
      const cleanParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") cleanParams.append(k, String(v));
      });
      return apiRequest<any>(`/costumes/${id}/availability?${cleanParams.toString()}`);
    },
    getCategories: () => apiRequest<{ categories: CategoryInfo[]; character_types: any[]; total_costumes: number }>("/categories"),
  },

  // Bookings
  bookings: {
    quote: (items: any[]) => apiRequest<{ items: any[]; pricing: PricingBreakdown; is_available: boolean; availability_errors: string[] }>("/bookings/quote", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
    checkout: (data: { items: any[]; event_details: EventDetails; pickup_mode: string; notes?: string }) =>
      apiRequest<{ booking: Booking; payment_order: any }>("/bookings/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMyBookings: () => apiRequest<Booking[]>("/bookings"),
    getByIdOrCode: (idOrCode: string) => apiRequest<Booking>(`/bookings/${idOrCode}`),
    cancel: (code: string, reason: string) =>
      apiRequest<Booking>(`/bookings/${code}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },

  // Payments
  payments: {
    verify: (data: { booking_code: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      apiRequest<{ success: boolean; message: string; booking: Booking }>("/payments/verify", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    mockConfirm: (data: { booking_code: string; simulate_failure?: boolean }) =>
      apiRequest<{ success: boolean; message: string; booking: Booking }>("/payments/mock-confirm", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Admin
  admin: {
    getDashboard: () => apiRequest<any>("/admin/dashboard"),
    listBookings: (params: { status_filter?: string; q?: string } = {}) => {
      const clean = new URLSearchParams();
      if (params.status_filter) clean.append("status_filter", params.status_filter);
      if (params.q) clean.append("q", params.q);
      return apiRequest<Booking[]>(`/admin/bookings?${clean.toString()}`);
    },
    updateStatus: (idOrCode: string, newStatus: string) =>
      apiRequest<Booking>(`/admin/bookings/${idOrCode}/status?new_status=${newStatus}`, { method: "PATCH" }),
    recordReturn: (code: string, data: { damage_fee: number; late_fee: number; inspection_notes: string }) =>
      apiRequest<Booking>(`/admin/bookings/${code}/return`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getCalendar: (month?: string) => apiRequest<any[]>(`/admin/calendar${month ? `?month=${month}` : ""}`),
    createCostume: (data: any) => apiRequest<Costume>("/admin/costumes", { method: "POST", body: JSON.stringify(data) }),
    updateCostume: (id: string, data: any) => apiRequest<Costume>(`/admin/costumes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCostume: (id: string) => apiRequest<{ message: string; id: string }>(`/admin/costumes/${id}`, { method: "DELETE" }),
    resetSeed: () => apiRequest<{ message: string }>("/admin/seed", { method: "POST" }),
  },
};
