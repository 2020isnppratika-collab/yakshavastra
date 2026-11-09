import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Clock,
  CreditCard,
  MapPin,
  Building,
  Phone,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { formatCurrency } from "../lib/utils";
import { EventDetails } from "../types";

export const Checkout: React.FC = () => {
  const { cart, clearCart, totalSubtotal, totalDeposit, estimatedTaxes, estimatedTotal } = useCart();
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("Yakshagana Prasanga Performance");
  const [troupeName, setTroupeName] = useState("Saligrama Mela");
  const [venue, setVenue] = useState("Town Hall Auditorium");
  const [city, setCity] = useState("Bengaluru");
  const [contactPhone, setContactPhone] = useState(user?.phone || "+91 80733 77289");
  const [notes, setNotes] = useState("");
  const [pickupMode, setPickupMode] = useState<"self_pickup" | "delivery">("self_pickup");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 10-minute hold timer simulation
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleCheckoutProcess = async (isMock: boolean = true, simulateFailure: boolean = false) => {
    if (!user) {
      setErrorMsg("Please log in to finalize your booking reservation.");
      return;
    }

    if (!eventName.trim() || !venue.trim() || !contactPhone.trim()) {
      setErrorMsg("Please fill in the required Event Name, Venue, and Contact Phone.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const itemsPayload = cart.map((item) => ({
        costume_id: item.costume.id,
        size: item.size,
        quantity: item.quantity,
        rental_mode: item.rental_mode,
        start_at: item.start_at,
        end_at: item.end_at,
        slot: item.slot,
      }));

      const eventDetails: EventDetails = {
        event_name: eventName,
        troupe_name: troupeName,
        venue,
        city,
        contact_phone: contactPhone,
        notes,
      };

      // 1. Create checkout with availability holds
      const checkoutRes = await api.bookings.checkout({
        items: itemsPayload,
        event_details: eventDetails,
        pickup_mode: pickupMode,
        notes,
      });

      const booking = checkoutRes.booking;
      const bookingCode = booking.booking_code;

      if (isMock) {
        // 2a. Confirm via Mock Payment Gateway
        const mockRes = await api.payments.mockConfirm({
          booking_code: bookingCode,
          simulate_failure: simulateFailure,
        });

        clearCart();
        navigate(`/booking/success/${bookingCode}`);
      } else {
        // 2b. Razorpay Checkout Flow
        const paymentOrder = checkoutRes.payment_order;
        if (window && (window as any).Razorpay) {
          const options = {
            key: paymentOrder.key_id,
            amount: paymentOrder.amount,
            currency: "INR",
            name: "YakshaVastra Platform",
            description: `Yakshagana Costume Booking ${bookingCode}`,
            order_id: paymentOrder.order_id,
            handler: async (response: any) => {
              try {
                await api.payments.verify({
                  booking_code: bookingCode,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                clearCart();
                navigate(`/booking/success/${bookingCode}`);
              } catch (verifyErr: any) {
                setErrorMsg(`Payment verification failed: ${verifyErr.message}`);
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: contactPhone,
            },
            theme: { color: "#991B1B" },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // Razorpay JS not loaded; fallback to mock confirm
          await api.payments.mockConfirm({ booking_code: bookingCode });
          clearCart();
          navigate(`/booking/success/${bookingCode}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 10-Minute Hold Lock Banner */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-amber-200 p-4 rounded-2xl border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-amber-500/20 text-amber-300">
            <Clock className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="font-bold text-sm block">Items Reserved Exclusively for You</span>
            <span className="text-xs text-amber-100/70">
              Double-booking hold active: your items are held safely while you complete checkout.
            </span>
          </div>
        </div>

        <div className="bg-red-900/80 px-4 py-1.5 rounded-xl border border-amber-400/50 flex items-center space-x-2">
          <span className="text-xs text-amber-200">Hold Expires in:</span>
          <span className="font-mono text-base font-bold text-amber-300">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Guest/Demo Login Prompt if not logged in */}
      {!user && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-stone-900">Sign in to complete your costume booking</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Use your account or 1-click login as Demo Customer to test the flow instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => loginAsDemo("customer")}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors text-center"
            >
              ⚡ 1-Click Demo Customer Login
            </button>
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Event Details Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center space-x-2">
                <Building className="w-5 h-5 text-red-900" />
                <span>Performance & Event Details</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Tell us about your performance so our wardrobe team prepares correct fittings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Event / Play Name (ಪ್ರಸಂಗ / ಉತ್ಸವ) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kundapura Deepotsava - Devi Mahatme"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Troupe / Organization (ಮೇಳ / ಸಂಸ್ಥೆ)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandarthi Yakshagana Mela"
                  value={troupeName}
                  onChange={(e) => setTroupeName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 99001 54321"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Venue & Stage Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharada Kalamandira, Main Hall"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  City / Hub Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none font-medium"
                >
                  <option value="Udupi">Udupi (ಉಡುಪಿ)</option>
                  <option value="Mangaluru">Mangaluru (ಮಂಗಳೂರು)</option>
                  <option value="Kundapura">Kundapura (ಕುಂದಾಪುರ)</option>
                  <option value="Bengaluru">Bengaluru (ಬೆಂಗಳೂರು)</option>
                  <option value="Shimoga">Shimoga / Malenadu</option>
                  <option value="Other">Other Coastal Karnataka Location</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Pickup Mode
                </label>
                <select
                  value={pickupMode}
                  onChange={(e) => setPickupMode(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none font-medium"
                >
                  <option value="self_pickup">Self-Pickup (from City Hub)</option>
                  <option value="delivery">Express Troupe Delivery to Venue</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Special Notes / Artist Height & Fit
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific costume customization, extra bells, or troupe timings..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Payment Gateway (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Reserved Items Summary ({cart.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                  <div className="pr-2">
                    <span className="font-bold text-stone-900 block truncate max-w-[200px]">{item.costume.name}</span>
                    <span className="text-[10px] text-stone-500">
                      {item.start_at} ({item.days}d) &bull; Qty {item.quantity} &bull; {item.slot}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-stone-900 block">{formatCurrency(item.item_subtotal)}</span>
                    <span className="text-[10px] text-amber-700">+ {formatCurrency(item.item_deposit)} dep</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Rental Subtotal:</span>
                <span className="font-semibold">{formatCurrency(totalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-amber-900">
                <span>Refundable Deposit:</span>
                <span className="font-semibold">{formatCurrency(totalDeposit)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>{formatCurrency(estimatedTaxes)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-stone-900">Total Payable</span>
                <span className="font-serif text-2xl font-black text-red-900">{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                Choose Payment Method
              </span>

              {/* 1-Click Instant Mock Payment Sandbox (Ideal for Demo!) */}
              <button
                type="button"
                disabled={loading || !user}
                onClick={() => handleCheckoutProcess(true, false)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Complete Test Payment (1-Click Sandbox)</span>
              </button>

              {/* Razorpay Test Mode */}
              <button
                type="button"
                disabled={loading || !user}
                onClick={() => handleCheckoutProcess(false, false)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-amber-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Pay via Razorpay Test Checkout</span>
              </button>

              {/* Simulate failure test button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  disabled={loading || !user}
                  onClick={() => handleCheckoutProcess(true, true)}
                  className="text-[11px] text-stone-400 hover:text-red-600 underline"
                >
                  (Demo Testing: Simulate Payment Failure)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
