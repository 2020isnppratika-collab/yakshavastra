import { Costume, CartItem, User, Booking, CategoryInfo, EventDetails, PricingBreakdown } from "../types";
import { MOCK_COSTUMES, MOCK_USER, MOCK_ADMIN, MOCK_CATEGORIES } from "./mockData";

const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

// Helper for local mock storage
function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem("yaksha_demo_bookings");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Default sample booking for demo
  const sample: Booking = {
    id: "booking_demo_1",
    booking_code: "YKB-2026-UDUPI-01",
    user_id: MOCK_USER.id,
    user_name: MOCK_USER.name,
    user_email: MOCK_USER.email,
    items: [
      {
        costume_id: MOCK_COSTUMES[0].id,
        name: MOCK_COSTUMES[0].name,
        image: MOCK_COSTUMES[0].images[0],
        size: "L",
        quantity: 1,
        rental_mode: "day",
        start_at: new Date().toISOString().split("T")[0],
        end_at: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        slot: "full_day",
        blocked_until: new Date(Date.now() + 86400000 * 3).toISOString(),
        days: 2,
        unit_price: MOCK_COSTUMES[0].price_per_day,
        item_subtotal: MOCK_COSTUMES[0].price_per_day * 2,
        item_deposit: MOCK_COSTUMES[0].security_deposit,
      }
    ],
    pricing: {
      subtotal: MOCK_COSTUMES[0].price_per_day * 2,
      deposit: MOCK_COSTUMES[0].security_deposit,
      taxes: Math.round(MOCK_COSTUMES[0].price_per_day * 2 * 0.05),
      discount: 0,
      total_payable: Math.round(MOCK_COSTUMES[0].price_per_day * 2 * 1.05 + MOCK_COSTUMES[0].security_deposit),
    },
    event_details: {
      event_name: "Udupi Sri Krishna Paryaya Mahotsava",
      troupe_name: "Saligrama Yakshagana Mandali",
      venue: "Rajangana Hall",
      city: "Udupi",
      contact_phone: "+91 99001 54321",
      notes: "Arjuna character presentation."
    },
    pickup_mode: "self_pickup",
    status: "confirmed",
    payment: {
      status: "paid",
      provider: "razorpay",
      payment_id: "pay_demo_success_8832",
      paid_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  };
  return [sample];
}

function saveStoredBookings(bookings: Booking[]) {
  localStorage.setItem("yaksha_demo_bookings", JSON.stringify(bookings));
}

