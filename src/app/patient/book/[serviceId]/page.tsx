"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { formatCurrency } from "@/lib/utils";
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
  Info,
} from "lucide-react";

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const {
    services,
    currentUser,
    getCurrentPatientProfile,
    getEligibleNursesForService,
    createBookingWithNurseOffer,
  } = useCareoon();

  const serviceId = params?.serviceId as string;
  const service = services.find((s) => s.id === serviceId);

  const patientProfile = getCurrentPatientProfile();

  // Booking details state
  const [street, setStreet] = useState<string>(patientProfile?.address.street || "742 Evergreen Terrace");
  const [apartment, setApartment] = useState<string>(patientProfile?.address.apartment || "Apt 4B");
  const [city, setCity] = useState<string>(patientProfile?.address.city || "Metro City");
  const [postalCode, setPostalCode] = useState<string>(patientProfile?.address.postalCode || "10001");
  const [scheduledDate, setScheduledDate] = useState<string>("2026-10-18");
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>("10:00 - 11:00 AM");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Selected Nurse
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!service) {
    return (
      <div className="text-center py-10 space-y-2">
        <p className="text-xs text-rose-500 font-semibold">Service not found.</p>
        <Link href="/patient" className="text-xs text-blue-600 underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Realtime eligible nurses calculation
  const candidateNurses = getEligibleNursesForService(
    service.id,
    postalCode,
    scheduledDate,
    scheduledTimeSlot
  );

  const eligibleNurses = candidateNurses.filter((c) => c.eligible);
  const ineligibleNurses = candidateNurses.filter((c) => !c.eligible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedNurseId) {
      setErrorMessage("Please select an eligible nurse to submit your booking.");
      return;
    }

    setSubmitting(true);
    const result = createBookingWithNurseOffer(
      service.id,
      {
        street,
        apartment,
        city,
        postalCode,
        instructions: specialInstructions,
      },
      scheduledDate,
      scheduledTimeSlot,
      selectedNurseId,
      specialInstructions
    );

    if (result.success && result.bookingId) {
      router.push(`/patient/bookings/${result.bookingId}`);
    } else {
      setErrorMessage(result.error || "Failed to create booking offer.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
          Step 2 of 2: Nurse Selection
        </span>
      </div>

      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase">
            Service Selected
          </span>
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white">{service.name}</h2>
          <span className="text-[11px] text-zinc-500">{service.durationMinutes} mins estimated</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrency(service.basePrice)}
          </div>
          <span className="text-[10px] text-zinc-400">Fixed Rate</span>
        </div>
      </div>

      {/* Section 1: Address & Time Slot */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          1. Service Address & Time Slot
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="col-span-2 space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Street Address
            </label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Apt / Suite
            </label>
            <input
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Postal Code (Area Match)
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Requested Date
            </label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time Slot
            </label>
            <select
              value={scheduledTimeSlot}
              onChange={(e) => setScheduledTimeSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="08:00 - 09:30 AM">08:00 - 09:30 AM</option>
              <option value="10:00 - 11:00 AM">10:00 - 11:00 AM</option>
              <option value="01:00 - 02:30 PM">01:00 - 02:30 PM</option>
              <option value="03:00 - 04:30 PM">03:00 - 04:30 PM</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Special Clinical Instructions / Access Notes
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Ring buzzer twice. Discharge note is on the bedside table."
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Eligible Nurse Comparison */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            2. Compare & Select Eligible Nurse
          </h3>
          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
            {eligibleNurses.length} qualified in {postalCode}
          </span>
        </div>

        {eligibleNurses.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              No Qualified Nurses Available in Postal Code {postalCode}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Try testing postal code <strong>10001</strong> or <strong>10002</strong>, or submit a request for manual admin assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {eligibleNurses.map(({ nurse, user }) => {
              const isSelected = selectedNurseId === nurse.id;

              return (
                <div
                  key={nurse.id}
                  onClick={() => setSelectedNurseId(nurse.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-400 ring-2 ring-blue-500/30"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden shrink-0 border">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-500">
                            {user.fullName.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">
                            {user.fullName}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[9px] font-semibold">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Verified RN
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          License: {nurse.licenseNumber}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{nurse.ratingAverage.toFixed(1)}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        ({nurse.ratingCount})
                      </span>
                    </div>
                  </div>

                  {nurse.bio && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                      {nurse.bio}
                    </p>
                  )}

                  {/* Performance stats & badges */}
                  <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px]">
                    <div className="text-zinc-500">
                      Completed:{" "}
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {nurse.completedBookingsCount}
                      </span>
                    </div>
                    <div className="text-zinc-500">
                      Experience:{" "}
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {nurse.yearsExperience || 5}+ yrs
                      </span>
                    </div>
                    <div className="text-right text-teal-600 dark:text-teal-400 font-semibold">
                      {isSelected ? "Selected ✓" : "Click to select"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ineligible Nurses Dropdown / Transparency */}
        {ineligibleNurses.length > 0 && (
          <details className="text-[11px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
            <summary className="cursor-pointer font-medium hover:text-zinc-800 dark:hover:text-zinc-300">
              Why are {ineligibleNurses.length} other nurses unavailable? (Eligibility Rules)
            </summary>
            <div className="mt-2 space-y-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-700">
              {ineligibleNurses.map(({ nurse, user, reasons }) => (
                <div key={nurse.id} className="text-[10px]">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {user.fullName}:
                  </span>{" "}
                  <span className="text-rose-500">{reasons.join("; ")}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* 15-Minute Response Policy Disclaimer */}
      <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
        <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Server-Enforced 15-Minute Response Policy
        </div>
        <p>
          Once submitted, the selected nurse has <strong>exactly 15 minutes</strong> to accept. If they decline or the timer expires, you can instantly reselect another qualified nurse without re-entering your booking details.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !selectedNurseId}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
      >
        <span>Submit Booking & Send 15-Min Offer</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}
