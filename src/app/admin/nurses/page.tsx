"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { NurseProfile, QualificationStatus } from "@/types";
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
} from "lucide-react";

export default function AdminNursesPage() {
  const {
    nurseProfiles,
    users,
    services,
    nurseQualifications,
    invitations,
    adminVerifyNurse,
    adminToggleNurseQualification,
    adminInviteNurse,
  } = useCareoon();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedNurseForPrivileges, setSelectedNurseForPrivileges] = useState<NurseProfile | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteLicense, setInviteLicense] = useState("");
  const [inviteAreas, setInviteAreas] = useState("10001, 10002, 10003");
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const areas = inviteAreas.split(",").map((s) => s.trim()).filter(Boolean);
    const res = adminInviteNurse(inviteName, inviteEmail, invitePhone, inviteLicense, areas);
    if (res.success && res.invitation) {
      setInviteResult(res.invitation);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/nurse/activate?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Nurse Credentials & Clinical Privileges
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Invite licensed RNs via one-time tokens, verify state registries, and assign procedure qualifications.
          </p>
        </div>

        <button
          onClick={() => {
            setInviteResult(null);
            setIsInviteModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Invite Registered Nurse
        </button>
      </div>

      {/* Nurses Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nurseProfiles.map((nurse) => {
          const user = users.find((u) => u.id === nurse.userId);
          const approvedCount = nurseQualifications.filter(
            (q) => q.nurseId === nurse.id && q.isApproved
          ).length;

          return (
            <div
              key={nurse.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {user?.fullName || "Nurse"}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400">
                      License: {nurse.licenseNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      nurse.qualificationStatus === "verified"
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {nurse.qualificationStatus.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-400">Visits</div>
                    <div className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {nurse.completedBookingsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400">Rating</div>
                    <div className="font-extrabold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {nurse.ratingAverage.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400">Privileges</div>
                    <div className="font-extrabold text-purple-600">
                      {approvedCount}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500">
                  <span className="font-semibold">Coverage:</span> Zip {nurse.serviceAreas.join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() =>
                    adminVerifyNurse(
                      nurse.id,
                      nurse.qualificationStatus === "verified" ? "unverified" : "verified"
                    )
                  }
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-semibold underline text-[11px]"
                >
                  {nurse.qualificationStatus === "verified" ? "Revoke Verification" : "Mark Verified"}
                </button>

                <button
                  onClick={() => setSelectedNurseForPrivileges(nurse)}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 font-bold text-[11px] transition-colors"
                >
                  Manage Privileges ({approvedCount})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privileges Modal */}
      {selectedNurseForPrivileges && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Clinical Procedure Privileges
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select which services this nurse is certified and approved to perform.
                </p>
              </div>
              <button
                onClick={() => setSelectedNurseForPrivileges(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {services.map((service) => {
                const isApproved = nurseQualifications.some(
                  (q) =>
                    q.nurseId === selectedNurseForPrivileges.id &&
                    q.serviceId === service.id &&
                    q.isApproved
                );

                return (
                  <label
                    key={service.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {service.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Duration: {service.durationMinutes}m • Base: ${service.basePrice}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) =>
                        adminToggleNurseQualification(
                          selectedNurseForPrivileges.id,
                          service.id,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedNurseForPrivileges(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Done & Save Privileges
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Invite Registered Nurse (No Shared Passwords)
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Invitation Dispatched
                  </div>
                  <p className="text-[11px]">
                    A secure 72-hour one-time activation token has been generated. The nurse will set their own private password.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">
                    Activation Link & Token
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/nurse/activate?token=${inviteResult.token}`}
                      className="w-full px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 border outline-hidden"
                    />
                    <button
                      onClick={() => copyInviteLink(inviteResult.token)}
                      className="px-3 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedToken ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Full Nurse Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Rebecca Taylor, RN"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="rebecca.nurse@careoon.health"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+1 (555) 902-1234"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    State Nursing License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteLicense}
                    onChange={(e) => setInviteLicense(e.target.value)}
                    placeholder="RN-NY-102948"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Covered Postal Codes
                  </label>
                  <input
                    type="text"
                    value={inviteAreas}
                    onChange={(e) => setInviteAreas(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                  >
                    Generate Invite Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
