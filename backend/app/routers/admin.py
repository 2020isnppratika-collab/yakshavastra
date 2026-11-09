from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from app.core.deps import get_db, require_admin
from app.db.mongo import serialize_doc, serialize_docs
from app.schemas.costume import CostumeCreate, CostumeUpdate, CostumeResponse
from app.schemas.booking import ReturnRequest
from app.schemas.admin import DashboardStats, CalendarBookingEvent
from app.services.booking import record_return, cancel_booking
from app.services.seed import seed_database

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(require_admin)])

@router.get("/dashboard")
async def get_dashboard_kpis(db = Depends(get_db)):
    bookings = await db.bookings.find({}).to_list(1000)
    costumes = await db.costumes.find({"is_active": True}).to_list(1000)

    total_revenue = sum(
        float(b.get("pricing", {}).get("total_payable", 0))
        for b in bookings
        if b.get("status") in ["confirmed", "picked_up", "returned"]
    )
    total_bookings = len(bookings)
    active_rentals = sum(1 for b in bookings if b.get("status") == "picked_up")
    pending_pickups = sum(1 for b in bookings if b.get("status") == "confirmed")
    pending_returns = sum(1 for b in bookings if b.get("status") == "picked_up")
    total_costumes = len(costumes)

    # Popular costumes calculation
    costume_counts = {}
    for b in bookings:
        for item in b.get("items", []):
            cid = str(item.get("costume_id"))
            costume_counts[cid] = costume_counts.get(cid, 0) + item.get("quantity", 1)

    popular_list = []
    for c in costumes:
        cid = str(c.get("_id"))
        rent_count = costume_counts.get(cid, 0)
        popular_list.append({
            "id": cid,
            "sku": c.get("sku"),
            "name": c.get("name"),
            "category": c.get("category"),
            "price_per_day": c.get("price_per_day"),
            "total_units": c.get("total_units"),
            "image": c.get("images", [""])[0] if c.get("images") else "",
            "rent_count": rent_count
        })
    popular_list.sort(key=lambda x: x["rent_count"], reverse=True)

    # Recent bookings
    recent = sorted(bookings, key=lambda x: x.get("created_at") or datetime.min, reverse=True)[:10]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings,
        "active_rentals": active_rentals,
        "pending_pickups": pending_pickups,
        "pending_returns": pending_returns,
        "total_costumes": total_costumes,
        "popular_costumes": popular_list[:6],
        "recent_bookings": serialize_docs(recent)
    }

@router.get("/bookings")
async def list_all_bookings(
    status_filter: Optional[str] = None,
    q: Optional[str] = None,
    db = Depends(get_db)
):
    query: Dict[str, Any] = {}
    if status_filter and status_filter != "all":
        query["status"] = status_filter

    bookings = await db.bookings.find(query).sort("created_at", -1).to_list(1000)

    if q and q.strip():
        search = q.strip().lower()
        filtered = []
        for b in bookings:
            code = b.get("booking_code", "").lower()
            c_name = b.get("user_name", "").lower()
            ev_name = b.get("event_details", {}).get("event_name", "").lower()
            tr_name = b.get("event_details", {}).get("troupe_name", "").lower()
            if search in code or search in c_name or search in ev_name or search in tr_name:
                filtered.append(b)
        bookings = filtered

    return serialize_docs(bookings)

@router.patch("/bookings/{id_or_code}/status")
async def update_booking_status(
    id_or_code: str,
    new_status: str = Query(..., pattern="^(confirmed|picked_up|returned|cancelled)$"),
    db = Depends(get_db)
):
    filter_q = {
        "$or": [
            {"booking_code": id_or_code},
            {"_id": ObjectId(id_or_code) if ObjectId.is_valid(id_or_code) else id_or_code}
        ]
    }
    booking = await db.bookings.find_one(filter_q)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    now = datetime.now(timezone.utc)
    update_fields = {"status": new_status, "updated_at": now}

    if new_status == "picked_up":
        update_fields["pickup_details.picked_up_at"] = now
    elif new_status == "returned":
        deposit = float(booking.get("pricing", {}).get("deposit", 0))
        update_fields["return_details"] = {
            "returned_at": now,
            "damage_fee": 0.0,
            "late_fee": 0.0,
            "deposit_refunded": deposit,
            "inspection_notes": "Returned and inspected via quick admin status update."
        }

    await db.bookings.update_one(filter_q, {"$set": update_fields})
    updated = await db.bookings.find_one(filter_q)
    return serialize_doc(updated)

@router.post("/bookings/{code}/return")
async def process_costume_return(
    code: str,
    req: ReturnRequest,
    db = Depends(get_db)
):
    res = await record_return(
        db,
        booking_code=code,
        damage_fee=req.damage_fee,
        late_fee=req.late_fee,
        inspection_notes=req.inspection_notes or "Inspected upon return"
    )
    return serialize_doc(res)

@router.get("/calendar")
async def get_admin_calendar_events(
    month: Optional[str] = None,  # YYYY-MM
    db = Depends(get_db)
):
    bookings = await db.bookings.find({
        "status": {"$in": ["confirmed", "picked_up", "returned"]}
    }).to_list(1000)

    events = []
    for b in bookings:
        for item in b.get("items", []):
            events.append({
                "booking_id": str(b.get("_id")),
                "booking_code": b.get("booking_code"),
                "costume_id": str(item.get("costume_id")),
                "costume_name": item.get("name"),
                "customer_name": b.get("user_name"),
                "start_at": item.get("start_at"),
                "end_at": item.get("end_at"),
                "slot": item.get("slot"),
                "status": b.get("status")
            })

    return events

# Costume Inventory CRUD
@router.post("/costumes", response_model=Dict[str, Any])
async def create_costume(costume_in: CostumeCreate, db = Depends(get_db)):
    doc = costume_in.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    res = await db.costumes.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)

@router.put("/costumes/{id}")
async def update_costume(id: str, costume_update: CostumeUpdate, db = Depends(get_db)):
    costume = await db.costumes.find_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    if not costume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Costume not found")

    update_data = {k: v for k, v in costume_update.model_dump().items() if v is not None}
    if update_data:
        await db.costumes.update_one(
            {"_id": ObjectId(id) if ObjectId.is_valid(id) else id},
            {"$set": update_data}
        )

    updated = await db.costumes.find_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    return serialize_doc(updated)

@router.delete("/costumes/{id}")
async def delete_costume(id: str, db = Depends(get_db)):
    costume = await db.costumes.find_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    if not costume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Costume not found")

    await db.costumes.delete_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    return {"message": "Costume deleted successfully", "id": id}

@router.post("/seed")
async def trigger_seed(db = Depends(get_db)):
    await db.costumes.delete_many({})
    await db.bookings.delete_many({})
    await db.availability_holds.delete_many({})
    await seed_database(db)
    return {"message": "Demo database successfully reset and seeded with authentic Yakshagana costumes and bookings!"}
