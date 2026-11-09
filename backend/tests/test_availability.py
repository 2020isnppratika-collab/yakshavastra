import pytest
from datetime import datetime, timezone, timedelta
from app.services.availability import (
    ranges_overlap,
    calculate_time_window,
    get_booked_units
)
from app.db.mongo import MockMotorDB

def test_ranges_overlap_cases():
    # Architecture rule: Two time ranges overlap if:
    # A.start < B.blocked_until AND B.start < A.blocked_until
    t1 = datetime(2026, 12, 1, 6, 0, tzinfo=timezone.utc)
    t2 = datetime(2026, 12, 2, 23, 59, tzinfo=timezone.utc)
    
    # Overlapping interval
    t3 = datetime(2026, 12, 2, 10, 0, tzinfo=timezone.utc)
    t4 = datetime(2026, 12, 4, 23, 59, tzinfo=timezone.utc)
    assert ranges_overlap(t1, t2, t3, t4) is True

    # Non-overlapping interval (after)
    t5 = datetime(2026, 12, 3, 6, 0, tzinfo=timezone.utc)
    t6 = datetime(2026, 12, 5, 23, 59, tzinfo=timezone.utc)
    assert ranges_overlap(t1, t2, t5, t6) is False

def test_buffer_days_extension():
    # 1 buffer day added to end_at
    start_dt, end_dt, blocked_until = calculate_time_window("2026-12-10", "2026-12-12", "full_day", buffer_days=1)
    assert blocked_until == end_dt + timedelta(days=1)
    assert start_dt.hour == 6

@pytest.mark.asyncio
async def test_booked_units_and_capacity():
    db = MockMotorDB("test_rentals")
    costume_id = "test_costume_1"
    
    # Add an active confirmed booking for 1 unit
    now = datetime.now(timezone.utc)
    await db.bookings.insert_one({
        "status": "confirmed",
        "items": [
            {
                "costume_id": costume_id,
                "quantity": 1,
                "start_at": "2026-12-10T06:00:00+00:00",
                "blocked_until": "2026-12-13T23:59:59+00:00"
            }
        ]
    })

    # Query overlapping window
    req_start = datetime(2026, 12, 11, 6, 0, tzinfo=timezone.utc)
    req_blocked = datetime(2026, 12, 12, 23, 59, tzinfo=timezone.utc)
    booked = await get_booked_units(db, costume_id, req_start, req_blocked)
    assert booked == 1

    # Query non-overlapping window
    req_start_far = datetime(2026, 12, 15, 6, 0, tzinfo=timezone.utc)
    req_blocked_far = datetime(2026, 12, 16, 23, 59, tzinfo=timezone.utc)
    booked_far = await get_booked_units(db, costume_id, req_start_far, req_blocked_far)
    assert booked_far == 0
