"use client";

import React, { useState, useEffect } from "react";
import {
  getPatientProfileAction,
  updatePatientProfileAction,
  saveFamilyMemberAction,
} from "@/actions/profile";
import {
  User,
  MapPin,
  Phone,
  Heart,
  Shield,
  CheckCircle2,
  Users,
  Plus,
  AlertCircle,
  Save,
  Clock,
  Sparkles,
  Building,
} from "lucide-react";

export default function PatientProfilePage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form State
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("MALE");
  const [bloodGroup, setBloodGroup] = useState<string>("B+");

  // Address in Sangli
  const [street, setStreet] = useState<string>("");
  const [apartment, setApartment] = useState<string>("");
  const [city, setCity] = useState<string>("Sangli");
  const [pincode, setPincode] = useState<string>("416416");

  // Clinical & Emergency Details
  const [emergencyName, setEmergencyName] = useState<string>("");
  const [emergencyPhone, setEmergencyPhone] = useState<string>("");
  const [chronicConditions, setChronicConditions] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState<boolean>(false);
  const [famName, setFamName] = useState<string>("");
  const [famRelation, setFamRelation] = useState<string>("Mother");
  const [famAge, setFamAge] = useState<string>("");
  const [famGender, setFamGender] = useState<string>("FEMALE");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await getPatientProfileAction();
        if (res.success && res.user) {
          const u = res.user;
          setFullName(u.fullName || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setAge(u.age ? String(u.age) : "");
          setGender(u.gender || "MALE");
          setBloodGroup(u.bloodGroup || "B+");

          setStreet(u.addressStreet || "");
          setApartment(u.addressApartment || "");
          setCity(u.addressCity || "Sangli");
          setPincode(u.addressPincode || "416416");

          setEmergencyName(u.emergencyContactName || "");
          setEmergencyPhone(u.emergencyContactPhone || "");
          setChronicConditions(u.chronicConditions || "");
          setAllergies(u.allergies || "");

          if (u.savedFamilyMembers) {
            try {
              setFamilyMembers(JSON.parse(u.savedFamilyMembers));
            } catch {
              setFamilyMembers([]);
            }
          }
        }
      } catch (err) {
        console.error("Profile load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSavedSuccess(false);

    try {
      await updatePatientProfileAction({
        fullName,
        phone,
        age: age ? Number(age) : undefined,
        gender,
        bloodGroup,
        addressStreet: street,
        addressApartment: apartment,
        addressCity: city || "Sangli",
        addressPincode: pincode || "416416",
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        chronicConditions,
        allergies,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;

    try {
      const res = await saveFamilyMemberAction({
        name: famName.trim(),
        relationship: famRelation,
        age: Number(famAge) || 50,
        gender: famGender,
        addressStreet: street,
        addressApartment: apartment,
        addressCity: city || "Sangli",
        addressPincode: pincode || "416416",
      });

      if (res.success && res.familyMembers) {
        setFamilyMembers(res.familyMembers);
        setFamName("");
        setFamAge("");
        setShowAddFamilyModal(false);
      }
    } catch (err: any) {
      alert("Failed to save family member: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Title & Clinical Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Patient Clinical Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
              Sangli Zone
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Save your doorstep address and family members once. All future nurse bookings autofill with zero retyping.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving || isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving to Cloud..." : "Save Profile Details"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile & doorstep address saved! All future home nurse bookings will autofill automatically.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* 1. PERSONAL INFORMATION */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>1. Personal & Contact Details</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Autofilled on &quot;Book for Myself&quot;</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (+91) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9822012345"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 34"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. DEFAULT DOORSTEP ADDRESS (SANGLI - MIRAJ) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>2. Default Home Visit Address (Sangli District)</span>
            </h2>
            <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Sangli - Miraj - Kupwad
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                House / Flat / Apartment Details *
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="e.g. Flat 302, Sai Vihar Residency"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Street, Area, Colony & Landmark *
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Near Vishrambag Ganpati Temple, 100 Feet Road"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                disabled
                value="Sangli - Miraj, Maharashtra"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Postal Pincode *
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="416416"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. SAVED FAMILY MEMBERS (ONE-TAP BOOKINGS) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>3. Saved Family Members ({familyMembers.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Book home nursing for parents, kids, or grandparents with 1 click.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFamilyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-slate-600">No family members added yet.</p>
              <p className="text-[11px] text-slate-400">
                Click &quot;Add Member&quot; to save parents or family members for instant repeat visits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {familyMembers.map((member: any) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      {member.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {member.relationship} • {member.age} yrs • {member.gender}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-700 border border-slate-200 text-slate-600">
                    Saved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. EMERGENCY & CLINICAL NOTES */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>4. Clinical Emergency & Allergies</span>
            </h2>
            <span className="text-[11px] text-slate-400">Shared with visiting licensed nurse</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Suresh Patil (Brother)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Phone (+91)
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="e.g. 9822998877"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Known Drug Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, Iodine"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chronic Medical Conditions
              </label>
              <input
                type="text"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Type-2 Diabetes, Hypertension"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-lg shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving to Cloud DB..." : "Save Patient Profile"}</span>
          </button>
        </div>
      </form>

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Add Family Member
              </h3>
              <button
                onClick={() => setShowAddFamilyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFamilyMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Family Member Name *</label>
                <input
                  type="text"
                  required
                  value={famName}
                  onChange={(e) => setFamName(e.target.value)}
                  placeholder="e.g. Sunita Patil"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={famRelation}
                    onChange={(e) => setFamRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="Mother">Mother (आई)</option>
                    <option value="Father">Father (बाबा)</option>
                    <option value="Spouse">Spouse (पती/पत्नी)</option>
                    <option value="Grandmother">Grandmother (आजी)</option>
                    <option value="Grandfather">Grandfather (आजोबा)</option>
                    <option value="Child">Child (मुलगा/मुलगी)</option>
                    <option value="Other">Other Relative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={famAge}
                    onChange={(e) => setFamAge(e.target.value)}
                    placeholder="e.g. 62"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={famGender}
                  onChange={(e) => setFamGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md shadow-teal-600/20"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
