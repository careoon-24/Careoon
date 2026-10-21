"use client";

import React from "react";
import { useCareoon } from "@/context/CareoonContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, Landmark, FileText, ArrowUpRight } from "lucide-react";

export default function NurseEarningsPage() {
  const { nursePayables, payoutBatches, getCurrentNurseProfile, bookings, services } = useCareoon();

  const nurseProfile = getCurrentNurseProfile();

  // Payables for this nurse
  const myPayables = nursePayables.filter((p) =>
    nurseProfile ? p.nurseId === nurseProfile.id : true
  );

  const accruedBalance = myPayables
    .filter((p) => ["accrued", "approved", "batched"].includes(p.status))
    .reduce((sum, p) => sum + p.netPayableAmount, 0);

  const totalPaid = myPayables
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.netPayableAmount, 0);

  // Batches that include this nurse's payables
  const myPaidBatches = payoutBatches.filter((b) =>
    b.payableIds.some((pId) => myPayables.some((mp) => mp.id === pId && mp.status === "paid"))
  );

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Earnings & Payout Ledger
        </h1>
        <p className="text-xs text-slate-500">
          Track accrued Sangli service payments and weekly bank settlements.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-600" />
            Accrued Balance
          </div>
          <div className="text-2xl font-extrabold text-teal-950">
            {formatCurrency(accruedBalance)}
          </div>
          <p className="text-[10px] text-teal-700 font-medium">
            Eligible for next weekly batch
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Total Settled
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[10px] text-slate-400">Paid to registered bank account</p>
        </div>
      </div>

      {/* Accrued Jobs List */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          Completed Clinical Visits ({myPayables.length})
        </h2>

        {myPayables.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No completed care visits in earnings ledger yet.
          </div>
        ) : (
          <div className="space-y-2">
            {myPayables.map((item) => {
              const booking = bookings.find((b) => b.id === item.bookingId);
              const service = services.find((s) => s.id === booking?.serviceId);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">
                      {service?.name || "Clinical Care Procedure"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Visit #{item.bookingId.slice(-6)} • {formatDate(item.createdAt)}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-extrabold text-teal-700 text-sm">
                      {formatCurrency(item.netPayableAmount)}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "batched"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-teal-600" />
          Weekly Bank Settlement Batches ({myPaidBatches.length})
        </h2>

        {myPaidBatches.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No settled batches yet.</p>
        ) : (
          <div className="space-y-2">
            {myPaidBatches.map((batch) => (
              <div
                key={batch.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {batch.batchReference}
                  </span>
                  <span className="font-extrabold text-emerald-600">
                    {formatCurrency(batch.totalAmount)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Period: {batch.periodStartDate} to {batch.periodEndDate}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Ref: {batch.paymentReference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
