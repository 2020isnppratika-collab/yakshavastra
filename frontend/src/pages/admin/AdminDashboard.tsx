import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  DollarSign,
  Calendar,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { api } from "../../api/client";
import { formatCurrency, formatDate } from "../../lib/utils";

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    api.admin
      .getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading admin dashboard:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm("Are you sure you want to reset the demo database? This will restore 36+ authentic Yakshagana costumes and seed bookings.")) {
      return;
    }
    setResetting(true);
    try {
      await api.admin.resetSeed();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const handleQuickStatusChange = async (bookingCode: string, newStatus: string) => {
    try {
      await api.admin.updateStatus(bookingCode, newStatus);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading admin operations dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar with Quick Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Platform Operations Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Reset costumes and bookings back to clean day-one demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Resetting Demo..." : "Reset Demo Seed Data"}</span>
          </button>

          <Link
            to="/admin/costumes"
            className="px-4 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Costumes</span>
          </Link>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo database refreshed successfully with 36+ authentic Yakshagana costumes and bookings!</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Total Revenue</span>
          <span className="text-xl font-bold font-serif text-red-900 block truncate">
            {formatCurrency(data?.total_revenue || 0)}
          </span>
          <span className="text-[10px] text-emerald-600">Active & Settled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Total Bookings</span>
          <span className="text-xl font-bold text-stone-900 block">
            {data?.total_bookings || 0}
          </span>
          <span className="text-[10px] text-stone-400">All-time count</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Active Rentals</span>
          <span className="text-xl font-bold text-blue-700 block">
            {data?.active_rentals || 0}
          </span>
          <span className="text-[10px] text-blue-600">On stage now</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Upcoming Pickups</span>
          <span className="text-xl font-bold text-amber-700 block">
            {data?.pending_pickups || 0}
          </span>
          <span className="text-[10px] text-amber-600">Needs handover</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Pending Returns</span>
          <span className="text-xl font-bold text-purple-700 block">
            {data?.pending_returns || 0}
          </span>
          <span className="text-[10px] text-purple-600">Inspection queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs text-stone-500 font-medium">Costumes Catalog</span>
          <span className="text-xl font-bold text-stone-900 block">
            {data?.total_costumes || 0}
          </span>
          <span className="text-[10px] text-stone-400">Physical inventory</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-3 border-b border-stone-200 text-xs font-bold pb-2">
        <Link to="/admin" className="text-red-900 border-b-2 border-red-900 pb-2">Dashboard</Link>
        <Link to="/admin/bookings" className="text-stone-500 hover:text-stone-900 pb-2">Bookings Manager</Link>
        <Link to="/admin/costumes" className="text-stone-500 hover:text-stone-900 pb-2">Costume Inventory</Link>
        <Link to="/admin/calendar" className="text-stone-500 hover:text-stone-900 pb-2">Rental Schedule Calendar</Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Recent Bookings & Dispatch</h3>
            <p className="text-xs text-stone-500">Live tracker of recent customer reservations</p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-semibold text-red-900 hover:underline">
            View All Bookings &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Customer / Troupe</th>
                <th className="p-3">Event & Venue</th>
                <th className="p-3">Costumes</th>
                <th className="p-3">Total (Rent + Dep)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data?.recent_bookings?.map((b: any) => (
                <tr key={b.id || b.booking_code} className="hover:bg-stone-50/80">
                  <td className="p-3 font-mono font-bold text-stone-900">{b.booking_code}</td>
                  <td className="p-3 font-medium">
                    <div>{b.user_name || "Customer"}</div>
                    <div className="text-[10px] text-stone-400">{b.user_email}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-stone-900">{b.event_details?.event_name}</div>
                    <div className="text-[10px] text-stone-400">{b.event_details?.venue}, {b.event_details?.city}</div>
                  </td>
                  <td className="p-3">
                    {b.items?.map((item: any, i: number) => (
                      <span key={i} className="inline-block bg-stone-100 px-2 py-0.5 rounded text-[10px] mr-1 mb-1">
                        {item.name} ({item.quantity})
                      </span>
                    ))}
                  </td>
                  <td className="p-3 font-serif font-bold text-stone-900">
                    {formatCurrency(b.pricing?.total_payable || 0)}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-1 whitespace-nowrap">
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleQuickStatusChange(b.booking_code, "picked_up")}
                        className="px-2.5 py-1 rounded-lg bg-blue-900 text-white font-semibold text-[10px] hover:bg-blue-800 shadow-sm"
                      >
                        Dispatch / Picked Up
                      </button>
                    )}
                    {b.status === "picked_up" && (
                      <button
                        onClick={() => handleQuickStatusChange(b.booking_code, "returned")}
                        className="px-2.5 py-1 rounded-lg bg-purple-900 text-white font-semibold text-[10px] hover:bg-purple-800 shadow-sm"
                      >
                        Mark Returned
                      </button>
                    )}
                    <Link
                      to={`/booking/success/${b.booking_code}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[10px]"
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

      {/* Popular Costumes Ranking */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">Most In-Demand Yakshagana Costumes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.popular_costumes?.map((c: any) => (
            <div key={c.id} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              {c.image && (
                <img src={c.image} alt={c.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="truncate">
                <span className="font-bold text-stone-900 block truncate">{c.name}</span>
                <span className="text-stone-500">Rate: {formatCurrency(c.price_per_day)}/day</span>
                <span className="text-amber-800 font-semibold block text-[10px]">
                  {c.rent_count} performance rentals
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
