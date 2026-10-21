"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nurseAccessLoginAction } from "@/actions/nurses";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from "lucide-react";

function NurseActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [nurseCode, setNurseCode] = useState<string>(codeFromUrl);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleNurseCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nurseCode.trim()) {
      setError("कृपया तुमचा Nurse ID टाका / Please enter your Nurse ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await nurseAccessLoginAction(nurseCode.trim());
      if (res.success && res.redirectUrl) {
        setSuccess(true);
        setTimeout(() => {
          router.push(res.redirectUrl);
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || "वैध Nurse ID आढळला नाही.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-12 px-4 space-y-5">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Nurse Dashboard Access
        </h1>
        <p className="text-xs text-slate-500">
          Sangli - Miraj Verified Healthcare Network
        </p>
      </div>

      {success ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
          <h2 className="text-base font-extrabold text-slate-900">Nurse ID Verified!</h2>
          <p className="text-xs text-slate-500">Opening your Sangli clinical dashboard...</p>
        </div>
      ) : (
        <form
          onSubmit={handleNurseCodeLogin}
          className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xl text-xs"
        >
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Enter Your Nurse ID / Access Code (Nurse ID कोड टाका) *
            </label>
            <p className="text-[11px] text-slate-400">
              Admin ने जनरेट केलेला युनिक कोड (उदा. SANGLI-RN-7401)
            </p>
            <div className="relative mt-2">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nurseCode}
                onChange={(e) => setNurseCode(e.target.value.toUpperCase())}
                placeholder="SANGLI-RN-XXXX"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-black text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? "Verifying Access ID..." : "Open Nurse Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              New nurse? Contact Admin to get your Sangli Medical verification and Access ID.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

export default function NurseActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <NurseActivationContent />
    </Suspense>
  );
}
