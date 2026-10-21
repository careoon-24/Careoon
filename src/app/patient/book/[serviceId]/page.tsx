"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getPatientProfileAction } from "@/actions/profile";
import { createBookingAction } from "@/actions/bookings";
import { validateCouponAction } from "@/actions/coupons";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  Info,
  Sparkles,
  Phone,
  FileText,
  AlertCircle,
  Ticket,
  Tag,
  Check,
} from "lucide-react";

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.serviceId as string;

  const [service, setService] = useState<any | null>(null);
  const [nurses, setNurses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. RECIPIENT TOGGLE: 'MYSELF' or 'FAMILY'
  const [bookingRecipient, setBookingRecipient] = useState<"MYSELF" | "FAMILY">("MYSELF");

  // Patient & Address details
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [patientGender, setPatientGender] = useState<string>("MALE");
  const [familyRelationship, setFamilyRelationship] = useState<string>("Mother");

  // Sangli Doorstep Address
  const [apartment, setApartment] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("Sangli");
  const [postalCode, setPostalCode] = useState<string>("416416");

  // Date & Time Slot
  const todayStr = new Date().toISOString().split("T")[0];
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>("10:00 - 11:30 AM");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  // Nurse Selection & Submit
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Coupon State
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState<boolean>(false);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    setIsCheckingCoupon(true);

    try {
      const res = await validateCouponAction(couponInput, service?.basePrice || 0);
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponSuccess(res.message || "कूपन सवलत लागू झाली!");
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || "अवैध कूपन कोड.");
      }
    } catch (err: any) {
      setCouponError(err.message || "कूपन पडताळणी अयशस्वी झाली.");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Fetch real service details
        const resServ = await fetch("/api/services");
        const dataServ = await resServ.json();
        if (dataServ.success && dataServ.categories) {
          const allServices = dataServ.categories.flatMap((cat: any) =>
            (cat.services || []).map((s: any) => ({
              ...s,
              categoryName: cat.name,
            }))
          );
          const found = allServices.find((s: any) => s.id === serviceId);
          setService(found || null);
        }

        // 2. Fetch real verified nurses
        const resNurses = await fetch("/api/nurses");
        const dataNurses = await resNurses.json();
        if (dataNurses.success && dataNurses.nurses) {
          setNurses(dataNurses.nurses);
          if (dataNurses.nurses.length > 0) {
            setSelectedNurseId(dataNurses.nurses[0].id);
          }
        }

        // 3. Fetch patient profile to autofill
        const resProf = await getPatientProfileAction();
        if (resProf.success && resProf.user) {
          const u = resProf.user;
          setUserProfile(u);
          // Autofill for "MYSELF"
          setPatientName(u.fullName || "");
          setPatientPhone(u.phone || "");
          setPatientAge(u.age ? String(u.age) : "");
          setPatientGender(u.gender || "MALE");
          setStreet(u.addressStreet || "");
          setApartment(u.addressApartment || "");
          setCity(u.addressCity || "Sangli");
          setPostalCode(u.addressPincode || "416416");
        }
      } catch (err) {
        console.error("Booking page init error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [serviceId]);

  // When user toggles between "MYSELF" and "FAMILY"
  const handleToggleRecipient = (type: "MYSELF" | "FAMILY") => {
    setBookingRecipient(type);
    if (type === "MYSELF" && userProfile) {
      setPatientName(userProfile.fullName || "");
      setPatientPhone(userProfile.phone || "");
      setPatientAge(userProfile.age ? String(userProfile.age) : "");
      setPatientGender(userProfile.gender || "MALE");
      setStreet(userProfile.addressStreet || "");
      setApartment(userProfile.addressApartment || "");
      setCity(userProfile.addressCity || "Sangli");
      setPostalCode(userProfile.addressPincode || "416416");
    } else {
      // Clear for family recipient or select first saved family member
      const saved = userProfile?.savedFamilyMembers ? JSON.parse(userProfile.savedFamilyMembers) : [];
      if (saved.length > 0) {
        applyFamilyMember(saved[0]);
      } else {
        setPatientName("");
        setPatientPhone(userProfile?.phone || "");
        setPatientAge("");
        setPatientGender("FEMALE");
      }
    }
  };

  const applyFamilyMember = (member: any) => {
    setPatientName(member.name);
    setPatientAge(String(member.age || ""));
    setPatientGender(member.gender || "FEMALE");
    setFamilyRelationship(member.relationship || "Mother");
    if (member.addressStreet) setStreet(member.addressStreet);
    if (member.addressApartment) setApartment(member.addressApartment);
  };

  const savedFamilyList = userProfile?.savedFamilyMembers
    ? JSON.parse(userProfile.savedFamilyMembers)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!patientName.trim()) {
      setErrorMessage("Patient full name is required.");
      return;
    }

    if (!street.trim()) {
      setErrorMessage("Doorstep address / street in Sangli is required.");
      return;
    }

    if (!selectedNurseId) {
      setErrorMessage("Please select an available nurse for this visit.");
      return;
    }

    setSubmitting(true);

    try {
      const fullAddress = apartment ? `${apartment}, ${street}` : street;
      const res = await createBookingAction({
        serviceId: service.id,
        nurseId: selectedNurseId,
        scheduledDate,
        scheduledTime: scheduledTimeSlot,
        addressLine: fullAddress,
        city: city || "Sangli",
        postalCode: postalCode || "416416",
        patientContactPhone: patientPhone || userProfile?.phone || "+919822000000",
        patientName: `${patientName}${bookingRecipient === "FAMILY" ? ` (${familyRelationship})` : ""}`,
        patientNotes: clinicalNotes,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      if (res && res.bookingId) {
        router.push(`/patient/bookings/${res.bookingId}`);
        return;
      }
      setErrorMessage("Failed to submit booking.");
      setSubmitting(false);
    } catch (err: any) {
      if (err.message?.includes("logged in")) {
        router.push(`/login?redirect=/patient/book/${service.id}`);
        return;
      }
      setErrorMessage(err.message || "Failed to schedule home nursing visit.");
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold">Configuring Sangli Clinical Care...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-200 p-6">
        <p className="text-sm font-bold text-slate-800">Clinical Service Not Found</p>
        <p className="text-xs text-slate-400">The requested procedure may have been updated by admin.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Procedures</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Procedures</span>
        </button>
        <span className="text-xs font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Doorstep Nursing • Sangli - Miraj
        </span>
      </div>

      {/* Selected Procedure Summary Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MNC Verified Procedure</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black">{service.name}</h1>
          <p className="text-xs text-teal-100/70">{service.durationMinutes} mins duration • Sterile Single-Use Kit Included</p>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Fixed Patient Rate</span>
          <div className="text-2xl font-black text-white">{formatCurrency(service.basePrice)}</div>
          <span className="text-[10px] text-teal-300 font-medium">All taxes & sterile kit included</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. RECIPIENT SELECTION (WHO IS THIS FOR?) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 block">
            Step 1: Patient Selection
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
            Who needs this clinical nursing care?
          </h2>
        </div>

        {/* 2-Option Master Toggle Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleToggleRecipient("MYSELF")}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
              bookingRecipient === "MYSELF"
                ? "border-teal-600 bg-teal-50/70 text-teal-900 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              bookingRecipient === "MYSELF" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-black">Book for Myself</span>
            <span className="text-[10px] text-slate-500 font-medium">
              Autofills my saved profile & Sangli address
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleRecipient("FAMILY")}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
              bookingRecipient === "FAMILY"
                ? "border-teal-600 bg-teal-50/70 text-teal-900 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              bookingRecipient === "FAMILY" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-black">Book for Family / Someone Else</span>
            <span className="text-[10px] text-slate-500 font-medium">
              Mother, Father, Child, or Relative
            </span>
          </button>
        </div>

        {/* Quick Family Members Pills (If FAMILY chosen) */}
        {bookingRecipient === "FAMILY" && savedFamilyList.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              Quick Select Saved Family Member:
            </span>
            <div className="flex flex-wrap gap-2">
              {savedFamilyList.map((m: any) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => applyFamilyMember(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    patientName === m.name
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  <span>{m.name} ({m.relationship})</span>
                  {patientName === m.name && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Patient Details Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Sunita Patil"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="e.g. 58"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Gender
            </label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. SANGLI DOORSTEP VISIT ADDRESS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 block">
            Step 2: Doorstep Address & Time Slot
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
            Where and when should the nurse arrive?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              House / Apartment / Landmark in Sangli *
            </label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Flat 302, Sai Vihar, Near Ganpati Temple, 100 Feet Road"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Date of Clinical Visit *
            </label>
            <input
              type="date"
              required
              min={todayStr}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Preferred Time Window *
            </label>
            <select
              value={scheduledTimeSlot}
              onChange={(e) => setScheduledTimeSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
            >
              <option value="08:00 - 09:30 AM">Morning (08:00 - 09:30 AM)</option>
              <option value="10:00 - 11:30 AM">Morning (10:00 - 11:30 AM)</option>
              <option value="01:00 - 02:30 PM">Afternoon (01:00 - 02:30 PM)</option>
              <option value="04:00 - 05:30 PM">Evening (04:00 - 05:30 PM)</option>
              <option value="06:30 - 08:00 PM">Night (06:30 - 08:00 PM)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              Doctor&apos;s Prescription Notes / Access Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g., Suture removal after orthopedic surgery, IV drip prescribed by Dr. Kulkarni, Miraj..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* 3. NEARBY VERIFIED NURSE SELECTION */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 block">
            Step 3: Distance-Matched Certified Nurse
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
            Select your assigned clinical care provider
          </h2>
        </div>

        {nurses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
            <h4 className="font-extrabold text-amber-900">No Verified Nurses Currently Active in Database</h4>
            <p className="text-amber-800 text-[11px] max-w-md mx-auto leading-relaxed">
              Your platform database is in a clean state. Once licensed nurses apply at <code>/nurse/activate</code> and admin approves them at <code>/admin/nurses</code>, they will appear here with live GPS distance matching.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nurses.map((nurse) => {
              const name = nurse.user?.fullName || "Certified Nurse";
              const isSelected = selectedNurseId === nurse.id;

              return (
                <div
                  key={nurse.id}
                  onClick={() => setSelectedNurseId(nurse.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/70 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          {name}, RN
                          <ShieldCheck className="w-4 h-4 text-teal-500" />
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          MNC: {nurse.registrationNumber} • {nurse.experienceYears} yrs Clinical Exp
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-teal-600">
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                      </div>
                    </div>

                    {nurse.bio && (
                      <p className="text-[11px] text-slate-600 line-clamp-2">{nurse.bio}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">
                      Within Sangli-Miraj Zone
                    </span>
                    <span className="font-black text-amber-500 flex items-center gap-1 text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {nurse.ratingAverage ? Number(nurse.ratingAverage).toFixed(1) : "5.0"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COUPON CODE & LIVE DOORSTEP PRICING */}
      {(() => {
        const baseRate = service?.basePrice || 0;
        const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
        const finalPayable = Math.max(0, baseRate - discount);

        return (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 block">
                  Step 4: Promotional Coupon & Pricing (कूपन सवलत)
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  Have a Promo Coupon? Apply for instant discount
                </h2>
              </div>
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>

            {/* Coupon Input Form */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code (e.g. SANGLI100)"
                    disabled={!!appliedCoupon}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-black text-xs uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>

                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isCheckingCoupon || !couponInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition"
                  >
                    {isCheckingCoupon ? "Checking..." : "Apply (लागू करा)"}
                  </button>
                )}
              </div>

              {/* Sangli Launch Quick Hint */}
              {!appliedCoupon && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>💡 Sangli Launch Offer:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCouponInput("SANGLI100");
                      validateCouponAction("SANGLI100", service?.basePrice || 0).then((res) => {
                        if (res.valid) {
                          setAppliedCoupon(res);
                          setCouponSuccess(res.message || "कूपन सवलत लागू झाली!");
                        }
                      });
                    }}
                    className="font-mono font-black text-purple-700 hover:underline bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200"
                  >
                    SANGLI100 (Flat ₹100 Off)
                  </button>
                </div>
              )}

              {/* Coupon Feedback Alerts */}
              {couponSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              {couponError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Transparent Doorstep Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Doorstep Procedure Rate ({service.name}):</span>
                <span className="font-bold text-slate-900">{formatCurrency(baseRate)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>Promo Discount ({appliedCoupon.code}):</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Sterile Clinical Kit & MNC Certified Nurse:</span>
                <span className="text-emerald-700 font-bold">Included (मोफत)</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <div>
                  <span className="font-black text-slate-900 block">Total Due at Doorstep</span>
                  <span className="text-[10px] text-slate-400">Pay via Cash or UPI after service</span>
                </div>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-xs text-slate-400 line-through block font-medium">
                      {formatCurrency(baseRate)}
                    </span>
                  )}
                  <span className="text-lg font-black text-teal-700">
                    {formatCurrency(finalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. SUBMIT ORDER BUTTON */}
      {(() => {
        const baseRate = service?.basePrice || 0;
        const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
        const finalPayable = Math.max(0, baseRate - discount);

        return (
          <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-teal-300 font-extrabold uppercase tracking-wider block">
                  Sangli - Miraj Doorstep Care
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                    Coupon: {appliedCoupon.code} (-₹{discount})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Total to Pay at Doorstep: <strong className="text-white text-sm">{formatCurrency(finalPayable)}</strong> (Cash/UPI)
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
            >
              <span>{submitting ? "Confirming Visit..." : `Schedule Visit (${formatCurrency(finalPayable)})`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
      })()}
    </form>
  );
}
