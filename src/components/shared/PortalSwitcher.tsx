"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { UserRole } from "@/types";
import { UserCheck, Stethoscope, Shield, ChevronDown, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PortalSwitcher() {
  const { currentUser, switchUserRole, users, resetAllData } = useCareoon();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case "nurse":
        return <Stethoscope className="w-3.5 h-3.5 text-teal-600" />;
      case "patient":
      default:
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="relative z-50">
      <div className="flex items-center gap-2">
        {/* Fast Switch Dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all text-zinc-800 dark:text-zinc-200"
          title="Switch Active Persona & Role"
        >
          {getRoleIcon(currentUser?.role)}
          <span className="font-semibold capitalize">{currentUser?.role || "Guest"}</span>:
          <span className="truncate max-w-[120px]">{currentUser?.fullName || "Not Logged In"}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Reset button */}
        <button
          onClick={() => {
            if (confirm("Reset demo database to fresh initial state?")) {
              resetAllData();
            }
          }}
          className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Reset to default seed data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            <div className="px-3 py-2">
              <p className="font-semibold text-zinc-900 dark:text-white">Switch Test Persona</p>
              <p className="text-zinc-500 text-[11px]">Instant role & account simulation</p>
            </div>

            <div className="p-1 space-y-0.5">
              <p className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Admin Portal
              </p>
              {users
                .filter((u) => u.role === "admin")
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUserRole("admin", user.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentUser?.id === user.id
                        ? "bg-purple-50 text-purple-900 font-semibold dark:bg-purple-950/50 dark:text-purple-200"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-[10px] text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="p-1 space-y-0.5">
              <p className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Nurse Portal
              </p>
              {users
                .filter((u) => u.role === "nurse")
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUserRole("nurse", user.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentUser?.id === user.id
                        ? "bg-teal-50 text-teal-900 font-semibold dark:bg-teal-950/50 dark:text-teal-200"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-[10px] text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="p-1 space-y-0.5">
              <p className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Patient Portal
              </p>
              {users
                .filter((u) => u.role === "patient")
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUserRole("patient", user.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentUser?.id === user.id
                        ? "bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/50 dark:text-blue-200"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-[10px] text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="p-2 bg-zinc-50 dark:bg-zinc-950/50 space-y-1">
              <p className="text-[10px] text-zinc-400 font-semibold px-1">PORTAL NAVIGATION</p>
              <div className="grid grid-cols-3 gap-1">
                <Link
                  href="/patient"
                  onClick={() => setIsOpen(false)}
                  className={`text-center py-1 rounded text-[11px] font-medium transition-colors ${
                    pathname.startsWith("/patient")
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Patient
                </Link>
                <Link
                  href="/nurse"
                  onClick={() => setIsOpen(false)}
                  className={`text-center py-1 rounded text-[11px] font-medium transition-colors ${
                    pathname.startsWith("/nurse")
                      ? "bg-teal-600 text-white"
                      : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Nurse
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`text-center py-1 rounded text-[11px] font-medium transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