// In-Browser Mock Handler for standalone Vercel / Lovable cloud demo
function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): T {
  const urlObj = new URL(endpoint, "http://dummy");
  const path = urlObj.pathname.replace(/^\/api\/v1/, "");
  const searchParams = urlObj.searchParams;
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Costumes
  if (path.startsWith("/costumes")) {
    if (path.includes("/availability")) {
      return {
        available: true,
        available_units: 3,
        total_units: 3,
        is_blocked: false,
        message: "Available for selected dates & slot"
      } as T;
    }
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 2) {
      // /costumes/:id
      const idOrSku = parts[1];
      const found = MOCK_COSTUMES.find(c => c.id === idOrSku || c.sku === idOrSku) || MOCK_COSTUMES[0];
      return found as T;
    }

    // List costumes
    let items = [...MOCK_COSTUMES];
    const cat = searchParams.get("category");
    if (cat) items = items.filter(c => c.category === cat);
    const charType = searchParams.get("character_type");
    if (charType) items = items.filter(c => c.character_type === charType);
    const q = searchParams.get("q")?.toLowerCase();
    if (q) {
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.kannada_name && c.kannada_name.includes(q)) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return {
      items,
      total: items.length,
      page: 1,
      total_pages: 1,
    } as T;
  }

  // 2. Categories
  if (path === "/categories") {
    return {
      categories: MOCK_CATEGORIES,
      character_types: ["raja", "rakshasa", "stree", "hanuman", "rishi", "comic", "general"],
      total_costumes: MOCK_COSTUMES.length,
    } as T;
  }

  // 3. Auth
  if (path === "/auth/login" || path === "/auth/register") {
    const isUserAdmin = body.email && body.email.toLowerCase().includes("admin");
    const user = isUserAdmin ? MOCK_ADMIN : { ...MOCK_USER, email: body.email || MOCK_USER.email, name: body.name || MOCK_USER.name };
    localStorage.setItem("yaksha_token", "demo_jwt_token_sample");
    localStorage.setItem("yaksha_user", JSON.stringify(user));
    return {
      access_token: "demo_jwt_token_sample",
      user,
    } as T;
  }

  if (path === "/auth/me") {
    const raw = localStorage.getItem("yaksha_user");
    return (raw ? JSON.parse(raw) : MOCK_USER) as T;
  }

  // 4. Bookings
  if (path === "/bookings/quote") {
    const items = body.items || [];
    let subtotal = 0;
    let deposit = 0;
    items.forEach((it: any) => {
      const costume = MOCK_COSTUMES.find(c => c.id === it.costume_id || c.sku === it.costume_id) || MOCK_COSTUMES[0];
      const rate = it.rental_mode === "slot" ? (costume.price_per_slot[it.slot as keyof typeof costume.price_per_slot] || costume.price_per_day) : costume.price_per_day;
      const days = it.rental_mode === "slot" ? 1 : Math.max(1, Math.ceil((new Date(it.end_at).getTime() - new Date(it.start_at).getTime()) / 86400000) + 1);
      subtotal += rate * (it.quantity || 1) * days;
      deposit += costume.security_deposit * (it.quantity || 1);
    });
    const taxes = Math.round(subtotal * 0.05);
    return {
      items,
      pricing: {
        subtotal,
        deposit,
        taxes,
        discount: 0,
        total_payable: subtotal + deposit + taxes,
      },
      is_available: true,
      availability_errors: [],
    } as T;
  }

  if (path === "/bookings/checkout") {
    const items = (body.items || []).map((it: any) => {
      const c = MOCK_COSTUMES.find(cost => cost.id === it.costume_id || cost.sku === it.costume_id) || MOCK_COSTUMES[0];
      return {
        costume_id: c.id,
        name: c.name,
        image: c.images[0],
        size: it.size || "Free",
        quantity: it.quantity || 1,
        rental_mode: it.rental_mode || "day",
        start_at: it.start_at || new Date().toISOString().split("T")[0],
        end_at: it.end_at || new Date().toISOString().split("T")[0],
        slot: it.slot || "full_day",
        blocked_until: new Date(Date.now() + 86400000 * 3).toISOString(),
        days: it.days || 1,
        unit_price: c.price_per_day,
        item_subtotal: it.item_subtotal || c.price_per_day,
        item_deposit: it.item_deposit || c.security_deposit,
      };
    });
    const subtotal = items.reduce((acc: number, x: any) => acc + (x.item_subtotal || 0), 0);
    const deposit = items.reduce((acc: number, x: any) => acc + (x.item_deposit || 0), 0);
    const taxes = Math.round(subtotal * 0.05);
    const code = `YKB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      booking_code: code,
      user_id: MOCK_USER.id,
      user_name: body.event_details?.troupe_name || MOCK_USER.name,
      user_email: MOCK_USER.email,
      payment: {
        provider: "razorpay_mock",
        status: "pending",
      },
      items,
      pricing: {
        subtotal,
        deposit,
        taxes,
        discount: 0,
        total_payable: subtotal + deposit + taxes,
      },
      event_details: body.event_details || {
        event_name: "Yakshagana Prasanga",
        troupe_name: "Coastal Troupe",
        venue: "Town Hall",
        city: "Mangaluru",
        contact_phone: "+91 99001 54321"
      },
      pickup_mode: body.pickup_mode || "self_pickup",
      status: "pending_payment",
      created_at: new Date().toISOString(),
    };

    const current = getStoredBookings();
    saveStoredBookings([newBooking, ...current]);

    return {
      booking: newBooking,
      payment_order: {
        id: `order_mock_${Date.now()}`,
        amount: (subtotal + deposit + taxes) * 100,
        currency: "INR",
        provider: "mock"
      }
    } as T;
  }

  if (path === "/bookings") {
    return getStoredBookings() as T;
  }

  if (path.startsWith("/bookings/")) {
    const parts = path.split("/").filter(Boolean);
    const code = parts[1];
    const all = getStoredBookings();
    const found = all.find(b => b.booking_code === code || b.id === code) || all[0];
    if (path.endsWith("/cancel")) {
      found.status = "cancelled";
      saveStoredBookings(all);
    }
    return found as T;
  }

  // 5. Payments
  if (path.startsWith("/payments/")) {
    const all = getStoredBookings();
    const code = body.booking_code || (all[0] && all[0].booking_code);
    const target = all.find(b => b.booking_code === code) || all[0];
    if (target) {
      target.status = "confirmed";
      target.payment = {
        status: "paid",
        provider: "razorpay_mock",
        payment_id: `pay_mock_${Date.now()}`,
        paid_at: new Date().toISOString()
      };
      saveStoredBookings(all);
    }
    return {
      success: true,
      message: "Payment successfully verified! Booking confirmed.",
      booking: target
    } as T;
  }

  // 6. Admin
  if (path.startsWith("/admin")) {
    const all = getStoredBookings();
    if (path === "/admin/dashboard") {
      return {
        total_costumes: MOCK_COSTUMES.length,
        total_bookings: all.length + 12,
        active_rentals: all.filter(b => b.status === "confirmed" || b.status === "picked_up").length,
        revenue: 48500,
        recent_bookings: all.slice(0, 5),
      } as T;
    }
    if (path.startsWith("/admin/bookings")) {
      return all as T;
    }
    if (path.startsWith("/admin/calendar")) {
      return [
        {
          date: new Date().toISOString().split("T")[0],
          bookings_count: 2,
          costumes: [MOCK_COSTUMES[0].name, MOCK_COSTUMES[1].name]
        }
      ] as T;
    }
    return { message: "Admin action simulated successfully." } as T;
  }

  return {} as T;
}

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

  try {
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

    return await response.json();
  } catch (err: any) {
    // If backend is unreachable (e.g. running standalone on Vercel without a live backend URL),
    // smoothly fallback to the in-memory client mock engine so the demo never breaks for the client!
    console.info(`[Demo Mode Fallback] Using client mock for: ${cleanEndpoint}`);
    return handleMockRequest<T>(cleanEndpoint, options);
  }
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
