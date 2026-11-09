from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_revenue: float
    total_bookings: int
    active_rentals: int
    pending_pickups: int
    pending_returns: int
    total_costumes: int
    popular_costumes: List[Dict[str, Any]]
    recent_bookings: List[Dict[str, Any]]

class CalendarBookingEvent(BaseModel):
    booking_id: str
    booking_code: str
    costume_id: str
    costume_name: str
    customer_name: str
    start_at: str
    end_at: str
    slot: str
    status: str
