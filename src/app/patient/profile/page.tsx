"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { User, MapPin, Phone, Heart, Shield, CheckCircle2 } from "lucide-react";

export default function PatientProfilePage() {
  const { currentUser, getCurrentPatientProfile } = useCareoon();
  const profile = getCurrentPatientProfile();

  const [saved, setSaved] = useState(false);
  const [street, setStreet] = useState(profile?.address.street || "742 Evergreen Terrace");
  const [city, setCity] = useState(profile?.address.city || "Metro City");
  const [postalCode, setPostalCode] = useState(profile?.address.postalCode || "10001");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || "+1 (555) 789-0123");
  const [emergencyName, setEmergencyName] = useState(profile?.emergencyContact.name || "Arthur Vance");
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContact.phone || "+1 (555) 789-9999");
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalAlertNotes || "Penicillin allergy.");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Patient Profile
        </h1>
        <p className="text-xs text-zinc-500">Manage your clinical emergency and home visit details.</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Personal Details */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Contact Information
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-zinc-500">Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.fullName || "Eleanor Vance"}
                className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-zinc-500">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || "eleanor.vance@example.com"}
                className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Default Home Visit Address
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Clinical Alert & Emergency Contact */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Medical Alert & Emergency Contact
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Emergency Phone
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Allergies & Critical Clinical Notes
              </label>
              <textarea
                rows={2}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
