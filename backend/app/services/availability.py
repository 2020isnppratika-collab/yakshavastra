from datetime import datetime, timedelta, timezone, date
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId
from app.core.config import settings

def parse_datetime(dt_val: Any) -> datetime:
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=timezone.utc)
        return dt_val
    if isinstance(dt_val, date):
        return datetime(dt_val.year, dt_val.month, dt_val.day, tzinfo=timezone.utc)
    if isinstance(dt_val, str):
        cleaned = dt_val.replace("Z", "+00:00")
        try:
            d = datetime.fromisoformat(cleaned)
            if d.tzinfo is None:
                d = d.replace(tzinfo=timezone.utc)
            return d
        except ValueError:
            # Fallback for YYYY-MM-DD
            d = datetime.strptime(dt_val[:10], "%Y-%m-%d")
            return d.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc)

def calculate_time_window(start_at_str: str, end_at_str: str, slot: str, buffer_days: int) -> Tuple[datetime, datetime, datetime]:
    """
    Returns (start_dt, end_dt, blocked_until)
    Slot timings:
    - morning: 06:00 to 14:00
    - evening: 14:00 to 22:00
    - night: 18:00 to 06:00 (next morning)
    - full_day: 06:00 to 23:59:59
    """
    start_base = parse_datetime(start_at_str).date()
    end_base = parse_datetime(end_at_str).date()
    if end_base < start_base:
        end_base = start_base

    if slot == "morning":
        start_dt = datetime(start_base.year, start_base.month, start_base.day, 6, 0, tzinfo=timezone.utc)
        end_dt = datetime(end_base.year, end_base.month, end_base.day, 14, 0, tzinfo=timezone.utc)
    elif slot == "evening":
        start_dt = datetime(start_base.year, start_base.month, start_base.day, 14, 0, tzinfo=timezone.utc)
        end_dt = datetime(end_base.year, end_base.month, end_base.day, 22, 0, tzinfo=timezone.utc)
    elif slot == "night":
        start_dt = datetime(start_base.year, start_base.month, start_base.day, 18, 0, tzinfo=timezone.utc)
        # Night ends 6 AM next day
        next_day = end_base + timedelta(days=1)
        end_dt = datetime(next_day.year, next_day.month, next_day.day, 6, 0, tzinfo=timezone.utc)
    else:  # full_day
        start_dt = datetime(start_base.year, start_base.month, start_base.day, 6, 0, tzinfo=timezone.utc)
        end_dt = datetime(end_base.year, end_base.month, end_base.day, 23, 59, 59, tzinfo=timezone.utc)

    # Blocked until includes buffer days for cleaning/repair
    blocked_until = end_dt + timedelta(days=buffer_days)
    return start_dt, end_dt, blocked_until

def ranges_overlap(start_a: datetime, blocked_a: datetime, start_b: datetime, blocked_b: datetime) -> bool:
    """
    Architecture rule: Two time ranges overlap if:
    A.start < B.blocked_until AND B.start < A.blocked_until
    """
    return (start_a < blocked_b) and (start_b < blocked_a)

async def get_booked_units(
    db,
    costume_id: str,
    requested_start: datetime,
    requested_blocked_until: datetime,
    exclude_booking_id: Optional[str] = None
) -> int:
    """
    Calculates sum of quantities booked across active bookings and holds that overlap
    """
    now = datetime.now(timezone.utc)
    
    # 1. Active bookings (confirmed, picked_up, or pending_payment)
    booking_query: Dict[str, Any] = {
        "status": {"$in": ["confirmed", "picked_up", "pending_payment"]}
    }
    bookings = await db.bookings.find(booking_query).to_list(1000)
    booked_units = 0

    for b in bookings:
        if exclude_booking_id and str(b.get("_id")) == str(exclude_booking_id):
            continue
        # If booking is pending_payment and has expired without payment, skip
        if b.get("status") == "pending_payment":
            expires_at = b.get("expires_at")
            if expires_at and parse_datetime(expires_at) < now:
                continue

        for item in b.get("items", []):
            if str(item.get("costume_id")) == str(costume_id):
                item_start = parse_datetime(item.get("start_at"))
                item_blocked = parse_datetime(item.get("blocked_until"))
                if ranges_overlap(requested_start, requested_blocked_until, item_start, item_blocked):
                    booked_units += int(item.get("quantity", 1))

    # 2. Active availability holds
    holds = await db.availability_holds.find({
        "costume_id": str(costume_id),
        "expires_at": {"$gt": now}
    }).to_list(1000)

    for h in holds:
        h_start = parse_datetime(h.get("start_at"))
        h_blocked = parse_datetime(h.get("blocked_until"))
        if ranges_overlap(requested_start, requested_blocked_until, h_start, h_blocked):
            booked_units += int(h.get("quantity", 1))

    return booked_units

