import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Phone,
  FileText
} from "lucide-react";
import { api } from "../api/client";
import { Booking } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";

export const BookingConfirmation: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#991B1B", "#F59E0B", "#D97706", "#B45309"],
    });

    if (code) {
      api.bookings
        .getByIdOrCode(code)
        .then((data) => setBooking(data))
        .catch((err) => console.error("Error fetching confirmed booking:", err))
        .finally(() => setLoading(false));
    }
  }, [code]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading booking confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Booking not found</h2>
        <Link to="/costumes" className="text-sm font-semibold text-red-900 hover:underline">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:p-0 print:m-0">
      {/* Success Celebration Card */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-white rounded-3xl p-8 sm:p-10 border border-amber-500/40 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 mx-auto flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Booking Confirmed & Inventory Reserved
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
            ಧನ್ಯವಾದಗಳು! Namaskara
          </h1>
          <p className="text-sm text-amber-100/80 max-w-lg mx-auto">
            Your Yakshagana costumes are officially reserved. Confirmation details and rental receipt have been generated.
          </p>
        </div>

        {/* Prominent Booking Code Display */}
        <div className="inline-block bg-stone-900/90 border-2 border-amber-400/80 rounded-2xl px-6 py-3 shadow-inner">
          <span className="text-[11px] uppercase tracking-wider text-amber-300/80 block font-semibold">
            Your Booking Code
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-amber-200 tracking-wider">
            {booking.booking_code}
          </span>
        </div>
      </div>

      {/* Itemized Confirmation Receipt */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Yakshagana Costume Rental Receipt
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Issued by YakshaVastra Heritage Trust &bull; Booked on {formatDate(booking.created_at)}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="print:hidden inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Event & Pickup Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200 text-xs text-stone-700">
          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-2">Event Information</h4>
            <p className="font-semibold text-sm text-stone-900">{booking.event_details.event_name}</p>
            {booking.event_details.troupe_name && (
              <p className="text-stone-600">Troupe: {booking.event_details.troupe_name}</p>
            )}
            <p className="text-stone-600">Venue: {booking.event_details.venue}, {booking.event_details.city}</p>
            <p className="text-stone-600">Contact: {booking.event_details.contact_phone}</p>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-2">Pickup & Handover</h4>
            <p className="capitalize font-semibold text-stone-900">
              Mode: {booking.pickup_mode.replace("_", " ")}
            </p>
            <p className="text-stone-600 mt-1">
              Hub Address: Car Street, Near Sri Krishna Temple, Udupi (or selected regional centre).
            </p>
            <p className="text-stone-500 mt-1">
              Helpline: +91 98800 12345
            </p>
          </div>
        </div>

        {/* Reserved Costumes Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900">Reserved Costumes</h4>
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
            {booking.items.map((item, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:bg-stone-50">
                <div className="space-y-1">
                  <h5 className="font-serif font-bold text-stone-900 text-sm">{item.name}</h5>
                  <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                    <span>Size: {item.size}</span>
                    <span>&bull;</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>&bull;</span>
                    <span className="capitalize">{item.slot.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-stone-600 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-red-900" />
                    <span>{formatDate(item.start_at)} to {formatDate(item.end_at)} ({item.days} days)</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold font-serif text-red-900 block">
                    {formatCurrency(item.item_subtotal)}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    + {formatCurrency(item.item_deposit)} deposit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Billing Table */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700">
          <div className="flex justify-between">
            <span>Rental Subtotal:</span>
            <span className="font-semibold text-stone-900">{formatCurrency(booking.pricing.subtotal)}</span>
          </div>

          <div className="flex justify-between text-amber-900">
            <span>Security Deposit (Refundable upon inspection):</span>
            <span className="font-bold">{formatCurrency(booking.pricing.deposit)}</span>
          </div>

          <div className="flex justify-between">
            <span>GST (5%):</span>
            <span>{formatCurrency(booking.pricing.taxes)}</span>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm">
            <span className="font-bold text-stone-900">Total Paid (via {booking.payment.provider}):</span>
            <span className="font-serif text-xl font-bold text-red-900">{formatCurrency(booking.pricing.total_payable)}</span>
          </div>
        </div>

        {/* Return & Deposit Policy Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block">Deposit Refund Assurance:</strong>
            <p>
              Your security deposit of <strong>{formatCurrency(booking.pricing.deposit)}</strong> will be credited back within 24 hours of returning the costumes at our hub following inspection.
            </p>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="print:hidden flex flex-wrap gap-4 pt-4 border-t border-stone-200">
          <Link
            to="/account/bookings"
            className="px-6 py-3 rounded-xl bg-red-900 text-amber-100 font-bold text-xs uppercase tracking-wider hover:bg-red-800 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <span>View in My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/costumes"
            className="px-6 py-3 rounded-xl bg-white border border-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-colors"
          >
            Browse More Costumes
          </Link>
        </div>
      </div>
    </div>
  );
};
