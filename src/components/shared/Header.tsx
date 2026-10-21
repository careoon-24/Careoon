"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HeartPulse, User, LogOut, LogIn } from "lucide-react";

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
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white block leading-none">
              Careoon
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Verified Home Nursing
            </span>
          </div>
        </Link>

        {/* Desktop Web Navigation Links (Hidden on small mobile screens) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-600 dark:text-zinc-300">
          <Link href="/" className="hover:text-teal-600 transition">
            Home Care
          </Link>
          <Link href="/patient" className="hover:text-teal-600 transition">
            Clinical Procedures
          </Link>
          <Link href="/#why" className="hover:text-teal-600 transition">
            Why Careoon
          </Link>
          <Link href="/patient/support" className="hover:text-teal-600 transition">
            24/7 Helpline
          </Link>
        </nav>

        {/* User Status / Clean Account Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
