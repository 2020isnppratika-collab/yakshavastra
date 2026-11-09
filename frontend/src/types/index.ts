export type RentalMode = "day" | "slot" | "both";
export type SlotType = "morning" | "evening" | "night" | "full_day";
export type BookingStatus = "pending_payment" | "confirmed" | "picked_up" | "returned" | "cancelled" | "expired";
export type PickupMode = "self_pickup" | "delivery";

export interface PricePerSlot {
  morning: number;
  evening: number;
  night: number;
}

export interface Costume {
  id: string;
  sku: string;
  name: string;
  kannada_name?: string;
  description: string;
  category: "full_set" | "crown" | "ornament" | "garment" | "accessory" | "weapon";
  character_type: "raja" | "rakshasa" | "stree" | "hanuman" | "rishi" | "bannada" | "comic" | "general";
  tags: string[];
  sizes: string[];
  images: string[];
  price_per_day: number;
  price_per_slot: PricePerSlot;
  security_deposit: number;
  total_units: number;
  buffer_days: number;
  rental_mode: RentalMode;
  is_active: boolean;
  includes: string[];
  care_notes: string;
  troupe_grade?: string;
  available_units?: number;
  created_at?: string;
}

export interface CartItem {
  costume: Costume;
  size: string;
  quantity: number;
  rental_mode: "day" | "slot";
  start_at: string; // YYYY-MM-DD
  end_at: string;   // YYYY-MM-DD
  slot: SlotType;
  unit_price: number;
  item_subtotal: number;
  item_deposit: number;
  days: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  address?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at?: string;
}

export interface PricingBreakdown {
  subtotal: number;
  deposit: number;
  taxes: number;
  discount: number;
  total_payable: number;
}

export interface EventDetails {
  event_name: string;
  troupe_name?: string;
  venue: string;
  city: string;
  contact_phone: string;
  notes?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  items: Array<{
    costume_id: string;
    name: string;
    image?: string;
    size: string;
    quantity: number;
    unit_price: number;
    rental_mode: string;
    start_at: string;
    end_at: string;
    slot: SlotType;
    blocked_until: string;
    days: number;
    item_subtotal: number;
    item_deposit: number;
  }>;
  event_details: EventDetails;
  pricing: PricingBreakdown;
  status: BookingStatus;
  payment: {
    provider: string;
    order_id?: string;
    payment_id?: string;
    status: string;
    paid_at?: string;
  };
  pickup_mode: PickupMode;
  notes?: string;
  return_details?: {
    returned_at: string;
    damage_fee: number;
    late_fee: number;
    deposit_refunded: number;
    inspection_notes?: string;
  };
  cancellation?: {
    cancelled_at: string;
    refund_amount: number;
    deposit_refunded: number;
    cancellation_reason?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  kannada: string;
  count: number;
  icon?: string;
}
