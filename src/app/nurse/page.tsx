"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  Star,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function NurseDashboardPage() {
  const {
    offers,
    bookings,
    services,
    getCurrentNurseProfile,
    nurseAcceptOffer,
    nurseRejectOffer,
    nurseUpdateJobProgress,
  } = useCareoon();

  const nurseProfile = getCurrentNurseProfile();

  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");

  // Offers assigned to this nurse
  const nurseOffers = offers.filter((o) =>
    nurseProfile ? o.nurseId === nurseProfile.id : true
  );

  const pendingOffers = nurseOffers.filter((o) => o.status === "pending");

  // Confirmed/In-progress jobs assigned to this nurse
  const nurseJobs = bookings.filter((b) =>
    nurseProfile
      ? b.currentNurseId === nurseProfile.id
      : b.currentNurseId !== undefined
  );

  const activeJobs = nurseJobs.filter((b) =>
    ["confirmed", "nurse_arrived", "in_progress"].includes(b.status)
  );

  const handleAccept = (offerId: string) => {
    setActionError("");
    const res = nurseAcceptOffer(offerId);
    if (!res.success) {
      setActionError(res.error || "Failed to accept offer.");
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectingOfferId) return;
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for declining.");
      return;
    }
    const res = nurseRejectOffer(rejectingOfferId, rejectReason);
    if (res.success) {
      setRejectingOfferId(null);
      setRejectReason("");
    } else {
      setActionError(res.error || "Failed to decline offer.");
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Performance Glance */}
      {nurseProfile && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Completed</div>
            <div className="text-base font-extrabold text-zinc-900 dark:text-white">
              {nurseProfile.completedBookingsCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Rating</div>
            <div className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {nurseProfile.ratingAverage.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Cancels</div>
            <div className="text-base font-extrabold text-zinc-600 dark:text-zinc-300">
              {nurseProfile.cancellationCount}
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 1. Pending Offers with 15-Minute Countdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Incoming Booking Offers ({pendingOffers.length})
          </h2>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            15-min response required
          </span>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No pending booking offers. New patient offers will appear here with live countdown.
          </div>
        ) : (
          pendingOffers.map((offer) => {
            const booking = bookings.find((b) => b.id === offer.bookingId);
            const service = services.find((s) => s.id === booking?.serviceId);

            return (
              <div
                key={offer.id}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">
                      OFFER #{offer.id.slice(-6)}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                      {service?.name || "Nursing Service"}
                    </h3>
                  </div>
                  <CountdownTimer expiresAt={offer.expiresAt} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{booking?.scheduledDate && formatDate(booking.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{booking?.scheduledTimeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Postal Area: {booking?.serviceAddress.postalCode} (Metro City)</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between font-semibold">
                    <span className="text-zinc-500">Your Net Payout:</span>
                    <span className="text-teal-600 dark:text-teal-400 text-sm font-extrabold">
                      {formatCurrency(booking?.calculatedNursePayable || 96.0)}
                    </span>
                  </div>
                </div>

                {/* Accept / Reject actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setRejectingOfferId(offer.id)}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(offer.id)}
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-teal-600/20 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Accept Offer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Active & Confirmed Clinical Jobs */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          Active Visits & Scheduled Jobs ({activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No active jobs in progress. Accepted offers will appear here for on-site execution.
          </div>
        ) : (
          activeJobs.map((job) => {
            const service = services.find((s) => s.id === job.serviceId);

            return (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">#{job.id.slice(-6)}</span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                      {service?.name}
                    </h3>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {/* Patient Address & Instructions (Now visible since nurse confirmed!) */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-1">
                  <div className="flex items-start gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      {job.serviceAddress.street}, {job.serviceAddress.apartment && `${job.serviceAddress.apartment}, `}
                      {job.serviceAddress.city} {job.serviceAddress.postalCode}
                    </span>
                  </div>
                  {job.serviceAddress.instructions && (
                    <div className="text-[11px] text-zinc-500 pl-5">
                      Note: {job.serviceAddress.instructions}
                    </div>
                  )}
                </div>

                {/* Sequential Job Status Control Buttons */}
                <div className="space-y-1.5 pt-1">
                  {job.status === "confirmed" && (
                    <button
                      onClick={() => nurseUpdateJobProgress(job.id, "nurse_arrived")}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Mark &quot;Arrived at Patient Home&quot;
                    </button>
                  )}

                  {job.status === "nurse_arrived" && (
                    <button
                      onClick={() => nurseUpdateJobProgress(job.id, "in_progress")}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Start Clinical Care Procedure
                    </button>
                  )}

                  {job.status === "in_progress" && (
                    <button
                      onClick={() => nurseUpdateJobProgress(job.id, "completed", "Clinical procedure completed with sterile technique.")}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Complete Care & Sign Off Visit
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400">
                    Net Payout: <strong className="text-zinc-800 dark:text-zinc-200">{formatCurrency(job.calculatedNursePayable)}</strong>
                  </span>
                  <Link
                    href={`/nurse/jobs/${job.id}`}
                    className="text-teal-600 font-semibold text-[11px] flex items-center gap-0.5"
                  >
                    Clinical Log & Details
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Offer Reason Modal */}
      {rejectingOfferId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Decline Booking Offer</h3>
            <p className="text-xs text-zinc-500">
              Please state why you are declining so the patient can be matched with an alternative nurse.
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden"
            >
              <option value="">Select reason...</option>
              <option value="Hospital shift conflict / overtime">Hospital shift conflict / overtime</option>
              <option value="Distance / traffic congestion">Distance / traffic congestion</option>
              <option value="Clinical supply restock needed">Clinical supply restock needed</option>
              <option value="Family or medical emergency">Family or medical emergency</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectingOfferId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                Back
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
