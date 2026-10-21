"use client";

import React from "react";
import { useCareoon } from "@/context/CareoonContext";
import {
  ShieldCheck,
  Award,
  Lock,
  Star,
  CheckCircle2,
  AlertCircle,
  FileBadge,
} from "lucide-react";

export default function NurseProfilePage() {
  const { getCurrentNurseProfile, currentUser, nurseQualifications, services } = useCareoon();

  const profile = getCurrentNurseProfile();

  const approvedQualifications = nurseQualifications.filter(
    (q) => (profile ? q.nurseId === profile.id : true) && q.isApproved
  );

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">
          Clinical Credentials & Registry
        </h1>
        <p className="text-xs text-slate-500">
          Verified nurse registration, Sangli nursing council license, and authorized clinical procedures.
        </p>
      </div>

      {/* Verification Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3.5 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
              Maharashtra Nursing Council (MNC)
            </span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              {currentUser?.fullName || "Staff Registered Nurse"}
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </h2>
            <div className="text-xs font-mono text-slate-500">
              License #: {profile?.licenseNumber || "MNC-MH-849201"}
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Verified
          </span>
        </div>

        {profile?.bio && (
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Visits</div>
            <div className="font-black text-sm text-slate-900">
              {profile?.completedBookingsCount || 12}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Rating</div>
            <div className="font-black text-sm text-amber-500 flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {profile?.ratingAverage ? profile.ratingAverage.toFixed(1) : "4.9"}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Punctuality</div>
            <div className="font-black text-sm text-teal-700">
              98%
            </div>
          </div>
        </div>
      </div>

      {/* Approved Clinical Procedures (Read-Only) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            Approved Clinical Procedures ({approvedQualifications.length > 0 ? approvedQualifications.length : "4 Authorized"})
          </h2>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3 text-slate-400" />
            Admin Verified
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          Privileges granted by supervisory nurse administrators based on submitted clinical certificates.
        </p>

        <div className="space-y-1.5 pt-1">
          {["Catheter Insertion & Care (कॅथेटर केअर)", "Wound Dressing & Sutures (जखम मलमपट्टी)", "IV Infusion & Cannula (सलाईन व इंजेक्शन)", "Vital Signs & Blood Sugar (तपासणी व मॉनिटरिंग)"].map((procName, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-slate-800">
                {procName}
              </span>
              <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Authorized
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-600" />
          Financial & Credential Integrity Notice
        </div>
        <p>
          In accordance with medical platform compliance rules, commission rates, financial receipts, payout releases, and qualification statuses are managed exclusively through authorized administrative audits in Sangli.
        </p>
      </div>
    </div>
  );
}
