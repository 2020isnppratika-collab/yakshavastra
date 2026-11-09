import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.core.config import settings
from app.services.availability import (
    check_costume_availability,
    calculate_time_window,
    parse_datetime
)
from app.services.pricing import calculate_item_price, calculate_total_pricing
from app.services.payment import create_payment_order
from app.services.email import generate_booking_confirmation_email

async def create_quote(db, quote_req) -> Dict[str, Any]:
    items_out = []
    pricing_items = []
    all_available = True
    errors = []

    for item in quote_req.items:
        costume_id = item.costume_id
        avail_res = await check_costume_availability(
            db,
            costume_id=costume_id,
            start_at_str=item.start_at,
            end_at_str=item.end_at,
            slot=item.slot,
            requested_quantity=item.quantity
        )

        if not avail_res["is_available"]:
            all_available = False
            costume_name = avail_res.get("costume", {}).get("name", costume_id)
            errors.append(
                f"'{costume_name}' has only {avail_res['available_units']} unit(s) available for requested dates/slot ({item.quantity} requested)."
            )

        costume = avail_res.get("costume") or await db.costumes.find_one({"_id": ObjectId(costume_id) if ObjectId.is_valid(costume_id) else costume_id})
        if not costume:
            all_available = False
            errors.append(f"Costume {costume_id} not found.")
            continue

        item_price_info = calculate_item_price(
            costume=costume,
            rental_mode=item.rental_mode,
            slot=item.slot,
            start_at_str=item.start_at,
            end_at_str=item.end_at,
            quantity=item.quantity
        )
        pricing_items.append(item_price_info)

        _, _, blocked_until = calculate_time_window(
            item.start_at,
            item.end_at,
            item.slot,
            int(costume.get("buffer_days", settings.DEFAULT_BUFFER_DAYS))
        )

        items_out.append({
            "costume_id": str(costume.get("_id", costume_id)),
            "name": costume.get("name", "Costume"),
            "image": costume.get("images", [""])[0] if costume.get("images") else "",
            "size": item.size,
            "quantity": item.quantity,
            "unit_price": item_price_info["unit_price"],
            "rental_mode": item.rental_mode,
            "start_at": item.start_at,
            "end_at": item.end_at,
            "slot": item.slot,
            "blocked_until": blocked_until.isoformat(),
            "days": item_price_info["days"],
            "item_subtotal": item_price_info["item_subtotal"],
            "item_deposit": item_price_info["item_deposit"]
        })

    pricing = calculate_total_pricing(pricing_items)

    return {
        "items": items_out,
        "pricing": pricing,
        "is_available": all_available,
        "availability_errors": errors
    }

async def checkout(db, checkout_req, user: Dict[str, Any]) -> Dict[str, Any]:
    if not checkout_req.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    now = datetime.now(timezone.utc)
    hold_expires_at = now + timedelta(minutes=settings.HOLD_MINUTES)
    user_id_str = str(user.get("_id", user.get("id")))

    # 1. Verify availability and prepare items
    prepared_items = []
    pricing_items = []
    holds_to_insert = []

    for item in checkout_req.items:
        avail_res = await check_costume_availability(
            db,
            costume_id=item.costume_id,
            start_at_str=item.start_at,
            end_at_str=item.end_at,
            slot=item.slot,
            requested_quantity=item.quantity
        )

        if not avail_res["is_available"]:
            costume_name = avail_res.get("costume", {}).get("name", item.costume_id)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Unavailable: '{costume_name}' has only {avail_res['available_units']} unit(s) remaining for your requested dates/slot."
            )

        costume = avail_res["costume"]
        item_price_info = calculate_item_price(
            costume=costume,
            rental_mode=item.rental_mode,
            slot=item.slot,
            start_at_str=item.start_at,
            end_at_str=item.end_at,
            quantity=item.quantity
        )
        pricing_items.append(item_price_info)

        start_dt, end_dt, blocked_until = calculate_time_window(
            item.start_at,
            item.end_at,
            item.slot,
            int(costume.get("buffer_days", settings.DEFAULT_BUFFER_DAYS))
        )

        # Prepare hold
        holds_to_insert.append({
            "costume_id": str(costume.get("_id", item.costume_id)),
            "quantity": item.quantity,
            "start_at": start_dt.isoformat(),
            "blocked_until": blocked_until.isoformat(),
            "user_id": user_id_str,
            "expires_at": hold_expires_at
        })

        prepared_items.append({
            "costume_id": str(costume.get("_id", item.costume_id)),
            "name": costume.get("name", "Costume"),
            "image": costume.get("images", [""])[0] if costume.get("images") else "",
            "size": item.size,
            "quantity": item.quantity,
            "unit_price": item_price_info["unit_price"],
            "rental_mode": item.rental_mode,
            "start_at": item.start_at,
            "end_at": item.end_at,
            "slot": item.slot,
            "blocked_until": blocked_until.isoformat(),
            "days": item_price_info["days"],
            "item_subtotal": item_price_info["item_subtotal"],
            "item_deposit": item_price_info["item_deposit"]
        })

    # 2. Insert availability holds (concurrency lock)
    if holds_to_insert:
        await db.availability_holds.insert_many(holds_to_insert)

    # 3. Calculate authoritative total
    pricing = calculate_total_pricing(pricing_items)

    # 4. Generate unique Booking Code: YKB-YYYYMMDD-XXXX
    date_code = now.strftime("%Y%m%d")
    random_digits = f"{random.randint(1000, 9999)}"
    booking_code = f"YKB-{date_code}-{random_digits}"

    # 5. Create payment order
    payment_order = create_payment_order(
        amount=pricing["total_payable"],
        booking_code=booking_code
    )

    # 6. Store booking with pending_payment status
    booking_doc = {
        "booking_code": booking_code,
        "user_id": user_id_str,
        "user_name": user.get("name", ""),
        "user_email": user.get("email", ""),
        "items": prepared_items,
        "event_details": checkout_req.event_details.model_dump(),
        "pricing": pricing,
        "status": "pending_payment",
        "payment": {
            "provider": "razorpay" if not payment_order.get("is_mock") else "mock",
            "order_id": payment_order.get("order_id"),
            "payment_id": None,
            "status": "created",
            "paid_at": None
        },
        "pickup_mode": checkout_req.pickup_mode,
        "notes": checkout_req.notes or "",
        "return_details": None,
        "cancellation": None,
        "created_at": now,
        "updated_at": now,
        "expires_at": hold_expires_at
    }

    insert_res = await db.bookings.insert_one(booking_doc)
    booking_doc["id"] = str(insert_res.inserted_id)

    return {
        "booking": booking_doc,
        "payment_order": payment_order
    }

