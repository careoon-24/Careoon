"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  Activity,
  User,
} from "lucide-react";

export default function NurseJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const { bookings, services, users, timelineEvents, nurseUpdateJobProgress } = useCareoon();

  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const booking = bookings.find((b) => b.id === bookingId);
  const service = services.find((s) => s.id === booking?.serviceId);
  const patient = users.find((u) => u.id === booking?.patientId);
  const events = timelineEvents
    .filter((e) => e.bookingId === bookingId)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!booking) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-xs text-rose-500 font-semibold">Job not found.</p>
        <Link href="/nurse" className="text-xs text-teal-600 underline">
          Return to Nurse Dashboard
        </Link>
      </div>
    );
  }

  const handleUpdate = (targetStatus: any) => {
    setError("");
    const res = nurseUpdateJobProgress(booking.id, targetStatus, clinicalNotes);
    if (!res.success) {
      setError(res.error || "Failed to update job status.");
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/nurse")}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Jobs
        </button>
        <span className="text-[11px] font-mono text-zinc-400">Visit #{booking.id.slice(-6)}</span>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
              {service?.name}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Patient: <strong>{patient?.fullName || "Eleanor Vance"}</strong>
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Location & Access Details */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-1.5 border border-zinc-200/60 dark:border-zinc-700/60">
          <div className="flex items-start gap-1.5 text-zinc-800 dark:text-zinc-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>
              {booking.serviceAddress.street}, {booking.serviceAddress.apartment && `${booking.serviceAddress.apartment}, `}
              {booking.serviceAddress.city} {booking.serviceAddress.postalCode}
            </span>
          </div>
          {booking.serviceAddress.instructions && (
            <div className="text-[11px] text-zinc-500 pl-5">
              <span className="font-semibold">Special Instructions:</span> {booking.serviceAddress.instructions}
            </div>
          )}
          <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {formatDate(booking.scheduledDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {booking.scheduledTimeSlot}
            </span>
          </div>
        </div>

        {/* Clinical Notes Input */}
        {["nurse_arrived", "in_progress"].includes(booking.status) && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Clinical Visit Notes
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record vitals, sterile field preparation, wound dressing status, patient tolerance..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {/* Status transition actions */}
        <div className="space-y-2 pt-2">
          {booking.status === "confirmed" && (
            <button
              onClick={() => handleUpdate("nurse_arrived")}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Confirm Arrival at Residence
            </button>
          )}

          {booking.status === "nurse_arrived" && (
            <button
              onClick={() => handleUpdate("in_progress")}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              Commence Clinical Care Procedure
            </button>
          )}

          {booking.status === "in_progress" && (
            <button
              onClick={() => handleUpdate("completed")}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete Care & Sign Off Visit
            </button>
          )}

          {booking.status === "completed" && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 font-medium text-center">
              ✓ Care procedure completed. Net payable ({formatCurrency(booking.calculatedNursePayable)}) accrued in your earnings ledger.
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Visit Activity History
        </h3>
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-900 dark:text-white">{evt.actorName}</span>
                  <span className="text-zinc-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
