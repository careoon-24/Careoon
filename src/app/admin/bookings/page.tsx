"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarDays,
  User,
  Stethoscope,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Search,
  Tag,
  ShieldCheck,
  Phone,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchLiveBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error("Failed to load live bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBookings();
    const interval = setInterval(fetchLiveBookings, 4000); // 4-second live poll
    return () => clearInterval(interval);
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      b.bookingCode.toLowerCase().includes(query) ||
      b.patientName.toLowerCase().includes(query) ||
      b.service?.name?.toLowerCase().includes(query) ||
      b.addressLine.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case "NURSE_OFFERED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Offer Sent (15m)</span>;
      case "SEARCHING_NURSE":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Searching Nurse</span>;
      case "NURSE_ARRIVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">Nurse Arrived</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">In Progress</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-300">Completed</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Bookings & Clinical Operations Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
              Live Neon DB (Synced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time patient bookings in Sangli-Miraj, nurse offers, 15-minute response watches, and doorstep care.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveBookings}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: `All (${bookings.length})` },
            { id: "NURSE_OFFERED", label: "Offer Sent (15m)" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "COMPLETED", label: "Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all text-xs shrink-0 ${
                statusFilter === f.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, code, procedure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>
      </div>

      {/* Live Bookings Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Zero Bookings in Live Database
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your platform database is 100% clean with zero demo data. When a patient schedules a visit in Sangli, it will immediately appear here with real-time status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Booking ID & Date</th>
                  <th className="py-3.5 px-4">Patient & Address</th>
                  <th className="py-3.5 px-4">Procedure</th>
                  <th className="py-3.5 px-4">Assigned Nurse</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Financials (₹)</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const nurseName = b.assignedNurse?.user?.fullName || "Unassigned";

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-mono font-black text-slate-900 text-xs">
                          {b.bookingCode}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-teal-600" />
                          <span>{b.scheduledDate} • {b.scheduledTime}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{b.patientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{b.addressLine}, {b.city}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">
                          {b.service?.name || "Clinical Care"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.durationMinutes} mins
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-teal-700">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>{nurseName}</span>
                        </div>
                        {b.assignedNurse?.nurseCode && (
                          <div className="font-mono text-[10px] text-slate-400">
                            {b.assignedNurse.nurseCode}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(b.status)}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div>{formatCurrency(b.totalPatientAmount)}</div>
                        <div className="text-[10px] text-purple-700 font-semibold">
                          Comm: {formatCurrency(b.commissionAmount)} ({b.commissionPercent}%)
                        </div>
                        {b.couponCode && (
                          <div className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-bold">
                            <Tag className="w-2.5 h-2.5" />
                            <span>-{formatCurrency(b.discountAmount)} ({b.couponCode})</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-[11px] text-slate-400">
                  #{selectedBooking.bookingCode}
                </span>
                <h3 className="font-black text-base text-slate-900">
                  {selectedBooking.service?.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {getStatusBadge(selectedBooking.status)}
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedBooking.scheduledDate} • {selectedBooking.scheduledTime}
              </span>
            </div>

            {/* Patient & Address Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Patient & Sangli Doorstep Address
              </span>
              <div className="font-extrabold text-sm text-slate-900">
                {selectedBooking.patientName}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>{selectedBooking.patientContactPhone}</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{selectedBooking.addressLine}, {selectedBooking.city} {selectedBooking.postalCode}</span>
              </div>
              {selectedBooking.patientNotes && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                  <strong>Notes:</strong> {selectedBooking.patientNotes}
                </div>
              )}
            </div>

            {/* Financial Ledger Snapshot */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-800 block tracking-wider">
                Financial Ledger Snapshot (Neon DB)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-purple-100">
                  <span className="text-[10px] text-slate-400 block">Procedure Rate</span>
                  <span className="font-extrabold text-slate-900">{formatCurrency(selectedBooking.servicePrice)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-purple-100">
                  <span className="text-[10px] text-purple-700 block">Careoon Commission</span>
                  <span className="font-black text-purple-900">{formatCurrency(selectedBooking.commissionAmount)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-purple-100">
                  <span className="text-[10px] text-teal-700 block">Nurse Earnings</span>
                  <span className="font-black text-teal-700">{formatCurrency(selectedBooking.nurseEarningsAmount)}</span>
                </div>
              </div>
              {selectedBooking.couponCode && (
                <div className="flex items-center justify-between text-emerald-800 font-bold pt-1">
                  <span>Coupon Applied ({selectedBooking.couponCode}):</span>
                  <span>- {formatCurrency(selectedBooking.discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-purple-200 flex items-center justify-between font-extrabold text-sm text-slate-900">
                <span>Total Collected at Doorstep:</span>
                <span className="text-teal-700 font-black">{formatCurrency(selectedBooking.totalPatientAmount)}</span>
              </div>
            </div>

            {/* Clinical Progress Notes */}
            {selectedBooking.vitalSigns && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
                <span className="font-bold block text-teal-950 mb-1">On-Site Vitals Recorded:</span>
                <code className="text-[11px] font-mono">{selectedBooking.vitalSigns}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
