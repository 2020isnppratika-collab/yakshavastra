from app.services.pricing import calculate_item_price, calculate_total_pricing

def test_day_based_pricing():
    costume = {
        "price_per_day": 1500.0,
        "security_deposit": 3000.0,
        "rental_mode": "day"
    }
    # 3 days rental (Dec 1 to Dec 3) for 2 units
    res = calculate_item_price(costume, rental_mode="day", slot="full_day", start_at_str="2026-12-01", end_at_str="2026-12-03", quantity=2)
    assert res["days"] == 3
    assert res["item_subtotal"] == 1500.0 * 3 * 2  # 9000
    assert res["item_deposit"] == 3000.0 * 2       # 6000

def test_slot_based_pricing():
    costume = {
        "price_per_day": 1500.0,
        "price_per_slot": {"morning": 700.0, "evening": 800.0, "night": 1200.0},
        "security_deposit": 2000.0,
        "rental_mode": "slot"
    }
    # 1 night slot for 1 unit
    res = calculate_item_price(costume, rental_mode="slot", slot="night", start_at_str="2026-12-05", end_at_str="2026-12-05", quantity=1)
    assert res["unit_price"] == 1200.0
    assert res["item_subtotal"] == 1200.0
    assert res["item_deposit"] == 2000.0

def test_total_pricing_with_taxes():
    items = [
        {"item_subtotal": 2000.0, "item_deposit": 3000.0},
        {"item_subtotal": 1000.0, "item_deposit": 1000.0}
    ]
    total = calculate_total_pricing(items)
    assert total["subtotal"] == 3000.0
    assert total["deposit"] == 4000.0
    assert total["taxes"] == 150.0  # 5% of 3000
    assert total["total_payable"] == 7150.0
