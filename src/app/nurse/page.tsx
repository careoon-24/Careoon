"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { respondToOfferAction, updateClinicalProgressAction } from "@/actions/bookings";
import {
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  Star,
  Activity,
  Calendar,
  AlertCircle,
  Phone,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export default function NurseDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load nurse bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Pending 15-Minute Offers in flight
  const pendingOffers: any[] = [];
  bookings.forEach((b) => {
    if (b.offers && Array.isArray(b.offers)) {
      b.offers.forEach((o: any) => {
        if (o.status === "PENDING" && new Date(o.expiresAt) > new Date()) {
          pendingOffers.push({
            ...o,
            booking: b,
          });
        }
      });
    }
  });

  // 2. Active Visits Assigned to Nurse
  const activeJobs = bookings.filter((b) =>
    ["CONFIRMED", "NURSE_ARRIVED", "IN_PROGRESS"].includes(b.status)
  );

  // 3. Completed Visits
  const completedJobs = bookings.filter((b) => b.status === "COMPLETED");

  const handleAcceptOffer = async (offerId: string) => {
    setActionError("");
    setActionSuccess("");
    setIsProcessing(offerId);

    try {
      await respondToOfferAction(offerId, true);
      setActionSuccess("अभिनंदन! भेट स्वीकारली आहे. कृपया रुग्णाच्या पत्त्यावर वेळेत पोहोचा.");
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || "Failed to accept offer.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingOfferId) return;
    if (!rejectReason.trim()) {
      setActionError("कृपया नकार देण्याचे कारण निवडा.");
      return;
    }

    setIsProcessing(rejectingOfferId);
    setActionError("");
    try {
      await respondToOfferAction(rejectingOfferId, false, rejectReason);
      setRejectingOfferId(null);
      setRejectReason("");
      setActionSuccess("भेट नाकारली आहे. सिस्टीम रुग्णाला पर्यायी नर्स शोधत आहे.");
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || "Failed to decline offer.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateStage = async (bookingId: string, stage: "ARRIVED" | "STARTED" | "COMPLETED") => {
    setIsProcessing(bookingId);
    setActionError("");
    setActionSuccess("");

    try {
      await updateClinicalProgressAction(bookingId, stage);
      if (stage === "ARRIVED") {
        setActionSuccess("रुग्णाच्या घरी पोहोचल्याची नोंद झाली.");
      } else if (stage === "STARTED") {
        setActionSuccess("उपचार सुरू करण्यात आला आहे.");
      } else if (stage === "COMPLETED") {
        setActionSuccess("उपचार यशस्वीरित्या पूर्ण झाला! मानधन खात्यात जमा केले जाईल.");
      }
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || "Failed to update visit status.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-4 pb-10 max-w-4xl mx-auto">
      {/* Top Notification / Action Feedback */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError("")} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Performance Glance */}
      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">पूर्ण भेटी (Completed)</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {completedJobs.length}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">नर्स रेटिंग (Rating)</div>
          <div className="text-lg font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-4 h-4 fill-amber-400" />
            4.9
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">सक्रिय भेटी (Active)</div>
          <div className="text-lg font-black text-teal-700 mt-0.5">
            {activeJobs.length}
          </div>
        </div>
      </div>

      {/* 1. Pending Offers with 15-Minute Countdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            नवीन केअर ऑफर्स (Incoming Offers: {pendingOffers.length})
          </h2>
          {pendingOffers.length > 0 && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
              15 मिनिटांत प्रतिसाद द्या
            </span>
          )}
        </div>

        {pendingOffers.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500">
            सध्या कोणतीही प्रलंबित ऑफर नाही. सांगली-मिरज परिसरातील नवीन रुग्ण बुकिंग येथे थेट दिसेल.
          </div>
        ) : (
          pendingOffers.map((item) => {
            const booking = item.booking;
            const service = booking.service;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-amber-50/80 border-2 border-amber-400 shadow-md space-y-4 animate-in fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                      OFFER #{item.id.slice(-6)}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {service?.name || "Home Nursing Procedure"}
                    </h3>
                  </div>
                  <CountdownTimer expiresAt={new Date(item.expiresAt).toISOString()} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>तारीख: <strong>{booking.scheduledDate}</strong> ({booking.scheduledTime})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>रुग्ण: <strong>{booking.patientName || booking.patient?.fullName}</strong></span>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2 pt-1 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      पत्ता: <strong>{booking.addressLine}, {booking.city || "Sangli"} ({booking.postalCode})</strong>
                      {booking.landmark && <span className="text-slate-500 ml-1">({booking.landmark})</span>}
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span className="text-slate-500">नर्स मानधन (Your Net Payout):</span>
                    <span className="text-teal-700 text-base font-black">
                      {formatCurrency(booking.nurseEarningsAmount || (booking.servicePrice * 0.85))}
                    </span>
                  </div>
                </div>

                {/* Accept / Reject actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setRejectingOfferId(item.id)}
                    disabled={isProcessing === item.id}
                    className="py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    अस्वीकार (Decline)
                  </button>
                  <button
                    onClick={() => handleAcceptOffer(item.id)}
                    disabled={isProcessing === item.id}
                    className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                  >
                    {isProcessing === item.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    स्वीकारा (Accept Visit)
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Active & Confirmed Clinical Visits */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          सक्रिय भेटी (Active & Scheduled Visits: {activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500">
            सध्या कोणतीही सक्रिय भेट सुरू नाही. स्वीकारलेल्या भेटी येथे थेट दिसतील.
          </div>
        ) : (
          activeJobs.map((job) => {
            return (
              <div
                key={job.id}
                className="p-5 rounded-3xl bg-white border-2 border-teal-500/40 shadow-sm space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-700">
                      #{job.bookingCode || job.id.slice(-6)}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {job.service?.name || "Clinical Procedure"}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      job.status === "NURSE_ARRIVED"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : job.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                        : "bg-teal-100 text-teal-800 border border-teal-300"
                    }`}
                  >
                    {job.status === "NURSE_ARRIVED"
                      ? "घरी पोहोचले (Arrived)"
                      : job.status === "IN_PROGRESS"
                      ? "उपचार सुरू (In Progress)"
                      : "स्वीकारले (Confirmed)"}
                  </span>
                </div>

                {/* Patient Address & Phone */}
                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs space-y-2 border border-slate-200/80">
                  <div className="flex items-start gap-2 font-semibold text-slate-800">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      {job.addressLine}, {job.city || "Sangli"} ({job.postalCode})
                      {job.landmark && <span className="text-slate-500 ml-1">Landmark: {job.landmark}</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600">
                      रुग्ण: <strong>{job.patientName || job.patient?.fullName}</strong>
                    </span>
                    {job.patientContactPhone && (
                      <a
                        href={`tel:${job.patientContactPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>कॉल करा ({job.patientContactPhone})</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Sequential Job Status Control Buttons */}
                <div className="space-y-2 pt-1">
                  {job.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleUpdateStage(job.id, "ARRIVED")}
                      disabled={isProcessing === job.id}
                      className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isProcessing === job.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                      <span>घरी पोहोचलो (Mark Arrived at Doorstep)</span>
                    </button>
                  )}

                  {job.status === "NURSE_ARRIVED" && (
                    <button
                      onClick={() => handleUpdateStage(job.id, "STARTED")}
                      disabled={isProcessing === job.id}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isProcessing === job.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                      <span>उपचार सुरू करा (Start Clinical Procedure)</span>
                    </button>
                  )}

                  {job.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateStage(job.id, "COMPLETED")}
                      disabled={isProcessing === job.id}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isProcessing === job.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>उपचार पूर्ण झाला (Sign Off & Complete Care)</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    तुमचे मानधन: <strong className="text-slate-900">{formatCurrency(job.nurseEarningsAmount || (job.servicePrice * 0.85))}</strong>
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold">
                    वेळ: {job.scheduledDate} ({job.scheduledTime})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Offer Reason Modal */}
      {rejectingOfferId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">भेट नाकारण्याचे कारण निवडा</h3>
            <p className="text-xs text-slate-500">
              कृपया कारण निवडा जेणेकरून सांगलीतील रुग्णाला तातडीने दुसरी नर्स शोधली जाईल.
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-hidden font-medium"
            >
              <option value="">कारण निवडा...</option>
              <option value="हॉस्पिटल ड्युटी / शिफ्ट चालू आहे">हॉस्पिटल ड्युटी / शिफ्ट चालू आहे</option>
              <option value="अंतर जास्त / वाहतूक कोंडी">अंतर जास्त / वाहतूक कोंडी</option>
              <option value="वैद्यकीय साहित्य उपलब्ध नाही">वैद्यकीय साहित्य उपलब्ध नाही</option>
              <option value="कौटुंबिक / वैद्यकीय अडचण">कौटुंबिक / वैद्यकीय अडचण</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectingOfferId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                मागे जा
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition"
              >
                नकार निश्चित करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