async def confirm_booking(db, booking_code: str, payment_id: str, order_id: Optional[str] = None) -> Dict[str, Any]:
    booking = await db.bookings.find_one({"booking_code": booking_code})
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    now = datetime.now(timezone.utc)
    
    # Update status to confirmed
    update_data = {
        "$set": {
            "status": "confirmed",
            "payment.status": "paid",
            "payment.payment_id": payment_id,
            "payment.paid_at": now,
            "updated_at": now
        },
        "$unset": {
            "expires_at": ""
        }
    }
    await db.bookings.update_one({"booking_code": booking_code}, update_data)

    # Clear holds associated with this user
    await db.availability_holds.delete_many({"user_id": booking.get("user_id")})

    updated_booking = await db.bookings.find_one({"booking_code": booking_code})
    updated_booking["id"] = str(updated_booking.get("_id"))

    # Send confirmation email
    user = await db.users.find_one({"_id": ObjectId(booking.get("user_id")) if ObjectId.is_valid(booking.get("user_id")) else booking.get("user_id")})
    if user:
        generate_booking_confirmation_email(updated_booking, user)

    return updated_booking

async def cancel_booking(db, booking_code: str, user_id: str, reason: str, is_admin: bool = False) -> Dict[str, Any]:
    booking = await db.bookings.find_one({"booking_code": booking_code})
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if not is_admin and str(booking.get("user_id")) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if booking.get("status") in ["cancelled", "returned", "expired"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel a booking with status '{booking.get('status')}'")

    now = datetime.now(timezone.utc)
    
    # Calculate earliest start date
    earliest_start = None
    for item in booking.get("items", []):
        s_dt = parse_datetime(item.get("start_at"))
        if earliest_start is None or s_dt < earliest_start:
            earliest_start = s_dt

    pricing = booking.get("pricing", {})
    subtotal = float(pricing.get("subtotal", 0))
    deposit = float(pricing.get("deposit", 0))

    days_diff = (earliest_start.date() - now.date()).days if earliest_start else 0

    if days_diff >= 7:
        rental_refund = subtotal
    elif 3 <= days_diff < 7:
        rental_refund = round(subtotal * 0.5, 2)
    else:
        rental_refund = 0.0

    total_refund = rental_refund + deposit

    cancellation_info = {
        "cancelled_at": now,
        "refund_amount": round(total_refund, 2),
        "deposit_refunded": round(deposit, 2),
        "cancellation_reason": reason
    }

    await db.bookings.update_one(
        {"booking_code": booking_code},
        {
            "$set": {
                "status": "cancelled",
                "cancellation": cancellation_info,
                "payment.status": "refunded" if total_refund > 0 else "paid",
                "updated_at": now
            }
        }
    )

    # Release any holds
    await db.availability_holds.delete_many({"user_id": booking.get("user_id")})

    updated = await db.bookings.find_one({"booking_code": booking_code})
    updated["id"] = str(updated.get("_id"))
    return updated

async def record_return(db, booking_code: str, damage_fee: float, late_fee: float, inspection_notes: str) -> Dict[str, Any]:
    booking = await db.bookings.find_one({"booking_code": booking_code})
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    deposit = float(booking.get("pricing", {}).get("deposit", 0))
    net_deposit_refund = max(0.0, deposit - damage_fee - late_fee)
    now = datetime.now(timezone.utc)

    return_details = {
        "returned_at": now,
        "damage_fee": damage_fee,
        "late_fee": late_fee,
        "deposit_refunded": round(net_deposit_refund, 2),
        "inspection_notes": inspection_notes
    }

    await db.bookings.update_one(
        {"booking_code": booking_code},
        {
            "$set": {
                "status": "returned",
                "return_details": return_details,
                "updated_at": now
            }
        }
    )

    updated = await db.bookings.find_one({"booking_code": booking_code})
    updated["id"] = str(updated.get("_id"))
    return updated
