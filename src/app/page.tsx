"use client";

import React from "react";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import {
  UserCheck,
  Stethoscope,
  Shield,
  ArrowRight,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { switchUserRole, offers, bookings } = useCareoon();

  const pendingOffersCount = offers.filter((o) => o.status === "pending").length;
  const reselectionCount = bookings.filter((b) => b.status === "reselection_required").length;

  return (
    <div className="flex-1 flex flex-col justify-between py-6 px-4 max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center space-y-3 pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Mobile-First Home Nursing Marketplace MVP
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Certified Clinical Home Care, <br className="hidden sm:inline" />
          <span className="text-teal-600 dark:text-teal-400">Directly at Your Doorstep</span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          A working marketplace connecting verified registered nurses with patients. Built with a server-enforced 15-minute response deadline, immutable commission snapshots, and decoupled financial reconciliation.
        </p>
      </div>

      {/* Operational Highlights Banner */}
      {(pendingOffersCount > 0 || reselectionCount > 0) && (
        <div className="my-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Live State Machine Activity:</span>{" "}
              {pendingOffersCount} active 15-minute nurse offers in progress.{" "}
              {reselectionCount > 0 && `${reselectionCount} bookings awaiting nurse reselection.`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/nurse"
              className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
            >
              Go to Nurse View
            </Link>
            <Link
              href="/patient/bookings"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-100 transition-colors"
            >
              Go to Patient Tracker
            </Link>
          </div>
        </div>
      )}

      {/* Three Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        {/* 1. Patient Portal */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1. Patient Portal</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Browse procedures, compare qualified nurses, submit bookings, and track care status.
              </p>
            </div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                Browse active services & eligibility
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                Nurse comparison (ratings, badges)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                15-min countdown & reselection
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                Verified completion review
              </li>
            </ul>
          </div>

          <div className="pt-6 space-y-2">
            <Link
              href="/patient"
              onClick={() => switchUserRole("patient")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Patient Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[10px] text-center text-zinc-400">
              Auto-switches active persona to Eleanor Vance
            </p>
          </div>
        </div>

        {/* 2. Nurse Portal */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">2. Nurse Portal</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Receive incoming booking offers, accept/reject, log arrival, and view earnings.
              </p>
            </div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                15-min offer countdown action
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Sequential status: Arrived $\rightarrow$ Done
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Net payable & payout history
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Service area & availability toggle
              </li>
            </ul>
          </div>

          <div className="pt-6 space-y-2">
            <Link
              href="/nurse"
              onClick={() => switchUserRole("nurse")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Nurse Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[10px] text-center text-zinc-400">
              Auto-switches active persona to Maya Patel, RN
            </p>
          </div>
        </div>

        {/* 3. Admin Portal */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">3. Admin Portal</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Configure services with commission %, verify nurses, record payments, and manage payouts.
              </p>
            </div>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Set commission % per service
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Invite & verify nurse credentials
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Manual payment & reconciliation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Weekly payout batching & audit logs
              </li>
            </ul>
          </div>

          <div className="pt-6 space-y-2">
            <Link
              href="/admin"
              onClick={() => switchUserRole("admin")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Admin Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[10px] text-center text-zinc-400">
              Auto-switches active persona to Sarah Jenkins, RN Admin
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white">15-Min Response Engine</div>
            <div>Server countdown; on expiration or rejection, patient reselects without re-entering data.</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60">
          <DollarSign className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white">Commission Locking</div>
            <div>Commission % configured per service and snapshotted at confirmation for immutable history.</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60">
          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white">Decoupled Payment Audit</div>
            <div>Service completion does not auto-mark payment received. Full manual verification & batching.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
