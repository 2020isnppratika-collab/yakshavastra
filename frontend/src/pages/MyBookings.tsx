import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Booking } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";

const statusBadges: Record<string, { label: string; class: string }> = {
  confirmed: { label: "Confirmed", class: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  picked_up: { label: "Picked Up / In Performance", class: "bg-blue-100 text-blue-800 border-blue-300" },
  returned: { label: "Returned & Deposit Settled", class: "bg-purple-100 text-purple-800 border-purple-300" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800 border-red-300" },
  pending_payment: { label: "Pending Payment", class: "bg-amber-100 text-amber-800 border-amber-300" },
};

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Cancel Modal State
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.bookings
        .getMyBookings()
        .then((data) => setBookings(data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to view your bookings</h2>
        <p className="text-sm text-stone-500">Track current costume reservations and download official receipts.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-xl bg-red-900 text-amber-100 font-bold text-xs uppercase tracking-wider hover:bg-red-800"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      const updated = await api.bookings.cancel(selectedBookingToCancel.booking_code, cancelReason);
      setBookings((prev) =>
        prev.map((b) => (b.booking_code === updated.booking_code ? updated : b))
      );
      setSelectedBookingToCancel(null);
      setCancelReason("");
    } catch (err: any) {
      alert(err.message || "Could not cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Customer Account Area
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">My Costume Bookings</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage your troupe reservations, view return statuses, and check security deposit refunds.
          </p>
        </div>

        <Link
          to="/costumes"
          className="px-4 py-2 bg-red-900 text-amber-100 font-semibold text-xs rounded-xl hover:bg-red-800 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
        >
          + Rent Another Costume
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-stone-200 overflow-x-auto pb-1 text-xs font-semibold">
        {["all", "confirmed", "picked_up", "returned", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-t-xl transition-all capitalize whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-red-900 border-t-2 border-red-900 font-bold shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {tab.replace("_", " ")} ({bookings.filter((b) => (tab === "all" ? true : b.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-4">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-900">No bookings in this tab</h3>
          <p className="text-xs text-stone-500">You do not have any costume rentals under this status.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const statusConfig = statusBadges[b.status] || { label: b.status, class: "bg-stone-100 text-stone-800" };
            return (
              <div
                key={b.id || b.booking_code}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-base font-black text-stone-900">
                        {b.booking_code}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.class}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Booked on {formatDate(b.created_at)} &bull; Event: <strong>{b.event_details.event_name}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-serif font-bold text-red-900 block">
                      {formatCurrency(b.pricing.total_payable)}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      (Includes {formatCurrency(b.pricing.deposit)} deposit)
                    </span>
                  </div>
                </div>

                {/* Items in booking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {b.items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{item.name}</span>
                        <span className="text-stone-500">
                          Qty: {item.quantity} &bull; Size: {item.size} &bull; {item.start_at} to {item.end_at}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return inspection note if returned */}
                {b.return_details && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Return Complete:</strong> Deposit refund of{" "}
                      <strong>{formatCurrency(b.return_details.deposit_refunded)}</strong> credited back.
                      {b.return_details.inspection_notes && (
                        <p className="text-purple-800 mt-0.5">{b.return_details.inspection_notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation details if cancelled */}
                {b.cancellation && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Booking Cancelled:</strong> Total refund of{" "}
                      <strong>{formatCurrency(b.cancellation.refund_amount)}</strong> calculated based on cancellation policy.
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/booking/success/${b.booking_code}`}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </Link>
                  </div>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => setSelectedBookingToCancel(b)}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedBookingToCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Cancel Booking {selectedBookingToCancel.booking_code}?
            </h3>

            {/* Refund policy explanation */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <strong className="block">Cancellation Refund Policy:</strong>
              <p>&bull; &gt; 7 days before performance: 100% rental fee refund + 100% deposit refund.</p>
              <p>&bull; 3 to 7 days: 50% rental fee refund + 100% deposit refund.</p>
              <p>&bull; &lt; 3 days: 0% rental fee refund (deposit still returned in full).</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Reason for cancellation
              </label>
              <textarea
                rows={3}
                placeholder="Event postponed, date changed, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-red-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingToCancel(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-red-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-800 disabled:opacity-50"
              >
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
