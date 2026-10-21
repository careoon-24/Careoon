"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
  RefreshCw,
  MapPin,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLiveData = async () => {
    try {
      const [bookingsRes, nursesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/nurses?all=true"),
      ]);

      const [bookingsData, nursesData] = await Promise.all([
        bookingsRes.json(),
        nursesRes.json(),
      ]);

      if (bookingsData.success && bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      }
      if (nursesData.success && nursesData.nurses) {
        setNurses(nursesData.nurses);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch live admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Pending 15-Minute Offers in flight
  const pendingOffers: any[] = [];
  bookings.forEach((b) => {
    if (b.offers && Array.isArray(b.offers)) {
      b.offers.forEach((o: any) => {
        if (o.status === "PENDING" && new Date(o.expiresAt) > new Date()) {
          pendingOffers.push({
            ...o,
            booking: b,
          });
        }
      });
    }
  });

  // 2. Metrics from 100% Real Database Bookings
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalVolume = completedBookings.reduce((sum, b) => sum + (b.totalPatientAmount || b.servicePrice || 0), 0);
  const totalPlatformCommission = completedBookings.reduce(
    (sum, b) => sum + (b.commissionAmount || 0),
    0
  );

  const verifiedNursesCount = nurses.filter((n) => n.adminApprovalStatus === "VERIFIED").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Operational Command & Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live monitor for Sangli 15-minute response deadlines, door-to-door bookings, and commission ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLiveData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
            <span>Sync Live DB</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Real-time Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Completed Care</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completedBookings.length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalBookingsCount}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Delivered Visits</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Gross Volume</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Delivered Patient Care</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
            <span>Careoon Commission</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {formatCurrency(totalPlatformCommission)}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold">
            Auto-Accrued Revenue
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Verified Nurses</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {verifiedNursesCount}
            <span className="text-xs font-normal text-slate-400 ml-1">approved</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">{nurses.length} Total Sangli Staff</div>
        </div>
      </div>

      {/* Operational Priority 1: Pending 15-Minute Offers in Flight */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            Active 15-Minute Response Watch ({pendingOffers.length})
          </h2>
          <span className="text-[11px] text-slate-400">Expires if nurse does not accept in 15 mins</span>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-xs text-slate-500 text-center">
            No pending 15-minute nurse offers in flight right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOffers.map((item) => {
              const booking = item.booking;
              const service = booking.service;
              const assignedNurse = booking.assignedNurse;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {service?.name || "Nursing Procedure"}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        Booking #{booking.bookingCode || booking.id.slice(-6)}
                      </div>
                    </div>
                    <CountdownTimer expiresAt={new Date(item.expiresAt).toISOString()} />
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200/60 space-y-1">
                    <div className="text-slate-700 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{booking.addressLine}, {booking.city || "Sangli"}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Patient: <strong>{booking.patientName || booking.patient?.fullName}</strong></span>
                      <span>Offered to: <strong>{assignedNurse?.user?.fullName || "Assigned Nurse"}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-amber-900">
                      Amount: {formatCurrency(booking.totalPatientAmount || booking.servicePrice)}
                    </span>
                    <Link
                      href={`/admin/bookings?focus=${booking.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900"
                    >
                      <span>Inspect Booking</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real Live Recent Bookings Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            Live Bookings Stream ({bookings.length} Total)
          </h2>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>View All Ops & Bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No patient bookings created yet in the database.
            </div>
          ) : (
            bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700 text-xs">
                      #{b.bookingCode || b.id.slice(-6)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === "COMPLETED"
                          ? "bg-teal-50 text-teal-800 border border-teal-200"
                          : b.status === "CONFIRMED"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : b.status === "NURSE_OFFERED"
                          ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {b.status}
                    </span>
                    {b.couponCode && (
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[9px] font-extrabold">
                        {b.couponCode} (-₹{b.discountAmount})
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900">
                    {b.service?.name || "Clinical Procedure"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Patient: {b.patientName || b.patient?.fullName} • {b.addressLine}, {b.city || "Sangli"}
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                  <div className="text-sm font-black text-slate-900">
                    {formatCurrency(b.totalPatientAmount || b.servicePrice)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatDate(b.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
