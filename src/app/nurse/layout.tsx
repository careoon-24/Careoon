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
      label: "Earnings & Payouts",
      href: "/nurse/earnings",
      icon: DollarSign,
    },
    {
      label: "My Availability",
      href: "/nurse/availability",
      icon: CalendarCheck,
    },
    {
      label: "Nurse Profile",
      href: "/nurse/profile",
      icon: UserCheck,
    },
  ];

  return (
    <div className="flex-1 flex flex-col w-full max-w-md md:max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-x border-zinc-200/80 dark:border-zinc-800 shadow-sm min-h-screen pb-20 md:pb-10 transition-all">
      {/* Nurse Mobile / Desktop Top Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-teal-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            RN
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400">
              Nurse Clinical Operations
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>{currentUser?.fullName || "Registered Nurse Portal"}</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </h2>
          </div>
        </div>

        {/* Desktop Web Tabs */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {nurseProfile && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{nurseProfile.isAvailable ? "Online & Ready" : "Offline"}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6">{children}</div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-bold"
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
