"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCareoon } from "@/context/CareoonContext";
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

function NurseActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const { invitations, claimNurseInvitation } = useCareoon();

  const [token, setToken] = useState<string>(tokenFromUrl);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const matchedInvite = invitations.find((i) => i.token === token && !i.isClaimed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Please provide an invitation token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const res = claimNurseInvitation(token, fullName, phone);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/nurse");
      }, 1500);
    } else {
      setError(res.error || "Failed to activate account.");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-8 px-4 space-y-4">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Activate Nurse Account
        </h1>
        <p className="text-xs text-zinc-500">
          Enter your secure invitation credentials and set your private password.
        </p>
      </div>

      {success ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Account Activated!</h2>
          <p className="text-xs text-zinc-500">Redirecting to your nurse dashboard...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              One-Time Invitation Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. tok_..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono outline-hidden"
            />
          </div>

          {matchedInvite && (
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-300">
              Verified Invitation for: <strong>{matchedInvite.fullName}</strong> ({matchedInvite.email})
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Confirm Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Marcus Vance, RN"
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Phone Number
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Set Private Password (Never shared)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Activate Account & Log In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function NurseActivationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading activation...</div>}>
      <NurseActivationContent />
    </Suspense>
  );
}
