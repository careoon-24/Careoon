"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { PaymentMethod } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  DollarSign,
  Landmark,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Layers,
  ArrowRight,
  Plus,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function AdminFinancePage() {
  const {
    bookings,
    services,
    payments,
    nursePayables,
    payoutBatches,
    adminRecordPayment,
    adminCreatePayoutBatch,
    adminSettlePayoutBatch,
  } = useCareoon();

  const [activeTab, setActiveTab] = useState<"record_payment" | "payables" | "payout_batches">("record_payment");

  // Manual Payment Record Form State
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(120);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  // Payout Batch Form State
  const [selectedPayableIds, setSelectedPayableIds] = useState<string[]>([]);
  const [batchSuccess, setBatchSuccess] = useState<string>("");
  const [settleBatchId, setSettleBatchId] = useState<string>("");
  const [wireRef, setWireRef] = useState<string>("");

  // Eligible bookings awaiting payment verification
  const unpaidCompletedBookings = bookings.filter((b) =>
    ["completed", "payment_pending", "nurse_arrived", "in_progress"].includes(b.status) &&
    !payments.some((p) => p.bookingId === b.id && p.status === "received")
  );

  const handleBookingSelect = (bId: string) => {
    setSelectedBookingId(bId);
    const b = bookings.find((item) => item.id === bId);
    if (b) {
      setPaymentAmount(b.servicePriceSnapshot);
      setPaymentReference(`WIRE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${b.id.slice(-4).toUpperCase()}`);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess("");

    if (!selectedBookingId) {
      setPaymentError("Please select a booking to record payment for.");
      return;
    }
    if (!paymentReference.trim()) {
      setPaymentError("Payment reference number / transaction ID is required.");
      return;
    }

    const res = adminRecordPayment(
      selectedBookingId,
      paymentAmount,
      paymentMethod,
      paymentReference,
      paymentNotes
    );

    if (res.success) {
      setPaymentSuccess(
        `Payment of ${formatCurrency(paymentAmount)} recorded & verified. Booking is now reconciled, and nurse payable is accrued in the ledger.`
      );
      setSelectedBookingId("");
      setPaymentNotes("");
    } else {
      setPaymentError(res.error || "Failed to record payment.");
    }
  };

  const handleCreateBatch = () => {
    if (selectedPayableIds.length === 0) return;
    const res = adminCreatePayoutBatch(selectedPayableIds);
    if (res.success) {
      setBatchSuccess(`Weekly payout batch created for ${selectedPayableIds.length} payables.`);
      setSelectedPayableIds([]);
      setTimeout(() => setBatchSuccess(""), 3000);
    }
  };

  const handleSettleBatch = (batchId: string) => {
    if (!wireRef.trim()) {
      alert("Please provide the bank wire reference number before marking settled.");
      return;
    }
    const res = adminSettlePayoutBatch(batchId, wireRef);
    if (res.success) {
      setSettleBatchId("");
      setWireRef("");
    }
  };

  // Financial Summaries
  const accruedPayables = nursePayables.filter((p) => ["accrued", "approved"].includes(p.status));
  const totalAccruedAmount = accruedPayables.reduce((sum, p) => sum + p.netPayableAmount, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Financial Ledger, Collections & Payouts
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Explicit separation between service completion and payment verification. Manage manual patient payments and weekly nurse batch settlements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("record_payment")}
          className={`px-3 py-2 rounded-xl transition-colors ${
            activeTab === "record_payment"
              ? "bg-purple-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          1. Record Patient Payment Receipt
        </button>
        <button
          onClick={() => setActiveTab("payables")}
          className={`px-3 py-2 rounded-xl transition-colors ${
            activeTab === "payables"
              ? "bg-purple-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          2. Accrued Nurse Payables ({accruedPayables.length})
        </button>
        <button
          onClick={() => setActiveTab("payout_batches")}
          className={`px-3 py-2 rounded-xl transition-colors ${
            activeTab === "payout_batches"
              ? "bg-purple-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          3. Weekly Payout Batches ({payoutBatches.length})
        </button>
      </div>

      {/* Tab 1: Record Manual Payment Receipt */}
      {activeTab === "record_payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleRecordPayment}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 text-xs"
          >
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                Record & Verify Patient Payment
              </h2>
              <p className="text-[11px] text-zinc-500">
                Payment is never auto-credited upon service completion. An authorized admin verifies receipt method & bank reference.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Target Booking to Reconcile
              </label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden"
              >
                <option value="">Select completed or pending booking...</option>
                {unpaidCompletedBookings.map((b) => {
                  const srv = services.find((s) => s.id === b.serviceId);
                  return (
                    <option key={b.id} value={b.id}>
                      #{b.id.slice(-6)}: {srv?.name} — {formatCurrency(b.servicePriceSnapshot)} ({b.status})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Verified Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 font-bold outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden"
                >
                  <option value="bank_transfer">Bank Wire / ACH Transfer</option>
                  <option value="cash_on_delivery">Cash Collected On Delivery</option>
                  <option value="pos_terminal">Mobile POS Terminal</option>
                  <option value="card_manual_entry">Card Manual Receipt Entry</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Bank / Wire / Receipt Reference Number
              </label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. WIRE-20261017-88190"
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 font-mono outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Auditor Reconciliation Notes
              </label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Verified against Careoon operating account statement batch #10."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden"
              />
            </div>

            {paymentError && <p className="text-xs text-rose-600">{paymentError}</p>}
            {paymentSuccess && <p className="text-xs text-emerald-600 font-medium">{paymentSuccess}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
            >
              Verify Payment Receipt & Accrue Nurse Payable
            </button>
          </form>

          {/* Recent Verified Payments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Verified Payments Audit Trail ({payments.length})
            </h3>
            <div className="space-y-2">
              {payments.map((p) => {
                const b = bookings.find((item) => item.id === p.bookingId);
                const s = services.find((item) => item.id === b?.serviceId);

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {s?.name || "Care Service"}
                      </span>
                      <span className="font-black text-emerald-600 text-sm">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                      <span>Method: {p.paymentMethod.replace(/_/g, " ").toUpperCase()}</span>
                      <span className="font-mono text-zinc-400">{p.referenceNumber}</span>
                    </div>
                    {p.notes && (
                      <p className="text-[10px] text-zinc-400 italic border-t border-zinc-100 dark:border-zinc-800 pt-1">
                        Note: {p.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Accrued Nurse Payables & Batch Creation */}
      {activeTab === "payables" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Unbatched Accrued Payables
              </div>
              <div className="text-xl font-extrabold text-teal-950 dark:text-teal-100">
                {formatCurrency(totalAccruedAmount)} across {accruedPayables.length} visits
              </div>
            </div>

            <button
              onClick={handleCreateBatch}
              disabled={selectedPayableIds.length === 0}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-teal-600/20"
            >
              Generate Weekly Payout Batch ({selectedPayableIds.length} Selected)
            </button>
          </div>

          {batchSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              {batchSuccess}
            </div>
          )}

          {/* Payables Table */}
          <div className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedPayableIds.length === accruedPayables.length && accruedPayables.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPayableIds(accruedPayables.map((p) => p.id));
                        else setSelectedPayableIds([]);
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Gross Fee</th>
                  <th className="py-3 px-3">Careoon Commission</th>
                  <th className="py-3 px-3">Nurse Net Payable</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {nursePayables.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50">
                    <td className="py-3 px-4">
                      {["accrued", "approved"].includes(p.status) && (
                        <input
                          type="checkbox"
                          checked={selectedPayableIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPayableIds([...selectedPayableIds, p.id]);
                            else setSelectedPayableIds(selectedPayableIds.filter((id) => id !== p.id));
                          }}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      #{p.bookingId.slice(-6)}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(p.grossServiceAmount)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-purple-600">
                      {formatCurrency(p.careoonCommissionAmount)}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-teal-600 dark:text-teal-400">
                      {formatCurrency(p.netPayableAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Payout Batches & Settlement */}
      {activeTab === "payout_batches" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            Batches group accrued nurse payables for weekly settlement. Funds are only marked &quot;completed&quot; once an auditable bank transfer reference is entered.
          </p>

          <div className="space-y-3">
            {payoutBatches.map((batch) => (
              <div
                key={batch.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400">Batch Reference</span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {batch.batchReference}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400">Total Net Payout</span>
                    <div className="font-black text-teal-600 text-base">
                      {formatCurrency(batch.totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
                  <div>Period: {batch.periodStartDate} to {batch.periodEndDate}</div>
                  <div className="text-right">Nurses Included: {batch.totalNursesCount}</div>
                </div>

                {batch.status === "completed" ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Settled via Bank Transfer
                    </span>
                    <span className="font-mono text-[10px]">Ref: {batch.paymentReference}</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                      Awaiting External Bank Settlement Reference
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter wire transfer / ACH batch ref..."
                        value={settleBatchId === batch.id ? wireRef : ""}
                        onChange={(e) => {
                          setSettleBatchId(batch.id);
                          setWireRef(e.target.value);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono outline-hidden"
                      />
                      <button
                        onClick={() => handleSettleBatch(batch.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
                      >
                        Mark Settled
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
