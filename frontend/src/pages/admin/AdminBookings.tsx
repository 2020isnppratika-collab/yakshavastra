import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, FileText, X } from "lucide-react";
import { Booking } from "../../types";
import { api } from "../../api/client";
import { formatCurrency, formatDate } from "../../lib/utils";

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Return Inspection Modal State
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<Booking | null>(null);
  const [damageFee, setDamageFee] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [inspectionNotes, setInspectionNotes] = useState("Costume inspected. All items present.");
  const [processingReturn, setProcessingReturn] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    api.admin
      .listBookings({
        status_filter: statusFilter !== "all" ? statusFilter : undefined,
        q: search.trim() || undefined,
      })
      .then((data) => setBookings(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (bookingCode: string, newStatus: string) => {
    if (newStatus === "returned") {
      const b = bookings.find((item) => item.booking_code === bookingCode);
      if (b) {
        setSelectedBookingForReturn(b);
        setDamageFee(0);
        setLateFee(0);
        return;
      }
    }

    try {
      await api.admin.updateStatus(bookingCode, newStatus);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleConfirmReturnInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReturn) return;

    setProcessingReturn(true);
    try {
      await api.admin.recordReturn(selectedBookingForReturn.booking_code, {
        damage_fee: Number(damageFee),
        late_fee: Number(lateFee),
        inspection_notes: inspectionNotes,
      });

      setSelectedBookingForReturn(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to record return inspection");
    } finally {
      setProcessingReturn(false);
    }
  };

  const depositHeld = selectedBookingForReturn ? selectedBookingForReturn.pricing.deposit : 0;
  const netDepositRefund = Math.max(0, depositHeld - Number(damageFee || 0) - Number(lateFee || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Admin Booking Operations
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Bookings & Dispatch Tracker</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Monitor client reservations, mark pickups, and record damage/late fee returns.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-3 border-b border-stone-200 text-xs font-bold pb-2">
        <Link to="/admin" className="text-stone-500 hover:text-stone-900 pb-2">Dashboard</Link>
        <Link to="/admin/bookings" className="text-red-900 border-b-2 border-red-900 pb-2">Bookings Manager ({bookings.length})</Link>
        <Link to="/admin/costumes" className="text-stone-500 hover:text-stone-900 pb-2">Costume Inventory</Link>
        <Link to="/admin/calendar" className="text-stone-500 hover:text-stone-900 pb-2">Rental Schedule Calendar</Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by code, troupe name, venue, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-red-900 shadow-sm"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 shadow-sm focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="picked_up">Picked Up (Active on Stage)</option>
          <option value="returned">Returned (Settled)</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending_payment">Pending Payment</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Customer / Phone</th>
                <th className="p-3">Event & Venue</th>
                <th className="p-3">Costumes</th>
                <th className="p-3">Billing</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Status Action</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <tr key={b.id || b.booking_code} className="hover:bg-stone-50/80">
                  <td className="p-3 font-mono font-bold text-stone-900">{b.booking_code}</td>
                  <td className="p-3">
                    <div className="font-semibold text-stone-900">{b.user_name || "Customer"}</div>
                    <div className="text-[10px] text-stone-500">{b.event_details.contact_phone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-stone-900">{b.event_details.event_name}</div>
                    <div className="text-[10px] text-stone-400">{b.event_details.venue}, {b.event_details.city}</div>
                  </td>
                  <td className="p-3">
                    {b.items.map((it, idx) => (
                      <div key={idx} className="text-[11px] text-stone-700">
                        &bull; {it.name} ({it.quantity}) - {it.start_at} ({it.slot})
                      </div>
                    ))}
                  </td>
                  <td className="p-3">
                    <div className="font-serif font-bold text-red-900">{formatCurrency(b.pricing.total_payable)}</div>
                    <div className="text-[10px] text-amber-800">Dep: {formatCurrency(b.pricing.deposit)}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.booking_code, e.target.value)}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="picked_up">Mark Picked Up</option>
                      <option value="returned">Record Return (Inspect)</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/booking/success/${b.booking_code}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[10px]"
                    >
                      Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Inspection Modal */}
      {selectedBookingForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Return & Deposit Inspection
                </h3>
                <span className="font-mono text-xs text-stone-500">
                  Booking: {selectedBookingForReturn.booking_code}
                </span>
              </div>
              <button onClick={() => setSelectedBookingForReturn(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturnInspection} className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>Security Deposit Held:</span>
                  <span>{formatCurrency(depositHeld)}</span>
                </div>
                <div className="flex justify-between text-red-900">
                  <span>Damage Deductions:</span>
                  <span>- {formatCurrency(Number(damageFee || 0))}</span>
                </div>
                <div className="flex justify-between text-red-900">
                  <span>Late Fee Deductions:</span>
                  <span>- {formatCurrency(Number(lateFee || 0))}</span>
                </div>
                <div className="pt-2 border-t border-amber-300 flex justify-between font-bold text-sm text-emerald-800">
                  <span>Net Refund to Customer Bank:</span>
                  <span className="font-serif text-base">{formatCurrency(netDepositRefund)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Damage Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={damageFee}
                    onChange={(e) => setDamageFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Late Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={lateFee}
                    onChange={(e) => setLateFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Inspection Notes & Ornament Condition
                </label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-red-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReturn(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingReturn}
                  className="px-6 py-2.5 bg-purple-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-purple-800 disabled:opacity-50"
                >
                  {processingReturn ? "Recording..." : "Finalize Return & Release Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
