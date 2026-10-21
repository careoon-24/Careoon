"use client";

import React, { useState, useEffect } from "react";
import { verifyNurseAction, adminAddNurseAction } from "@/actions/nurses";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Star,
  CheckCircle2,
  Copy,
  Link as LinkIcon,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  KeyRound,
  Check,
} from "lucide-react";

export default function AdminNursesPage() {
  const [nurses, setNurses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add Nurse Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [qualifications, setQualifications] = useState("B.Sc Nursing, Critical Care");
  const [experienceYears, setExperienceYears] = useState("4");
  const [password, setPassword] = useState("Nurse@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [newlyCreatedNurse, setNewlyCreatedNurse] = useState<{
    nurseName: string;
    nurseCode: string;
    tempPassword?: string;
  } | null>(null);

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
      const res = await verifyNurseAction(nurseProfileId);
      if (res.nurseCode) {
        setNewlyCreatedNurse({
          nurseName: "Nurse Verified",
          nurseCode: res.nurseCode,
        });
      }
      await loadNurses();
    } catch (err: any) {
      alert("Verification failed: " + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAddNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setIsSubmitting(true);
    try {
      const res = await adminAddNurseAction({
        fullName,
        phone,
        email,
        registrationNumber,
        qualifications,
        experienceYears: Number(experienceYears) || 1,
        password,
      });

      setNewlyCreatedNurse({
        nurseName: res.nurseName,
        nurseCode: res.nurseCode,
        tempPassword: res.tempPassword,
      });

      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setRegistrationNumber("");
      setIsAddModalOpen(false);
      await loadNurses();
    } catch (err: any) {
      setAddError(err.message || "Failed to onboard nurse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyActivationLink = () => {
    const link = `${window.location.origin}/nurse/activate`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const verifiedNurses = nurses.filter((n) => n.adminApprovalStatus === "VERIFIED");
  const pendingNurses = nurses.filter((n) => n.adminApprovalStatus !== "VERIFIED");

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Verified Nurse Network & Licensing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
              Sangli - Miraj Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Onboard, audit MNC registrations, and generate secure Nurse Access IDs for dashboard login.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Verified Nurse</span>
          </button>

          <button
            onClick={copyActivationLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            <LinkIcon className="w-4 h-4 text-teal-600" />
            <span>{copiedLink ? "Link Copied!" : "Invite Link"}</span>
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

      {/* Generated Nurse ID Banner if newly created or verified */}
      {newlyCreatedNurse && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-200 shrink-0" />
              <h3 className="font-extrabold text-sm sm:text-base">
                Nurse Verified & System ID Generated!
              </h3>
            </div>
            <p className="text-xs text-teal-100">
              {newlyCreatedNurse.nurseName} can now access her Nurse Dashboard using this ID:
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-sm sm:text-base font-black bg-teal-900/40 px-3 py-1.5 rounded-xl w-fit">
              <span>{newlyCreatedNurse.nurseCode}</span>
              {newlyCreatedNurse.tempPassword && (
                <span className="text-xs font-normal text-teal-200 pl-2 border-l border-teal-500/50">
                  Password: <strong>{newlyCreatedNurse.tempPassword}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(newlyCreatedNurse.nurseCode, "banner")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-black text-xs shadow-md transition"
            >
              {copiedCode === "banner" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>ID Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-teal-700" />
                  <span>Copy Nurse ID</span>
                </>
              )}
            </button>
            <button
              onClick={() => setNewlyCreatedNurse(null)}
              className="p-2 text-teal-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Applicants
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {nurses.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
              Verified & Active
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {verifiedNurses.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
              Pending Verification
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
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
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-900">
              Action Required: Pending Medical Licenses ({pendingNurses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingNurses.map((nurse) => (
              <div
                key={nurse.id}
                className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {nurse.user?.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500">{nurse.user?.email} • {nurse.user?.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Pending
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 border border-amber-100 text-xs space-y-1">
                    <div className="text-[11px] text-slate-500 font-semibold">
                      MNC / Registration No: <strong className="text-slate-900 font-mono">{nurse.registrationNumber}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Experience: <strong className="text-slate-900">{nurse.experienceYears} Years</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Qualifications: <strong className="text-slate-900">{nurse.qualifications}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleVerify(nurse.id)}
                  disabled={verifyingId === nurse.id}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifyingId === nurse.id ? "Generating Code & Verifying..." : "Approve & Generate Nurse ID"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Nurses Directory */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
          Verified Clinical Providers ({verifiedNurses.length})
        </h2>

        {verifiedNurses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">
              Zero Verified Nurses in Database
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Click &quot;Add Verified Nurse&quot; above to add your first registered nurse in Sangli - Miraj, or share the private onboarding link.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Verified Nurse</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedNurses.map((nurse) => {
              const code = nurse.nurseCode || "SANGLI-RN-PENDING";
              const isCopied = copiedCode === nurse.id;

              return (
                <div
                  key={nurse.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          {nurse.user?.fullName}
                          <ShieldCheck className="w-4 h-4 text-teal-500" />
                        </h4>
                        <p className="text-[11px] text-slate-400">{nurse.user?.email} • {nurse.user?.phone}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    </div>

                    {/* Nurse ID Badge with 1-Click Copy */}
                    <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-teal-600 block">
                          Access Code / Nurse ID
                        </span>
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(code, nurse.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1">
                      <div className="text-[11px] text-slate-500">
                        License: <strong className="text-slate-900 font-mono">{nurse.registrationNumber}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Experience: <strong className="text-slate-900">{nurse.experienceYears} Years</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Qualifications: <strong className="text-slate-900">{nurse.qualifications}</strong>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Add Verified Nurse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Onboard Verified Sangli Nurse
                </h3>
                <p className="text-xs text-slate-500">
                  System will generate a unique Nurse ID (e.g. SANGLI-RN-XXXX) for instant dashboard login.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddNurse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name (रुग्ण/परिचारिकेचे नाव) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Snehal Patil, RN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9822XXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="snehal@careoon.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    MNC Registration No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="MNC-2021-9482"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Qualifications & Specialty
                </label>
                <input
                  type="text"
                  required
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="B.Sc Nursing, Critical Care ICU"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Initial Password (for Nurse Login)
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nurse can change this password anytime in her profile.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition"
                >
                  {isSubmitting ? "Onboarding..." : "Generate Nurse ID & Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
