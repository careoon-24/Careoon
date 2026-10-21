"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { CalendarCheck, MapPin, CheckCircle2, ShieldCheck, Power } from "lucide-react";

const SANGLI_COVERAGE_ZONES = [
  { code: "416416", name: "Sangli City (Vishrambag, Kupwad Road, Gaon Bhag)" },
  { code: "416410", name: "Miraj City (Civil Hospital, Station Road, Wanless Hospital)" },
  { code: "416415", name: "Madhavnagar & Sangli Industrial Belt" },
  { code: "416436", name: "Budhgaon & Sangli North Extended" },
];

export default function NurseAvailabilityPage() {
  const { getCurrentNurseProfile, nurseToggleAvailability, nurseUpdateServiceAreas } = useCareoon();

  const profile = getCurrentNurseProfile();

  const [saved, setSaved] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(profile?.isAvailable ?? true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(profile?.serviceAreas || ["416416", "416410"]);

  const handleToggleOnline = () => {
    if (!profile) return;
    const next = !isOnline;
    setIsOnline(next);
    nurseToggleAvailability(profile.id, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleArea = (code: string) => {
    if (!profile) return;
    let next: string[];
    if (selectedAreas.includes(code)) {
      next = selectedAreas.filter((a) => a !== code);
    } else {
      next = [...selectedAreas, code];
    }
    setSelectedAreas(next);
    nurseUpdateServiceAreas(profile.id, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">
          Availability & Sangli Coverage
        </h1>
        <p className="text-xs text-slate-500">
          Control your booking offer intake and active Sangli - Miraj operational coverage zones.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>तुमची उपलब्धता आणि कव्हरेज क्षेत्र यशस्वीरित्या अपडेट केले गेले.</span>
        </div>
      )}

      {/* Online Status Toggle */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Power className={`w-4 h-4 ${isOnline ? "text-emerald-500" : "text-slate-400"}`} />
            डिस्पॅच स्टेटस: {isOnline ? "उपलब्ध (Online & Ready)" : "अनुपलब्ध (Offline)"}
          </div>
          <p className="text-[11px] text-slate-500 max-w-sm">
            {isOnline
              ? "तुम्हाला तुमच्या अधिकृत उपचार पद्धतींसाठी 15-मिनिटांच्या बुकिंग ऑफर्स प्राप्त होतील."
              : "ऑफलाईन असताना तुम्हाला कोणत्याही नवीन भेटीच्या ऑफर्स पाठवल्या जाणार नाहीत."}
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isOnline
              ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {isOnline ? "ऑफलाईन व्हा (Go Offline)" : "ऑनलाईन व्हा (Go Online)"}
        </button>
      </div>

      {/* Service Coverage Areas */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3.5 shadow-xs">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            सांगली - मिरज पिनकोड कव्हरेज (Postal Coverage)
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            केवळ या निवडलेल्या पिनकोड क्षेत्रातील रुग्णांच्या भेटीच्या ऑफर्स तुम्हाला पाठवल्या जातील.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {SANGLI_COVERAGE_ZONES.map((zone) => {
            const isChecked = selectedAreas.includes(zone.code);

            return (
              <label
                key={zone.code}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                  isChecked
                    ? "bg-teal-50/70 border-teal-500 text-teal-950 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 text-[11px]">
                      {zone.code}
                    </span>
                    <span>{zone.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Sangli District, Maharashtra</div>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleArea(zone.code)}
                  className="w-4 h-4 rounded-md text-teal-600 focus:ring-teal-500 border-slate-300"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
