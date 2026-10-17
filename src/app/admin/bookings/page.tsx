"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  CalendarDays,
  Filter,
  User,
  Stethoscope,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  ArrowRight,
} from "lucide-react";

export default function AdminBookingsPage() {
  const {
    bookings,
    services,
    users,
    nurseProfiles,
    timelineEvents,
    adminReassignBooking,
  } = useCareoon();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reassignNurseId, setReassignNurseId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState<string>("");
  const [reassignSuccess, setReassignSuccess] = useState<string>("");

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "exceptions") {
      return ["offer_pending", "reselection_required", "admin_intervention", "disputed"].includes(b.status);
    }
    return b.status === statusFilter;
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedService = services.find((s) => s.id === selectedBooking?.serviceId);
  const selectedPatient = users.find((u) => u.id === selectedBooking?.patientId);
  const selectedNurse = nurseProfiles.find((n) => n.id === selectedBooking?.currentNurseId);
  const selectedNurseUser = selectedNurse ? users.find((u) => u.id === selectedNurse.userId) : null;

  const events = selectedBooking
    ? timelineEvents.filter((e) => e.bookingId === selectedBooking.id).sort((a, b) => b.timestamp - a.timestamp)
    : [];

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !reassignNurseId) return;

    const res = adminReassignBooking(
      selectedBooking.id,
      reassignNurseId,
      reassignReason || "Supervisory operational reassignment"
    );

    if (res.success) {
      setReassignSuccess("Booking successfully reassigned to selected nurse.");
      setTimeout(() => setReassignSuccess(""), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Bookings Operations Board
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Real-time patient visits, nurse assignments, 15-minute deadlines, and manual interventions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: "all", label: "All Bookings" },
          { id: "exceptions", label: "⚠️ Active Exceptions & Deadlines" },
          { id: "offer_pending", label: "Offer Pending" },
          { id: "confirmed", label: "Confirmed" },
          { id: "in_progress", label: "In Progress" },
          { id: "completed", label: "Completed" },
          { id: "closed", label: "Closed" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full font-semibold transition-colors ${
              statusFilter === f.id
                ? "bg-purple-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Assigned Nurse</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Locked Commission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredBookings.map((booking) => {
                const srv = services.find((s) => s.id === booking.serviceId);
                const pat = users.find((u) => u.id === booking.patientId);
                const nProf = nurseProfiles.find((n) => n.id === booking.currentNurseId);
                const nUser = nProf ? users.find((u) => u.id === nProf.userId) : null;

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                      #{booking.id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {srv?.name || "Procedure"}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {formatDate(booking.scheduledDate)} ({booking.scheduledTimeSlot})
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-700 dark:text-zinc-300">
                      {pat?.fullName || "Patient"}
                    </td>
                    <td className="py-3.5 px-3">
                      {nUser ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            {nUser.fullName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={booking.status} />
                        {booking.status === "offer_pending" && booking.activeOfferExpiresAt && (
                          <CountdownTimer expiresAt={booking.activeOfferExpiresAt} showIcon={false} />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-purple-700 dark:text-purple-300">
                      {booking.lockedCommissionPercentage}% ({formatCurrency(booking.calculatedCommissionAmount)})
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBookingId(booking.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-bold text-xs"
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
      </div>

      {/* Deep Inspection Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-zinc-400">Booking {selectedBooking.id}</span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedService?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBookingId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <StatusBadge status={selectedBooking.status} />
              {selectedBooking.status === "offer_pending" && selectedBooking.activeOfferExpiresAt && (
                <CountdownTimer expiresAt={selectedBooking.activeOfferExpiresAt} />
              )}
            </div>

            {/* Financial Snapshot Summary */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
              <div className="font-bold text-purple-900 dark:text-purple-200">
                Locked Commission & Ledger Snapshot
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div>
                  <div className="text-zinc-500">Service Fee</div>
                  <div className="font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(selectedBooking.servicePriceSnapshot)}
                  </div>
                </div>
                <div>
                  <div className="text-purple-700 font-bold">Locked Margin</div>
                  <div className="font-black text-purple-900 dark:text-purple-200">
                    {selectedBooking.lockedCommissionPercentage}% ({formatCurrency(selectedBooking.calculatedCommissionAmount)})
                  </div>
                </div>
                <div>
                  <div className="text-teal-700 font-bold">Nurse Payable</div>
                  <div className="font-black text-teal-600 dark:text-teal-400">
                    {formatCurrency(selectedBooking.calculatedNursePayable)}
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Reassignment Section */}
            <form onSubmit={handleReassign} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-3">
              <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                Administrative Manual Reassignment
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500">Target Registered Nurse</label>
                <select
                  value={reassignNurseId}
                  onChange={(e) => setReassignNurseId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-600 text-xs bg-white dark:bg-zinc-900 outline-hidden"
                >
                  <option value="">Select nurse...</option>
                  {nurseProfiles.map((np) => {
                    const u = users.find((usr) => usr.id === np.userId);
                    return (
                      <option key={np.id} value={np.id}>
                        {u?.fullName} ({np.licenseNumber}) • {np.ratingAverage}★
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-500">Reassignment Rationale</label>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Prior nurse vehicle breakdown; patient urgent surgical dressing"
                  className="w-full p-2 rounded-xl border border-zinc-300 dark:border-zinc-600 text-xs bg-white dark:bg-zinc-900 outline-hidden"
                />
              </div>

              {reassignSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px]">
                  {reassignSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={!reassignNurseId}
                className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
              >
                Reassign & Force Confirm Visit
              </button>
            </form>

            {/* Timeline */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                Audit & Event Trail
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.map((e) => (
                  <div key={e.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {e.actorName} ({e.actorRole})
                      </span>
                      <span>{formatDateTime(e.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
