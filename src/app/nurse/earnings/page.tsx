"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, Landmark, FileText, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";

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
  const totalAccrued = completedBookings.reduce(
    (sum, b) => sum + (b.nurseEarningsAmount || (b.servicePrice * 0.85)),
    0
  );
  const paidBookings = completedBookings.filter((b) => b.paymentStatus === "PAID");
  const totalPaid = paidBookings.reduce(
    (sum, b) => sum + (b.nurseEarningsAmount || (b.servicePrice * 0.85)),
    0
  );

  return (
    <div className="space-y-4 pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Earnings & Payout Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Track accrued Sangli service payments and weekly bank settlements.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-teal-50 border border-teal-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-600" />
            Accrued Balance
          </div>
          <div className="text-2xl font-black text-teal-950">
            {formatCurrency(totalAccrued)}
          </div>
          <p className="text-[10px] text-teal-700 font-medium">
            Eligible for next weekly batch
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Total Settled
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[10px] text-slate-400">Direct wire to Sangli bank</p>
        </div>
      </div>

      {/* Completed Care Visits List */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          Completed Clinical Visits ({completedBookings.length})
        </h2>

        {completedBookings.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No completed care visits in earnings ledger yet. Complete your first visit to see earnings.
          </div>
        ) : (
          <div className="space-y-2">
            {completedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    {b.service?.name || "Clinical Care Procedure"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Visit #{b.bookingCode || b.id.slice(-6)} • {b.scheduledDate} ({b.scheduledTime})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Patient: {b.patientName || b.patient?.fullName} • {b.addressLine}, {b.city || "Sangli"}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-sm font-black text-teal-700">
                    {formatCurrency(b.nurseEarningsAmount || (b.servicePrice * 0.85))}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      b.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {b.paymentStatus === "PAID" ? "Settled" : "Accrued"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Direct Deposit Info */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-teal-600" />
          Weekly Bank Settlement Policy
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Careoon automatically calculates 85% clinical payouts for all completed Sangli visits. Settlements are processed every Monday directly to your verified IFSC bank account with digital TDS certificates.
        </p>
      </div>
    </div>
  );
}
