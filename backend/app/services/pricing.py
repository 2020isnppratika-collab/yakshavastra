from typing import Dict, Any, List
from datetime import date
from app.core.config import settings
from app.services.availability import parse_datetime

def calculate_duration_days(start_at_str: str, end_at_str: str) -> int:
    s_date = parse_datetime(start_at_str).date()
    e_date = parse_datetime(end_at_str).date()
    diff = (e_date - s_date).days
    return max(1, diff + 1)

def calculate_item_price(costume: Dict[str, Any], rental_mode: str, slot: str, start_at_str: str, end_at_str: str, quantity: int = 1) -> Dict[str, Any]:
    duration_days = calculate_duration_days(start_at_str, end_at_str)
    
    price_per_day = float(costume.get("price_per_day", 1500))
    slot_prices = costume.get("price_per_slot", {})
    if isinstance(slot_prices, dict):
        morning_p = float(slot_prices.get("morning", 700))
        evening_p = float(slot_prices.get("evening", 800))
        night_p = float(slot_prices.get("night", 1200))
    else:
        morning_p, evening_p, night_p = 700.0, 800.0, 1200.0

    if rental_mode == "slot":
        if slot == "morning":
            unit_price = morning_p
        elif slot == "evening":
            unit_price = evening_p
        elif slot == "night":
            unit_price = night_p
        else:
            unit_price = price_per_day
    else:
        unit_price = price_per_day

    item_subtotal = round(unit_price * duration_days * quantity, 2)
    security_deposit_per_unit = float(costume.get("security_deposit", 2000))
    item_deposit = round(security_deposit_per_unit * quantity, 2)

    return {
        "unit_price": unit_price,
        "days": duration_days,
        "quantity": quantity,
        "item_subtotal": item_subtotal,
        "item_deposit": item_deposit
    }

def calculate_total_pricing(items_pricing: List[Dict[str, Any]], discount: float = 0.0) -> Dict[str, float]:
    subtotal = sum(item["item_subtotal"] for item in items_pricing)
    deposit = sum(item["item_deposit"] for item in items_pricing)
    taxes = round(subtotal * settings.TAX_RATE, 2)
    total_payable = round(subtotal + deposit + taxes - discount, 2)

    return {
        "subtotal": round(subtotal, 2),
        "deposit": round(deposit, 2),
        "taxes": taxes,
        "discount": round(discount, 2),
        "total_payable": total_payable
    }
