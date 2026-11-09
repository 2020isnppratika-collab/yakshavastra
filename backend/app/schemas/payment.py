from typing import Optional
from pydantic import BaseModel

class PaymentVerifyRequest(BaseModel):
    booking_code: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class MockPaymentRequest(BaseModel):
    booking_code: str
    simulate_failure: bool = False

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str
    booking_code: str
