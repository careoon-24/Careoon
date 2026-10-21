"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, DollarSign, CalendarCheck, UserCheck, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on nurse login or activate page, render clean children without nurse dashboard wrapper
  if (pathname === '/nurse/login' || pathname === '/nurse/activate') {
    return <>{children}</>;
  }

  const [pendingOffersCount, setPendingOffersCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (data.success && data.bookings && isMounted) {
          let count = 0;
          data.bookings.forEach((b: any) => {
            if (b.offers && Array.isArray(b.offers)) {
              b.offers.forEach((o: any) => {
                if (o.status === "PENDING" && new Date(o.expiresAt) > new Date()) {
                  count++;
                }
              });
            }
          });
          setPendingOffersCount(count);
        }
      } catch (err) {
        // silent fallback
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    <div className="flex-1 flex flex-col w-full max-w-md md:max-w-5xl mx-auto bg-white border-x border-slate-200/80 shadow-xs min-h-screen pb-20 md:pb-10 transition-all">
      {/* Nurse Mobile / Desktop Top Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-teal-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            RN
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700">
              Nurse Clinical Operations
            </span>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Sangli Nurse Portal</span>
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
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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

        <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online & Ready</span>
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
