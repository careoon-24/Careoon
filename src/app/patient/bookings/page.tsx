"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
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
} from "lucide-react";

export default function PatientBookingsPage() {
  const { bookings, services, users, nurseProfiles, offers, reviews, currentUser } = useCareoon();
  const [tab, setTab] = useState<"active" | "history">("active");

  // Filter bookings for current patient
  const patientBookings = bookings.filter((b) =>
    currentUser ? b.patientId === currentUser.id : true
  );

  const activeBookings = patientBookings.filter((b) =>
    ["draft", "offer_pending", "reselection_required", "confirmed", "nurse_arrived", "in_progress"].includes(
      b.status
    )
  );

  const pastBookings = patientBookings.filter((b) =>
    ["completed", "payment_pending", "closed", "cancelled_by_patient", "cancelled_by_nurse", "cancelled_by_admin", "no_show", "disputed"].includes(
      b.status
    )
  );

  const displayedList = tab === "active" ? activeBookings : pastBookings;

  return (
    <div className="space-y-4">
      {/* Top Title & CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            My Care Bookings
          </h1>
          <p className="text-xs text-zinc-500">Live service tracking and care history</p>
        </div>
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Book
        </Link>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setTab("active")}
          className={`py-1.5 rounded-lg transition-colors ${
            tab === "active"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Active ({activeBookings.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`py-1.5 rounded-lg transition-colors ${
            tab === "history"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          History ({pastBookings.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {tab === "active" ? "No active home nursing bookings." : "No past booking records."}
            </p>
            {tab === "active" && (
              <Link
                href="/patient"
                className="inline-block text-xs text-blue-600 font-semibold underline mt-1"
              >
                Browse available nursing services
              </Link>
            )}
          </div>
        ) : (
          displayedList.map((booking) => {
            const service = services.find((s) => s.id === booking.serviceId);
            const nurse = nurseProfiles.find((n) => n.id === booking.currentNurseId);
            const nurseUser = nurse ? users.find((u) => u.id === nurse.userId) : null;
            const hasReview = reviews.some((r) => r.bookingId === booking.id);

            return (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">#{booking.id.slice(-6)}</span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                      {service?.name || "Home Nursing Procedure"}
                    </h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* 15-Minute Countdown Banner if offer_pending */}
                {booking.status === "offer_pending" && booking.activeOfferExpiresAt && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-amber-900 dark:text-amber-200">
                      Nurse Response Window:
                    </span>
                    <CountdownTimer expiresAt={booking.activeOfferExpiresAt} />
                  </div>
                )}

                {/* Reselection Required Banner */}
                {booking.status === "reselection_required" && (
                  <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-orange-900 dark:text-orange-200 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Offer expired or declined</span>
                    </div>
                    <Link
                      href={`/patient/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-600 text-white text-[11px] font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reselect Nurse
                    </Link>
                  </div>
                )}

                {/* Key metadata */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formatDate(booking.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{booking.scheduledTimeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {booking.serviceAddress.street}, {booking.serviceAddress.city} ({booking.serviceAddress.postalCode})
                    </span>
                  </div>
                </div>

                {/* Assigned Nurse Info */}
                {nurseUser && (
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                        {nurseUser.fullName.substring(0, 1)}
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {nurseUser.fullName}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {formatCurrency(booking.servicePriceSnapshot)}
                    </span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  {booking.status === "closed" && !hasReview ? (
                    <Link
                      href={`/patient/bookings/${booking.id}/review`}
                      className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Leave Verified Review
                    </Link>
                  ) : (
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Price: {formatCurrency(booking.servicePriceSnapshot)}
                    </span>
                  )}

                  <Link
                    href={`/patient/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs"
                  >
                    <span>View Status Tracker</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
