import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_and_costumes():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Health
        res = await ac.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # Categories
        cat_res = await ac.get("/api/v1/categories")
        assert cat_res.status_code == 200
        cats = cat_res.json()["categories"]
        assert len(cats) >= 5

        # Costumes list
        costumes_res = await ac.get("/api/v1/costumes")
        assert costumes_res.status_code == 200
        items = costumes_res.json()["items"]
        assert len(items) > 10

@pytest.mark.asyncio
async def test_auth_and_booking_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Clean up previous test run bookings
        from app.core.deps import get_db
        db = await get_db()
        await db.bookings.delete_many({"event_details.event_name": "Udupi Deepotsava 2026"})
        await db.availability_holds.delete_many({})

        # 1. Login with demo customer
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "customer@demo.com",
            "password": "Customer@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get costume
        costumes_res = await ac.get("/api/v1/costumes")
        costume = costumes_res.json()["items"][0]
        costume_id = costume["id"]

        # 3. Get Quote
        quote_payload = {
            "items": [
                {
                    "costume_id": costume_id,
                    "size": "L",
                    "quantity": 1,
                    "rental_mode": "day",
                    "start_at": "2027-01-10",
                    "end_at": "2027-01-11",
                    "slot": "full_day"
                }
            ]
        }
        quote_res = await ac.post("/api/v1/bookings/quote", json=quote_payload)
        assert quote_res.status_code == 200
        assert quote_res.json()["is_available"] is True
        assert quote_res.json()["pricing"]["total_payable"] > 0

        # 4. Checkout
        checkout_payload = {
            "items": quote_payload["items"],
            "event_details": {
                "event_name": "Udupi Deepotsava 2026",
                "troupe_name": "Rajarajeshwari Mela",
                "venue": "Anantheshwara Temple",
                "city": "Udupi",
                "contact_phone": "+91 98800 55443"
            },
            "pickup_mode": "self_pickup"
        }
        checkout_res = await ac.post("/api/v1/bookings/checkout", json=checkout_payload, headers=headers)
        assert checkout_res.status_code == 200
        booking = checkout_res.json()["booking"]
        booking_code = booking["booking_code"]
        assert booking["status"] == "pending_payment"

        # 5. Confirm via Mock Payment
        pay_res = await ac.post("/api/v1/payments/mock-confirm", json={
            "booking_code": booking_code
        })
        assert pay_res.status_code == 200
        assert pay_res.json()["booking"]["status"] == "confirmed"

        # 6. Verify in My Bookings
        my_b = await ac.get("/api/v1/bookings", headers=headers)
        assert my_b.status_code == 200
        user_bookings = my_b.json()
        assert any(b["booking_code"] == booking_code for b in user_bookings)

@pytest.mark.asyncio
async def test_double_booking_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "customer@demo.com",
            "password": "Customer@123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Find costume with 2 units (e.g. Karna Vesha YK-RAJA-002)
        costumes_res = await ac.get("/api/v1/costumes?q=Karna")
        items = costumes_res.json()["items"]
        assert len(items) > 0
        costume = items[0]
        costume_id = costume["id"]
        total_units = costume["total_units"]

        # Attempt to checkout more than total units
        conflict_payload = {
            "items": [
                {
                    "costume_id": costume_id,
                    "size": "Free",
                    "quantity": total_units + 1,
                    "rental_mode": "day",
                    "start_at": "2026-12-25",
                    "end_at": "2026-12-26",
                    "slot": "full_day"
                }
            ],
            "event_details": {
                "event_name": "Overbooking Test Show",
                "troupe_name": "Test Mela",
                "venue": "Test Hall",
                "city": "Udupi",
                "contact_phone": "+91 98800 11223"
            },
            "pickup_mode": "self_pickup"
        }
        res = await ac.post("/api/v1/bookings/checkout", json=conflict_payload, headers=headers)
        assert res.status_code == 409
        assert "Unavailable" in res.json()["detail"]
