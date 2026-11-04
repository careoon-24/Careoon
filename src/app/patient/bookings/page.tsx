"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Star,
  Plus,
  RefreshCw,
  UserCheck,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

export default function PatientBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<"active" | "history">("active");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error("Failed to load patient bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeBookings = bookings.filter((b) =>
    ["NURSE_OFFERED", "SEARCHING_NURSE", "CONFIRMED", "NURSE_ARRIVED", "IN_PROGRESS"].includes(b.status)
  );

  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status)
  );

  const displayedList = tab === "active" ? activeBookings : pastBookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed (पुष्टी झाली)</span>;
      case "NURSE_OFFERED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Nurse Offer Sent (१५ मिनिटे)</span>;
      case "SEARCHING_NURSE":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Searching Nurse</span>;
      case "NURSE_ARRIVED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">Nurse Arrived (पोहोचल्या)</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">Care In Progress</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-300">Care Completed (पूर्ण)</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-4 py-6">
      {/* Top Title & CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            माझ्या होम केअर भेटी (My Bookings)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Live service tracking and Sangli-Miraj visit history</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
          </button>
          <Link
            href="/patient"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नवीन भेट बुक करा</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setTab("active")}
          className={`py-2 rounded-xl transition-all ${
            tab === "active"
              ? "bg-white text-teal-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          सक्रिय भेटी ({activeBookings.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`py-2 rounded-xl transition-all ${
            tab === "history"
              ? "bg-white text-teal-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          पूर्ण झालेला इतिहास ({pastBookings.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {tab === "active" ? "सध्या कोणतीही सक्रिय भेट चालू नाही." : "मागील उपचारांचा इतिहास उपलब्ध नाही."}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              सांगली, मिरज किंवा कुपवाडमध्ये हॉस्पिटल-दर्जाची नर्सिंग सेवा हवी असल्यास नवीन भेट बुक करा.
            </p>
            {tab === "active" && (
              <Link
                href="/patient"
                className="inline-block text-xs text-teal-600 font-bold underline mt-1 hover:text-teal-700"
              >
                उपलब्ध क्लिनिकल सेवा पहा (Browse Services) →
              </Link>
            )}
          </div>
        ) : (
          displayedList.map((booking) => {
            const nurseName = booking.assignedNurse?.user?.fullName;
            const nurseCode = booking.assignedNurse?.nurseCode;

            return (
              <div
                key={booking.id}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-teal-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-black text-teal-700">
                      {booking.bookingCode}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 leading-tight mt-0.5">
                      {booking.service?.name || "Home Nursing Procedure"}
                    </h3>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Key metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>तारीख: <strong>{booking.scheduledDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>वेळ: <strong>{booking.scheduledTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">
                      पत्ता: {booking.addressLine}, {booking.city || "Sangli"}
                    </span>
                  </div>
                </div>

                {/* Assigned Nurse Info */}
                {nurseName && (
                  <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {nurseName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{nurseName}</span>
                        <span className="text-[10px] text-teal-700 font-mono">
                          Nurse ID: {nurseCode || "SANGLI-RN"}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      MNC Verified
                    </span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 font-medium">
                    रक्कम: <strong className="text-slate-900 font-black">{formatCurrency(booking.totalPatientAmount || booking.servicePrice)}</strong>
                  </div>

                  <Link
                    href={`/patient/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold text-xs"
                  >
                    <span>तपशील व ट्रॅकर पहा</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
