"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, DollarSign, CalendarCheck, UserCheck, ShieldCheck } from "lucide-react";
import { useCareoon } from "@/context/CareoonContext";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { offers, getCurrentNurseProfile, currentUser } = useCareoon();

  const nurseProfile = getCurrentNurseProfile();

  // Pending offers for this specific nurse
  const pendingOffersCount = offers.filter(
    (o) => o.status === "pending" && (nurseProfile ? o.nurseId === nurseProfile.id : true)
  ).length;

  const navItems = [
    {
      label: "Jobs & Offers",
      href: "/nurse",
      icon: Stethoscope,
      badge: pendingOffersCount > 0 ? pendingOffersCount : undefined,
      exact: true,
    },
    {
      label: "Earnings",
      href: "/nurse/earnings",
      icon: DollarSign,
    },
    {
      label: "Availability",
      href: "/nurse/availability",
      icon: CalendarCheck,
    },
    {
      label: "Profile",
      href: "/nurse/profile",
      icon: UserCheck,
    },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white dark:bg-zinc-900 border-x border-zinc-200 dark:border-zinc-800 shadow-sm min-h-screen pb-18">
      {/* Nurse Mobile Top Bar */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-teal-50/40 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
            RN
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400">
              Nurse Clinical Portal
            </span>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              {currentUser?.fullName || "Nurse Maya Patel"}
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            </h2>
          </div>
        </div>

        {nurseProfile && (
          <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {nurseProfile.isAvailable ? "Online" : "Offline"}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4">{children}</div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
