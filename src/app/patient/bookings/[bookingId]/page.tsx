"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  FileText,
  User,
  History,
  XCircle,
} from "lucide-react";

export default function PatientBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const {
    bookings,
    services,
    users,
    nurseProfiles,
    timelineEvents,
    reselectNurseForBooking,
    getEligibleNursesForService,
    patientCancelBooking,
    currentUser,
  } = useCareoon();

  const [selectedReplacementNurseId, setSelectedReplacementNurseId] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-xs text-rose-500 font-semibold">Booking not found.</p>
        <Link href="/patient/bookings" className="text-xs text-blue-600 underline">
          Return to Bookings
        </Link>
      </div>
    );
  }

  const service = services.find((s) => s.id === booking.serviceId);
  const nurse = nurseProfiles.find((n) => n.id === booking.currentNurseId);
  const nurseUser = nurse ? users.find((u) => u.id === nurse.userId) : null;
  const events = timelineEvents
    .filter((e) => e.bookingId === booking.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Eligible replacement nurses
  const replacementCandidates = service
    ? getEligibleNursesForService(
        service.id,
        booking.serviceAddress.postalCode,
        booking.scheduledDate,
        booking.scheduledTimeSlot
      ).filter((c) => c.eligible && c.nurse.id !== booking.currentNurseId)
    : [];

  const handleReselect = () => {
    setActionError("");
    if (!selectedReplacementNurseId) {
      setActionError("Please select a nurse from the eligible list.");
      return;
    }
    const result = reselectNurseForBooking(booking.id, selectedReplacementNurseId);
    if (!result.success) {
      setActionError(result.error || "Failed to reselect nurse.");
    }
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      setActionError("Please provide a cancellation reason.");
      return;
    }
    const res = patientCancelBooking(booking.id, cancelReason);
    if (res.success) {
      setShowCancelModal(false);
    } else {
      setActionError(res.error || "Failed to cancel booking.");
    }
  };

  // State machine progress steps
  const steps = [
    { label: "Offer Sent", done: true },
    {
      label: "Confirmed",
      done: ["confirmed", "nurse_arrived", "in_progress", "completed", "closed"].includes(booking.status),
    },
    {
      label: "Arrived",
      done: ["nurse_arrived", "in_progress", "completed", "closed"].includes(booking.status),
    },
    {
      label: "Care Done",
      done: ["completed", "closed"].includes(booking.status),
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/patient/bookings")}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Bookings
        </button>
        <span className="text-[11px] font-mono text-zinc-400">ID: {booking.id}</span>
      </div>

      {/* Main Status Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
              {service?.name || "Home Nursing Procedure"}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Scheduled for {formatDate(booking.scheduledDate)} at {booking.scheduledTimeSlot}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Stepper */}
        {!["cancelled_by_patient", "cancelled_by_nurse", "cancelled_by_admin"].includes(booking.status) && (
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-1 text-center">
              {steps.map((st, i) => (
                <div key={i} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      st.done ? "bg-blue-600 dark:bg-blue-500" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium block truncate ${
                      st.done ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case 1: 15-Minute Countdown Active */}
        {booking.status === "offer_pending" && booking.activeOfferExpiresAt && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                Awaiting Nurse Response
              </span>
              <CountdownTimer expiresAt={booking.activeOfferExpiresAt} />
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              The offer is reserved for Nurse {nurseUser?.fullName || "Maya Patel"}. If they do not respond within 15 minutes, you will be invited to reselect another nurse.
            </p>
          </div>
        )}

        {/* Case 2: Reselection Required */}
        {booking.status === "reselection_required" && (
          <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-3">
            <div className="flex items-start gap-2 text-xs font-bold text-orange-900 dark:text-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                Nurse was unavailable or response timed out.
                <p className="text-[11px] font-normal text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Select another qualified nurse in your area. Your booking address and scheduled time are preserved.
                </p>
              </div>
            </div>

            {replacementCandidates.length === 0 ? (
              <p className="text-xs text-rose-600 font-medium">
                No alternative qualified nurses found in your postal code. Our care coordination team has been notified.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold uppercase text-zinc-500">
                  Select Replacement Nurse
                </label>
                <div className="space-y-1.5">
                  {replacementCandidates.map(({ nurse: rNurse, user: rUser }) => (
                    <div
                      key={rNurse.id}
                      onClick={() => setSelectedReplacementNurseId(rNurse.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                        selectedReplacementNurseId === rNurse.id
                          ? "bg-white dark:bg-zinc-800 border-blue-600 ring-2 ring-blue-500/20"
                          : "bg-white/70 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white">
                          {rUser.fullName}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {rNurse.completedBookingsCount} visits completed • {rNurse.ratingAverage}★
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600">
                        {selectedReplacementNurseId === rNurse.id ? "Selected ✓" : "Select"}
                      </span>
                    </div>
                  ))}
                </div>

                {actionError && <p className="text-xs text-rose-600">{actionError}</p>}

                <button
                  onClick={handleReselect}
                  disabled={!selectedReplacementNurseId}
                  className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Dispatch New 15-Minute Offer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Assigned Nurse Card */}
        {nurseUser && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Assigned Registered Nurse</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs">
                  {nurseUser.fullName.substring(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                    {nurseUser.fullName}
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    License: {nurse?.licenseNumber}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-amber-500 flex items-center gap-0.5 justify-end">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {nurse?.ratingAverage.toFixed(1)}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {nurse?.completedBookingsCount} Completed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Address and Price details */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span className="text-zinc-700 dark:text-zinc-300">
              {booking.serviceAddress.street}, {booking.serviceAddress.apartment && `${booking.serviceAddress.apartment}, `}
              {booking.serviceAddress.city} {booking.serviceAddress.postalCode}
            </span>
          </div>

          {booking.specialInstructions && (
            <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
              <span className="font-medium">Instructions:</span> {booking.specialInstructions}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50 text-xs font-semibold">
            <span className="text-zinc-500">Service Fee:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(booking.servicePriceSnapshot)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {["draft", "offer_pending", "reselection_required", "confirmed"].includes(booking.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Booking
            </button>
          )}

          {["completed", "closed"].includes(booking.status) && (
            <Link
              href={`/patient/bookings/${booking.id}/review`}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              Submit Review
            </Link>
          )}

          <Link
            href="/patient/support"
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 underline font-medium ml-auto"
          >
            Report Issue
          </Link>
        </div>
      </div>

      {/* Audit & Event Timeline */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Care Activity & Timeline Log
        </h3>
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          {events.length === 0 ? (
            <p className="text-xs text-zinc-400">No events logged yet.</p>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {evt.actorName} ({evt.actorRole})
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{evt.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Cancel Care Booking</h3>
            <p className="text-xs text-zinc-500">
              Please let us know why you need to cancel this visit.
            </p>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Hospital discharge delayed by doctor"
              className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden"
            />
            {actionError && <p className="text-xs text-rose-600">{actionError}</p>}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