async def check_costume_availability(
    db,
    costume_id: str,
    start_at_str: str,
    end_at_str: str,
    slot: str = "full_day",
    requested_quantity: int = 1,
    exclude_booking_id: Optional[str] = None
) -> Dict[str, Any]:
    costume = await db.costumes.find_one({"_id": ObjectId(costume_id) if ObjectId.is_valid(costume_id) else costume_id})
    if not costume:
        return {
            "is_available": False,
            "error": "Costume not found",
            "available_units": 0,
            "total_units": 0
        }

    total_units = int(costume.get("total_units", 1))
    buffer_days = int(costume.get("buffer_days", settings.DEFAULT_BUFFER_DAYS))

    start_dt, end_dt, blocked_until = calculate_time_window(start_at_str, end_at_str, slot, buffer_days)
    booked_units = await get_booked_units(db, costume_id, start_dt, blocked_until, exclude_booking_id)

    available_units = max(0, total_units - booked_units)
    is_available = available_units >= requested_quantity

    return {
        "is_available": is_available,
        "available_units": available_units,
        "total_units": total_units,
        "booked_units": booked_units,
        "start_dt": start_dt,
        "end_dt": end_dt,
        "blocked_until": blocked_until,
        "buffer_days": buffer_days,
        "costume": costume
    }

async def get_monthly_availability(db, costume_id: str, year: int, month: int) -> Dict[str, Any]:
    costume = await db.costumes.find_one({"_id": ObjectId(costume_id) if ObjectId.is_valid(costume_id) else costume_id})
    if not costume:
        return {}

    total_units = int(costume.get("total_units", 1))
    buffer_days = int(costume.get("buffer_days", settings.DEFAULT_BUFFER_DAYS))

    # Determine days in month
    if month == 12:
        next_month_first = date(year + 1, 1, 1)
    else:
        next_month_first = date(year, month + 1, 1)
    first_day = date(year, month, 1)
    num_days = (next_month_first - first_day).days

    days_data = []
    for day_num in range(1, num_days + 1):
        day_date = date(year, month, day_num)
        day_str = day_date.strftime("%Y-%m-%d")

        slots_info = {}
        day_avail = False
        min_available = total_units

        for s in ["morning", "evening", "night", "full_day"]:
            start_dt, _, blocked_until = calculate_time_window(day_str, day_str, s, buffer_days)
            booked = await get_booked_units(db, costume_id, start_dt, blocked_until)
            avail = max(0, total_units - booked)
            slots_info[s] = {
                "slot": s,
                "available_units": avail,
                "is_available": avail > 0
            }
            if avail > 0:
                day_avail = True
            if avail < min_available:
                min_available = avail

        # Check full day availability
        full_day_info = slots_info.get("full_day", {})
        days_data.append({
            "date": day_str,
            "is_available": full_day_info.get("is_available", day_avail),
            "units_available": full_day_info.get("available_units", min_available),
            "total_units": total_units,
            "slots": slots_info
        })

    return {
        "costume_id": str(costume_id),
        "month": f"{year:04d}-{month:02d}",
        "buffer_days": buffer_days,
        "total_units": total_units,
        "days": days_data
    }
