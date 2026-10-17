"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { CalendarCheck, MapPin, CheckCircle2, ShieldCheck, Power } from "lucide-react";

const AVAILABLE_ZONES = [
  { code: "10001", name: "Metro Midtown & Chelsea" },
  { code: "10002", name: "Downtown & Lower East" },
  { code: "10003", name: "East Village & Union Square" },
  { code: "10004", name: "Financial District & Battery" },
];

export default function NurseAvailabilityPage() {
  const { getCurrentNurseProfile, nurseToggleAvailability, nurseUpdateServiceAreas } = useCareoon();

  const profile = getCurrentNurseProfile();

  const [saved, setSaved] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(profile?.isAvailable ?? true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(profile?.serviceAreas || ["10001", "10002"]);

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
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Availability & Coverage
        </h1>
        <p className="text-xs text-zinc-500">
          Control your booking offer intake and active geographical coverage.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Availability preferences updated in real time.</span>
        </div>
      )}

      {/* Online Status Toggle */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Power className={`w-4 h-4 ${isOnline ? "text-emerald-500" : "text-zinc-400"}`} />
            Dispatch Status: {isOnline ? "Online & Ready" : "Offline / Unavailable"}
          </div>
          <p className="text-[11px] text-zinc-500">
            {isOnline
              ? "You will receive 15-minute booking offers for your qualified procedures."
              : "No new booking offers will be sent to your account while offline."}
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isOnline
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {isOnline ? "Turn Offline" : "Go Online"}
        </button>
      </div>

      {/* Service Coverage Areas */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Active Postal Service Areas
        </h2>
        <p className="text-[11px] text-zinc-500">
          Only patient requests matching these postal codes will be offered to you.
        </p>

        <div className="space-y-2 pt-1">
          {AVAILABLE_ZONES.map((zone) => {
            const isChecked = selectedAreas.includes(zone.code);

            return (
              <label
                key={zone.code}
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                  isChecked
                    ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 dark:border-teal-700 font-semibold"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    Zip {zone.code}
                  </div>
                  <div className="text-[10px] text-zinc-400">{zone.name}</div>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleArea(zone.code)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
