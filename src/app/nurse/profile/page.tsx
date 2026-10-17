"use client";

import React from "react";
import { useCareoon } from "@/context/CareoonContext";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
  Award,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function NurseProfilePage() {
  const { getCurrentNurseProfile, currentUser, nurseQualifications, services } = useCareoon();

  const profile = getCurrentNurseProfile();

  // Qualifications approved for this nurse
  const approvedQualifications = nurseQualifications.filter(
    (q) => profile && q.nurseId === profile.id && q.isApproved
  );

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Clinical Credentials
        </h1>
        <p className="text-xs text-zinc-500">
          Professional nurse registration, performance, and approved service privileges.
        </p>
      </div>

      {/* Verification Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
              State Board Registry
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              {currentUser?.fullName}
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </h2>
            <div className="text-xs font-mono text-zinc-500">
              License #: {profile?.licenseNumber || "RN-NY-849201"}
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Admin Verified
          </span>
        </div>

        {profile?.bio && (
          <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <div className="text-[10px] text-zinc-400">Total Visits</div>
            <div className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
              {profile?.completedBookingsCount}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <div className="text-[10px] text-zinc-400">Rating</div>
            <div className="font-extrabold text-sm text-amber-500 flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400" />
              {profile?.ratingAverage.toFixed(1)}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <div className="text-[10px] text-zinc-400">Cancels</div>
            <div className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">
              {profile?.cancellationCount}
            </div>
          </div>
        </div>
      </div>

      {/* Approved Clinical Procedures (Read-Only) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            Approved Clinical Procedures ({approvedQualifications.length})
          </h2>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3 text-zinc-400" />
            Admin Controlled
          </span>
        </div>

        <p className="text-[11px] text-zinc-500">
          Privileges granted by supervisory nurse administrators based on submitted clinical certificates.
        </p>

        <div className="space-y-1.5 pt-1">
          {approvedQualifications.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No approved procedures assigned yet.</p>
          ) : (
            approvedQualifications.map((q) => {
              const srv = services.find((s) => s.id === q.serviceId);
              return (
                <div
                  key={q.id}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {srv?.name || "Clinical Service"}
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Authorized
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 space-y-1">
        <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
          <Lock className="w-3 h-3 text-zinc-500" />
          Financial & Credential Integrity Notice
        </div>
        <p>
          In accordance with medical platform compliance rules, commission rates, financial receipts, payout releases, and qualification statuses are managed exclusively through authorized administrative audits.
        </p>
      </div>
    </div>
  );
}
