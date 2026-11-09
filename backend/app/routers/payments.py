import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.core.deps import get_db, get_optional_user
from app.db.mongo import serialize_doc
from app.core.config import settings
from app.schemas.payment import PaymentVerifyRequest, MockPaymentRequest
from app.services.payment import verify_payment_signature
from app.services.booking import confirm_booking

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/verify")
async def verify_payment(req: PaymentVerifyRequest, db = Depends(get_db)):
    is_valid = verify_payment_signature(
        order_id=req.razorpay_order_id,
        payment_id=req.razorpay_payment_id,
        signature=req.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed"
        )

    updated_booking = await confirm_booking(
        db,
        booking_code=req.booking_code,
        payment_id=req.razorpay_payment_id,
        order_id=req.razorpay_order_id
    )

    return {
        "success": True,
        "message": "Payment verified and booking confirmed",
        "booking": serialize_doc(updated_booking)
    }

@router.post("/mock-confirm")
async def mock_confirm_payment(req: MockPaymentRequest, db = Depends(get_db)):
    if not settings.ENABLE_MOCK_PAYMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mock payments are disabled in this environment"
        )

    booking = await db.bookings.find_one({"booking_code": req.booking_code})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    if req.simulate_failure:
        await db.bookings.update_one(
            {"booking_code": req.booking_code},
            {"$set": {"payment.status": "failed", "updated_at": datetime.now(timezone.utc)}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Simulated bank / payment card failure"
        )

    mock_payment_id = f"pay_mock_{uuid.uuid4().hex[:12]}"
    updated_booking = await confirm_booking(
        db,
        booking_code=req.booking_code,
        payment_id=mock_payment_id,
        order_id=booking.get("payment", {}).get("order_id")
    )

    return {
        "success": True,
        "message": "Mock payment confirmed successfully",
        "booking": serialize_doc(updated_booking)
    }

@router.post("/webhook")
async def razorpay_webhook(request: Request, db = Depends(get_db)):
    payload = await request.json()
    event = payload.get("event")

    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        booking_code = notes.get("booking_code")
        payment_id = payment_entity.get("id")
        order_id = payment_entity.get("order_id")

        if booking_code:
            await confirm_booking(db, booking_code, payment_id, order_id)

    return {"status": "ok"}
