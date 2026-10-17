"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarCheck, HelpCircle, User } from "lucide-react";
import { useCareoon } from "@/context/CareoonContext";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { bookings } = useCareoon();

  const activeBookingsCount = bookings.filter((b) =>
    ["offer_pending", "reselection_required", "confirmed", "nurse_arrived", "in_progress"].includes(b.status)
  ).length;

  const navItems = [
    {
      label: "Services",
      href: "/patient",
      icon: LayoutGrid,
      exact: true,
    },
    {
      label: "Bookings",
      href: "/patient/bookings",
      icon: CalendarCheck,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    {
      label: "Support",
      href: "/patient/support",
      icon: HelpCircle,
    },
    {
      label: "Profile",
      href: "/patient/profile",
      icon: User,
    },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white dark:bg-zinc-900 border-x border-zinc-200 dark:border-zinc-800 shadow-sm min-h-screen pb-18">
      {/* Patient Mobile Top Bar */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            Patient Portal
          </span>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Careoon Home Health
          </h2>
        </div>
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
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
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
