"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Landmark,
  FileText,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function NurseEarningsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load nurse earnings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  
  // Total accrued earnings (all completed visits)
  const totalAccrued = completedBookings.reduce(
    (sum, b) => sum + (b.nurseEarningsAmount || (b.servicePrice * 0.85)),
    0
  );

  // Settled bookings (marked as PAID in ledger)
  const paidBookings = completedBookings.filter((b) => b.paymentStatus === "PAID");
  const totalSettled = paidBookings.reduce(
    (sum, b) => sum + (b.nurseEarningsAmount || (b.servicePrice * 0.85)),
    0
  );

  return (
    <div className="space-y-4 pb-12 max-w-2xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            परिचारिका मानधन खाते (Earnings & Payout Ledger)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic commission calculation, PhonePe verification, and Sangli bank payouts.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition"
          title="Refresh earnings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>

      {/* 3 KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-teal-50/80 border border-teal-200/90 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-600" />
            <span>एकूण जमा मानधन (Accrued)</span>
          </div>
          <div className="text-2xl font-black text-teal-950">
            {formatCurrency(totalAccrued)}
          </div>
          <p className="text-[10px] text-teal-700 font-semibold">
            सोमवारी बँक खात्यात ट्रान्सफर
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>बँकेत जमा (Settled)</span>
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {formatCurrency(totalSettled)}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">
            NEFT / IMPS द्वारे जमा
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>पूर्ण भेटी (Visits)</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completedBookings.length}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">
            हॉस्पिटल दर्जाची सेवा
          </p>
        </div>
      </div>

      {/* Completed Care Visits List with Full Mathematical Transparency */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>पूर्ण झालेल्या क्लिनिकल भेटी ({completedBookings.length})</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold">
            Zero Commission Mismatch Guarantee
          </span>
        </div>

        {completedBookings.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              अद्याप कोणतीही भेट पूर्ण झालेली नाही
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              सांगलीतील रुग्णांची भेट पूर्ण केल्यानंतर तुमची निव्वळ कमाई आणि फोनपे पेमेंट व्हेरिफिकेशन येथे दिसेल.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedBookings.map((b) => {
              const patientPaid = b.totalPatientAmount || b.servicePrice;
              const commission = b.commissionAmount || (b.servicePrice * 0.15);
              const takeHome = b.nurseEarningsAmount || (patientPaid - commission);

              return (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-teal-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        {b.bookingCode || b.id.slice(-6)}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                        {b.service?.name || "Clinical Care Procedure"}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        रुग्ण: <strong>{b.patientName || b.patient?.fullName}</strong> • {b.scheduledDate} ({b.scheduledTime})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        पत्ता: {b.addressLine}, {b.city || "Sangli"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-teal-700 block">
                        {formatCurrency(takeHome)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {b.paymentStatus === "PAID" ? "✓ PhonePe Paid" : "Payable Accrued"}
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Transparency Grid */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">रुग्णाने भरले (Gross)</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{formatCurrency(patientPaid)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">प्लॅटफॉर्म कमिशन ({b.commissionPercent || 15}%)</span>
                      <span className="font-bold text-rose-600 text-xs mt-0.5 block">- {formatCurrency(commission)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-800 block font-bold">तुमची कमाई (Net)</span>
                      <span className="font-black text-teal-700 text-xs mt-0.5 block">{formatCurrency(takeHome)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Direct Deposit Policy */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-teal-600" />
          <span>साप्ताहिक थेट बँक जमा धोरण (Weekly Direct Deposit Policy)</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          केअरून प्लॅटफॉर्मवर सर्व रकमेचे कमिशन ऑटोमॅटिक सिस्टीमद्वारे अचूक काढले जाते. पूर्ण झालेल्या सर्व भेटींचे मानधन प्रत्येक सोमवारी परिचारिकेच्या व्हेरिफाइड बँक खात्यात (NEFT/IMPS द्वारे) ट्रान्सफर केले जाते.
        </p>
      </div>
    </div>
  );
}
