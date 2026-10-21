"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { reconcilePaymentAction, generatePayoutBatchAction } from "@/actions/finance";
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
  RefreshCw,
  Wallet,
  TrendingUp,
} from "lucide-react";

export default function AdminFinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"bookings_ledger" | "reconcile_payment" | "payout_batches">("bookings_ledger");

  // Reconcile Payment Form State
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  // Payout Batch Generation State
  const [isBatching, setIsBatching] = useState<boolean>(false);
  const [batchMessage, setBatchMessage] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings for finance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingSelect = (bId: string) => {
    setSelectedBookingId(bId);
    const b = bookings.find((item) => item.id === bId);
    if (b) {
      setPaymentAmount(b.totalPatientAmount || b.servicePrice);
      setPaymentRef(`UPI-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleReconcilePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedBookingId) {
      setFormError("Please select a booking to reconcile payment.");
      return;
    }
    if (!paymentRef.trim()) {
      setFormError("Payment reference ID is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reconcilePaymentAction({
        bookingId: selectedBookingId,
        amount: paymentAmount,
        method: paymentMethod,
        paymentRef: paymentRef.trim(),
      });
      setFormSuccess(`Payment of ${formatCurrency(paymentAmount)} successfully reconciled in Neon DB.`);
      setSelectedBookingId("");
      setPaymentRef("");
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to reconcile payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateBatch = async () => {
    setIsBatching(true);
    setBatchMessage("");
    try {
      const res = await generatePayoutBatchAction();
      if (res.success) {
        setBatchMessage(`Payout batch ${res.batchCode} generated successfully!`);
        loadData();
      }
    } catch (err: any) {
      setBatchMessage(err.message || "Failed to generate payout batch.");
    } finally {
      setIsBatching(false);
    }
  };

  // Financial Summaries from Real Database
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalVolume = bookings.reduce((sum, b) => sum + (b.totalPatientAmount || b.servicePrice || 0), 0);
  const totalCommission = bookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
  const totalNurseEarnings = bookings.reduce((sum, b) => sum + (b.nurseEarningsAmount || 0), 0);
  const unpaidBookings = bookings.filter((b) => b.paymentStatus !== "PAID");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Financial Ledger & Payout Settlement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time reconciliation of Sangli home care revenue, Sangli nurse payouts, and platform commissions.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Gross Patient Billed</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">{bookings.length} Total Patient Invoices</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
            <span>Platform Commission</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950">
            {formatCurrency(totalCommission)}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold">Net Careoon Margin (15%)</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
            <span>Nurse Payables</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {formatCurrency(totalNurseEarnings)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">Earned by Sangli Nurses (85%)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("bookings_ledger")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "bookings_ledger"
              ? "bg-purple-600 text-white font-bold shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Bookings Ledger ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("reconcile_payment")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "reconcile_payment"
              ? "bg-purple-600 text-white font-bold shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Reconcile Payment ({unpaidBookings.length} Unpaid)
        </button>
        <button
          onClick={() => setActiveTab("payout_batches")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "payout_batches"
              ? "bg-purple-600 text-white font-bold shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Weekly Payout Batches
        </button>
      </div>

      {/* Tab 1: Bookings Financial Ledger */}
      {activeTab === "bookings_ledger" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking Code</th>
                  <th className="py-3 px-4">Procedure</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Careoon (15%)</th>
                  <th className="py-3 px-4">Nurse (85%)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No financial records found in the database.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        #{b.bookingCode || b.id.slice(-6)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {b.service?.name || "Home Nursing"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.patientName || b.patient?.fullName}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        {formatCurrency(b.totalPatientAmount || b.servicePrice)}
                        {b.discountAmount > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-semibold">
                            -{formatCurrency(b.discountAmount)} (Coupon)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-700">
                        {formatCurrency(b.commissionAmount || 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatCurrency(b.nurseEarningsAmount || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {b.paymentStatus || "UNPAID"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reconcile Payment */}
      {activeTab === "reconcile_payment" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs max-w-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Reconcile Patient Payment</h2>
              <p className="text-[11px] text-slate-500">Record verification of bank transfer, cash, or UPI transaction</p>
            </div>
          </div>

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleReconcilePayment} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Unreconciled Booking
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
              >
                <option value="">-- Choose a booking to reconcile --</option>
                {unpaidBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.bookingCode || b.id.slice(-6)} - {b.service?.name} ({b.patientName || b.patient?.fullName}) - {formatCurrency(b.totalPatientAmount || b.servicePrice)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash Collected at Doorstep</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Transaction Reference / UTR Number
              </label>
              <input
                type="text"
                placeholder="e.g. UPI-20261021-987654"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedBookingId}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reconciling with Neon DB...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Payment & Mark Reconciled</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Weekly Payout Batches */}
      {activeTab === "payout_batches" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs max-w-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Weekly Sangli Nurse Settlement</h2>
              <p className="text-[11px] text-slate-500">Automated batch payout aggregation for all completed verified visits</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Total Accrued Nurse Payables:</span>
              <span className="text-lg font-black text-emerald-950">{formatCurrency(totalNurseEarnings)}</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Batched every Monday for direct IMPS wire transfer to verified nurse bank accounts.
            </p>
          </div>

          {batchMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
              {batchMessage}
            </div>
          )}

          <button
            onClick={handleGenerateBatch}
            disabled={isBatching || totalNurseEarnings === 0}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isBatching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Aggregating Payables...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Generate Weekly Payout Batch</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
