"use client";

import React, { useState, useEffect } from "react";
import { verifyNurseAction } from "@/actions/nurses";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Star,
  Award,
  CheckCircle2,
  XCircle,
  Copy,
  Link as LinkIcon,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminNursesPage() {
  const [nurses, setNurses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadNurses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nurses?all=true");
      const data = await res.json();
      if (data.success && data.nurses) {
        setNurses(data.nurses);
      }
    } catch (err) {
      console.error("Failed to load nurses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNurses();
  }, []);

  const handleVerify = async (nurseProfileId: string) => {
    setVerifyingId(nurseProfileId);
    try {
      await verifyNurseAction(nurseProfileId);
      await loadNurses();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const copyActivationLink = () => {
    const link = `${window.location.origin}/nurse/activate`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const verifiedNurses = nurses.filter((n) => n.adminApprovalStatus === "VERIFIED");
  const pendingNurses = nurses.filter((n) => n.adminApprovalStatus !== "VERIFIED");

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Verified Nurse Network & Licensing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200">
              Live Neon DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit nursing council registrations, police verifications, and approve clinical healthcare providers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyActivationLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            <LinkIcon className="w-4 h-4 text-teal-600" />
            <span>{copiedLink ? "Link Copied!" : "Copy Nurse Invite Link"}</span>
          </button>

          <button
            onClick={loadNurses}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Applicants
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {nurses.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
              Verified & Active
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
              {verifiedNurses.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
              Pending Verification
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
              {pendingNurses.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingNurses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Action Required: Pending Medical Licenses ({pendingNurses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingNurses.map((nurse) => (
              <div
                key={nurse.id}
                className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {nurse.user?.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500">{nurse.user?.email} • {nurse.user?.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Pending
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-amber-100 text-xs space-y-1">
                    <div className="text-[11px] text-slate-500 font-semibold">
                      MNC / Registration No: <strong className="text-slate-900 dark:text-white font-mono">{nurse.registrationNumber}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Experience: <strong className="text-slate-900 dark:text-white">{nurse.experienceYears} Years</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Qualifications: <strong className="text-slate-900 dark:text-white">{nurse.qualifications}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleVerify(nurse.id)}
                  disabled={verifyingId === nurse.id}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifyingId === nurse.id ? "Verifying..." : "Approve & Verify License"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Nurses Directory */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Verified Clinical Providers ({verifiedNurses.length})
        </h2>

        {verifiedNurses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
              Zero Verified Nurses in Database
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your database has 0 verified nurses. Share the private invitation link with certified nurses to start onboarding.
            </p>
            <div className="pt-2">
              <button
                onClick={copyActivationLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Private Onboarding Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedNurses.map((nurse) => (
              <div
                key={nurse.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {nurse.user?.fullName}
                        <ShieldCheck className="w-4 h-4 text-teal-500" />
                      </h4>
                      <p className="text-[11px] text-slate-400">{nurse.user?.email} • {nurse.user?.phone}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-xs space-y-1">
                    <div className="text-[11px] text-slate-500">
                      License: <strong className="text-slate-900 dark:text-white font-mono">{nurse.registrationNumber}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Experience: <strong className="text-slate-900 dark:text-white">{nurse.experienceYears} Years</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Qualifications: <strong className="text-slate-900 dark:text-white">{nurse.qualifications}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Rating Average</span>
                  <span className="font-black text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {nurse.ratingAverage ? Number(nurse.ratingAverage).toFixed(1) : "5.0"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
