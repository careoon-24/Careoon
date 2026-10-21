"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarCheck, HelpCircle, User, ShieldCheck } from "lucide-react";
import { useCareoon } from "@/context/CareoonContext";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { bookings } = useCareoon();

  const activeBookingsCount = bookings.filter((b) =>
    ["offer_pending", "reselection_required", "confirmed", "nurse_arrived", "in_progress"].includes(b.status)
  ).length;

  const navItems = [
    {
      label: "Clinical Procedures",
      href: "/patient",
      icon: LayoutGrid,
      exact: true,
    },
    {
      label: "My Bookings",
      href: "/patient/bookings",
      icon: CalendarCheck,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    {
      label: "Helpline & Support",
      href: "/patient/support",
      icon: HelpCircle,
    },
    {
      label: "Patient Profile",
      href: "/patient/profile",
      icon: User,
    },
  ];

  return (
    <div className="flex-1 flex flex-col w-full max-w-md md:max-w-5xl mx-auto bg-white border-x border-slate-200/80 shadow-xs min-h-screen pb-20 md:pb-10 transition-all">
      {/* Patient Portal Header (Responsive: Simple on mobile, full tabs on desktop) */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Patient Portal
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            Careoon Home Health Services
          </h2>
        </div>

        {/* Desktop Web Horizontal Tab Links */}
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
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6">{children}</div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-teal-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] flex items-center justify-center font-bold">
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
