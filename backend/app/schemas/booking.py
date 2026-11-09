from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

SlotType = Literal["morning", "evening", "night", "full_day"]
BookingStatus = Literal["pending_payment", "confirmed", "picked_up", "returned", "cancelled", "expired"]
PickupMode = Literal["self_pickup", "delivery"]

class BookingItemInput(BaseModel):
    costume_id: str
    size: str = "Free"
    quantity: int = Field(1, ge=1)
    rental_mode: Literal["day", "slot"] = "day"
    start_at: str  # ISO date string "YYYY-MM-DD" or full ISO
    end_at: str    # ISO date string "YYYY-MM-DD" or full ISO
    slot: SlotType = "full_day"

class BookingItem(BaseModel):
    costume_id: str
    name: str
    image: Optional[str] = ""
    size: str = "Free"
    quantity: int = 1
    unit_price: float
    rental_mode: str = "day"
    start_at: str
    end_at: str
    slot: SlotType = "full_day"
    blocked_until: str
    days: int = 1
    item_subtotal: float
    item_deposit: float

class EventDetails(BaseModel):
    event_name: str = Field(..., min_length=2)
    troupe_name: Optional[str] = ""
    venue: str = Field(..., min_length=2)
    city: str = Field("Udupi", min_length=2)
    contact_phone: str = Field(..., min_length=10)
    notes: Optional[str] = ""

class PricingBreakdown(BaseModel):
    subtotal: float
    deposit: float
    taxes: float
    discount: float = 0.0
    total_payable: float

class QuoteRequest(BaseModel):
    items: List[BookingItemInput]

class QuoteResponse(BaseModel):
    items: List[BookingItem]
    pricing: PricingBreakdown
    is_available: bool
    availability_errors: List[str] = []

class CheckoutRequest(BaseModel):
    items: List[BookingItemInput]
    event_details: EventDetails
    pickup_mode: PickupMode = "self_pickup"
    notes: Optional[str] = ""

class PaymentInfo(BaseModel):
    provider: str = "razorpay"
    order_id: Optional[str] = None
    payment_id: Optional[str] = None
    status: str = "created"  # created | paid | failed | refunded
    paid_at: Optional[datetime] = None

class ReturnInspection(BaseModel):
    returned_at: Optional[datetime] = None
    damage_fee: float = 0.0
    late_fee: float = 0.0
    deposit_refunded: float = 0.0
    inspection_notes: Optional[str] = ""

class CancellationInfo(BaseModel):
    cancelled_at: Optional[datetime] = None
    refund_amount: float = 0.0
    deposit_refunded: float = 0.0
    cancellation_reason: Optional[str] = ""

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    items: List[BookingItem]
    event_details: EventDetails
    pricing: PricingBreakdown
    status: BookingStatus
    payment: PaymentInfo
    pickup_mode: PickupMode
    notes: Optional[str] = ""
    return_details: Optional[ReturnInspection] = None
    cancellation: Optional[CancellationInfo] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class ReturnRequest(BaseModel):
    damage_fee: float = Field(0.0, ge=0)
    late_fee: float = Field(0.0, ge=0)
    inspection_notes: Optional[str] = ""

class CancelRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"
