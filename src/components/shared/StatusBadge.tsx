import React from "react";
import { BookingStatus, OfferStatus, PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: BookingStatus | OfferStatus | PaymentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getBadgeConfig = (s: string) => {
    switch (s) {
      case "offer_pending":
      case "pending":
        return {
          label: "Offer Pending (15m)",
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
          dot: "bg-amber-500 animate-pulse",
        };
      case "reselection_required":
        return {
          label: "Nurse Reselection Needed",
          bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
          dot: "bg-orange-500 animate-bounce",
        };
      case "confirmed":
      case "accepted":
        return {
          label: "Confirmed",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500",
        };
      case "nurse_arrived":
        return {
          label: "Nurse Arrived",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
          dot: "bg-indigo-500 animate-pulse",
        };
      case "in_progress":
        return {
          label: "Care In Progress",
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
          dot: "bg-blue-500 animate-ping",
        };
      case "completed":
        return {
          label: "Care Completed",
          bg: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
          dot: "bg-teal-500",
        };
      case "payment_pending":
        return {
          label: "Payment Verification Pending",
          bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
          dot: "bg-purple-500",
        };
      case "closed":
      case "received":
        return {
          label: "Reconciled & Closed",
          bg: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
          dot: "bg-zinc-400",
        };
      case "cancelled_by_patient":
        return {
          label: "Cancelled by Patient",
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
        };
      case "cancelled_by_nurse":
        return {
          label: "Cancelled by Nurse",
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
        };
      case "expired":
        return {
          label: "Offer Expired",
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          dot: "bg-rose-400",
        };
      case "rejected":
        return {
          label: "Nurse Declined",
          bg: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
          dot: "bg-zinc-400",
        };
      case "admin_intervention":
      case "disputed":
        return {
          label: "Admin Intervention Required",
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
          dot: "bg-red-600 animate-pulse",
        };
      default:
        return {
          label: s.replace(/_/g, " ").toUpperCase(),
          bg: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
          dot: "bg-zinc-400",
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors",
        config.bg,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
