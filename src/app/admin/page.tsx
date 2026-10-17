"use client";

import React from "react";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  Clock,
  RotateCcw,
  DollarSign,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AdminOverviewPage() {
  const {
    offers,
    bookings,
    services,
    nurseProfiles,
    payments,
    nursePayables,
    tickets,
  } = useCareoon();

  // 1. Pending 15-Minute Offers
  const pendingOffers = offers.filter((o) => o.status === "pending");

  // 2. Bookings Requiring Reselection or Admin Intervention
  const attentionBookings = bookings.filter((b) =>
    ["reselection_required", "admin_intervention", "disputed"].includes(b.status)
  );

  // 3. Financial Metrics
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter((b) => ["completed", "closed"].includes(b.status));
  const totalVolume = completedBookings.reduce((sum, b) => sum + b.servicePriceSnapshot, 0);
  const totalPlatformCommission = completedBookings.reduce(
    (sum, b) => sum + (b.calculatedCommissionAmount || (b.servicePriceSnapshot * b.lockedCommissionPercentage) / 100),
    0
  );

  const activeNursesCount = nurseProfiles.filter((n) => n.qualificationStatus === "verified" && n.isAvailable).length;
  const openTicketsCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Operational Command & Alert Center
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Real-time monitor for 15-minute response deadlines, unassigned visits, commission accruals, and clinical exceptions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Completed Care</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {completedBookings.length}
            <span className="text-xs font-normal text-zinc-400 ml-1.5">/ {totalBookingsCount}</span>
          </div>
          <div className="text-[10px] text-zinc-500">Total Visits Booked</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Gross Volume</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-[10px] text-zinc-500">Delivered Patient Care</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center justify-between">
            <span>Careoon Commission</span>
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950 dark:text-purple-100">
            {formatCurrency(totalPlatformCommission)}
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
            Locked Service Snapshots
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Active Nurses</span>
            <Users className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {activeNursesCount}
            <span className="text-xs font-normal text-zinc-400 ml-1">online</span>
          </div>
          <div className="text-[10px] text-zinc-500">{nurseProfiles.length} Total Registered</div>
        </div>
      </div>

      {/* Operational Priority 1: Pending 15-Minute Offers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            Active 15-Minute Response Watch ({pendingOffers.length})
          </h2>
          <span className="text-[11px] text-zinc-400">Auto-expires if timer hits 0</span>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
            No active 15-minute response offers in flight right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOffers.map((offer) => {
              const booking = bookings.find((b) => b.id === offer.bookingId);
              const service = services.find((s) => s.id === booking?.serviceId);

              return (
                <div
                  key={offer.id}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {service?.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Booking #{booking?.id.slice(-6)} • Offered to Nurse #{offer.nurseId.slice(-6)}
                      </div>
                    </div>
                    <CountdownTimer expiresAt={offer.expiresAt} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                    <span>Postal Area: {booking?.serviceAddress.postalCode}</span>
                    <span>Fee: {formatCurrency(booking?.servicePriceSnapshot || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Operational Priority 2: Reselection & Intervention Required */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Visits Requiring Operational Attention ({attentionBookings.length})
          </h2>
          <Link
            href="/admin/bookings"
            className="text-xs text-purple-600 font-semibold hover:underline"
          >
            Manage All Bookings &rarr;
          </Link>
        </div>

        {attentionBookings.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
            Zero booking exceptions. All visits are confirmed or completed.
          </div>
        ) : (
          <div className="space-y-2">
            {attentionBookings.map((b) => {
              const service = services.find((s) => s.id === b.serviceId);

              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {service?.name}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Scheduled: {formatDate(b.scheduledDate)} ({b.scheduledTimeSlot}) in Zip {b.serviceAddress.postalCode}
                    </div>
                  </div>

                  <Link
                    href={`/admin/bookings?focus=${b.id}`}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>Inspect & Reassign</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Ops Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <Link
          href="/admin/services"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 transition-colors space-y-1 block shadow-xs"
        >
          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
            <span>Configure Services & Rates</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-[11px] text-zinc-500">
            Edit service catalog and set commission % per clinical procedure.
          </p>
        </Link>

        <Link
          href="/admin/finance"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 transition-colors space-y-1 block shadow-xs"
        >
          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
            <span>Record Payments & Payouts</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-zinc-500">
            Log patient manual payments, reconcile receipts, and batch weekly nurse payouts.
          </p>
        </Link>

        <Link
          href="/admin/nurses"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 transition-colors space-y-1 block shadow-xs"
        >
          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
            <span>Nurse Credentials & Invites</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-[11px] text-zinc-500">
            Generate one-time invite tokens and verify state board licenses.
          </p>
        </Link>
      </div>
    </div>
  );
}
