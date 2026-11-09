from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.core.deps import get_db, get_current_user
from app.db.mongo import serialize_doc, serialize_docs
from app.schemas.booking import (
    QuoteRequest,
    QuoteResponse,
    CheckoutRequest,
    BookingResponse,
    CancelRequest
)
from app.services.booking import (
    create_quote,
    checkout,
    cancel_booking
)

router = APIRouter(prefix="/bookings", tags=["Bookings & Orders"])

@router.post("/quote", response_model=QuoteResponse)
async def get_booking_quote(req: QuoteRequest, db = Depends(get_db)):
    quote_res = await create_quote(db, req)
    return quote_res

@router.post("/checkout")
async def checkout_booking(
    req: CheckoutRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    checkout_res = await checkout(db, req, current_user)
    checkout_res["booking"] = serialize_doc(checkout_res["booking"])
    return checkout_res

@router.get("")
async def get_my_bookings(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = str(current_user.get("_id", current_user.get("id")))
    bookings = await db.bookings.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return serialize_docs(bookings)

@router.get("/{id_or_code}")
async def get_booking_detail(
    id_or_code: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    # Search by code or ObjectId
    filter_query = {
        "$or": [
            {"booking_code": id_or_code},
            {"_id": ObjectId(id_or_code) if ObjectId.is_valid(id_or_code) else id_or_code}
        ]
    }
    booking = await db.bookings.find_one(filter_query)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    user_id = str(current_user.get("_id", current_user.get("id")))
    if current_user.get("role") != "admin" and str(booking.get("user_id")) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return serialize_doc(booking)

@router.post("/{code}/cancel")
async def cancel_customer_booking(
    code: str,
    req: CancelRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    user_id = str(current_user.get("_id", current_user.get("id")))
    is_admin = current_user.get("role") == "admin"
    res = await cancel_booking(
        db,
        booking_code=code,
        user_id=user_id,
        reason=req.reason or "Customer requested cancellation",
        is_admin=is_admin
    )
    return serialize_doc(res)
