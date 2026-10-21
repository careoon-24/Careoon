"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HeartPulse, User, LogOut, LogIn, Shield, Stethoscope } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: "PATIENT" | "NURSE" | "ADMIN";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Do not render patient header on admin, nurse, or login routes
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/nurse") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  // Re-check authentication on route change
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-slate-900 block leading-none">
              Careoon
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
              Sangli - Miraj Nursing
            </span>
          </div>
        </Link>

        {/* Desktop Web Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-teal-600 transition">
            Home Care
          </Link>
          <Link href="/patient" className="hover:text-teal-600 transition">
            Clinical Procedures
          </Link>
          <Link href="/patient/support" className="hover:text-teal-600 transition">
            24/7 Helpline
          </Link>
        </nav>

        {/* User Status / Navigation */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/patient/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span className="max-w-[120px] truncate">{user.fullName || "My Profile"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
