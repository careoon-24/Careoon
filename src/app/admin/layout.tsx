"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Activity,
  Layers,
  Users,
  CalendarDays,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { useCareoon } from "@/context/CareoonContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { offers, bookings, payments } = useCareoon();

  const pendingOffersCount = offers.filter((o) => o.status === "pending").length;
  const reselectionCount = bookings.filter((b) => b.status === "reselection_required").length;
  const totalAlerts = pendingOffersCount + reselectionCount;

  const navLinks = [
    {
      label: "Overview & Alerts",
      href: "/admin",
      icon: Activity,
      badge: totalAlerts > 0 ? totalAlerts : undefined,
      exact: true,
    },
    {
      label: "Services & Commission",
      href: "/admin/services",
      icon: Layers,
    },
    {
      label: "Nurses & Privileges",
      href: "/admin/nurses",
      icon: Users,
    },
    {
      label: "Bookings & Ops",
      href: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      label: "Payments & Payouts",
      href: "/admin/finance",
      icon: DollarSign,
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-logs",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-4 space-y-6 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Admin Console</h2>
            <p className="text-[10px] text-slate-400 font-medium">Sangli Ops & Audit Ledger</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-900 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Top Navigation Pills */}
      <div className="md:hidden overflow-x-auto p-2 bg-white border-b border-slate-200 flex gap-1.5 scrollbar-none sticky top-14 z-20">
        {navLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
