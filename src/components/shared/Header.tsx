"use client";

import React from "react";
import Link from "next/link";
import { PortalSwitcher } from "./PortalSwitcher";
import { HeartPulse, Bell } from "lucide-react";
import { useCareoon } from "@/context/CareoonContext";

export function Header() {
  const { currentUser, offers, bookings } = useCareoon();

  // Active pending offers for badge
  const pendingOffersCount = offers.filter((o) => o.status === "pending").length;
  const reselectionCount = bookings.filter((b) => b.status === "reselection_required").length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">
              Careoon
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              Home Nursing
            </span>
          </div>
        </Link>

        {/* Global Controls & Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Notifications indicator if pending offers or reselection */}
          {(pendingOffersCount > 0 || reselectionCount > 0) && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {pendingOffersCount > 0 ? `${pendingOffersCount} Active Offer` : `${reselectionCount} Reselection Needed`}
              </span>
            </div>
          )}

          <PortalSwitcher />
        </div>
      </div>
    </header>
  );
}
