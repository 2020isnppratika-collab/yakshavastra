import logging
from typing import Dict, Any

logger = logging.getLogger("uvicorn.error")

def generate_booking_confirmation_email(booking: Dict[str, Any], user: Dict[str, Any]) -> str:
    booking_code = booking.get("booking_code")
    pricing = booking.get("pricing", {})
    items = booking.get("items", [])
    event = booking.get("event_details", {})

    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{item.get('name')} ({item.get('size')})</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{item.get('quantity')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{item.get('start_at')} to {item.get('end_at')} ({item.get('slot')})</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹{item.get('item_subtotal', 0):,.2f}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #FAF6F0; padding: 20px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background-color: #991B1B; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px;">Yakshagana Costume Platform</h1>
                <p style="margin: 4px 0 0; color: #F59E0B; font-weight: bold;">Booking Confirmation: {booking_code}</p>
            </div>
            <div style="padding: 24px;">
                <p>Namaskara <strong>{user.get('name', 'Valued Customer')}</strong>,</p>
                <p>Your Yakshagana costume rental booking has been successfully confirmed.</p>
                
                <h3 style="color: #991B1B; border-bottom: 2px solid #F59E0B; padding-bottom: 4px;">Event Details</h3>
                <p>
                    <strong>Event:</strong> {event.get('event_name')}<br/>
                    <strong>Venue:</strong> {event.get('venue')}, {event.get('city')}<br/>
                    <strong>Pickup Mode:</strong> {booking.get('pickup_mode', 'self_pickup').replace('_', ' ').title()}
                </p>

                <h3 style="color: #991B1B; border-bottom: 2px solid #F59E0B; padding-bottom: 4px;">Reserved Costumes</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <thead>
                        <tr style="background: #f9fafb;">
                            <th style="padding: 8px;">Costume</th>
                            <th style="padding: 8px;">Qty</th>
                            <th style="padding: 8px;">Dates / Slot</th>
                            <th style="padding: 8px;">Rental Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>

                <div style="margin-top: 20px; background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 6px;">
                    <p style="margin: 4px 0;"><strong>Rental Subtotal:</strong> ₹{pricing.get('subtotal', 0):,.2f}</p>
                    <p style="margin: 4px 0;"><strong>Security Deposit (Refundable):</strong> ₹{pricing.get('deposit', 0):,.2f}</p>
                    <p style="margin: 4px 0;"><strong>GST (5%):</strong> ₹{pricing.get('taxes', 0):,.2f}</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 8px 0;"/>
                    <p style="margin: 4px 0; font-size: 16px; font-weight: bold; color: #991B1B;">Total Paid: ₹{pricing.get('total_payable', 0):,.2f}</p>
                </div>

                <div style="margin-top: 20px; font-size: 13px; color: #4b5563;">
                    <p><strong>Care & Return Instructions:</strong></p>
                    <ul>
                        <li>Please handle gold foil work and kireeta headgear with care.</li>
                        <li>Security deposit will be credited back within 24 hours of inspection upon return.</li>
                        <li>For any assistance or troupe coordination, call our helpline: +91 98800 12345.</li>
                    </ul>
                </div>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                Yakshagana Cultural Costume Heritage Trust &bull; Udupi &bull; Mangaluru &bull; Bengaluru
            </div>
        </div>
    </body>
    </html>
    """
    logger.info(f"Generated booking confirmation email for {booking_code} -> {user.get('email')}")
    return html
