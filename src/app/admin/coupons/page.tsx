"use client";

import React, { useState, useEffect } from "react";
import {
  adminGetCouponsAction,
  adminCreateCouponAction,
  adminToggleCouponAction,
  adminDeleteCouponAction,
} from "@/actions/coupons";
import { formatCurrency } from "@/lib/utils";
import {
  Tag,
  Plus,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  RefreshCw,
  Sparkles,
  Ticket,
  Copy,
  Check,
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(100);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(300);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await adminGetCouponsAction();
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setFormError("Coupon code is required.");
      return;
    }

    if (discountValue <= 0) {
      setFormError("Discount value must be greater than 0.");
      return;
    }

    setIsSaving(true);
    try {
      await adminCreateCouponAction({
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        expiresAt: expiresAt || undefined,
      });

      // Reset
      setCode("");
      setDescription("");
      setDiscountValue(100);
      setMinOrderAmount(300);
      setMaxDiscountAmount("");
      setExpiresAt("");
      setIsModalOpen(false);
      await loadCoupons();
    } catch (err: any) {
      setFormError(err.message || "Failed to create coupon.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (couponId: string, currentStatus: boolean) => {
    try {
      await adminToggleCouponAction(couponId, !currentStatus);
      await loadCoupons();
    } catch (err: any) {
      alert("Failed to update coupon status: " + err.message);
    }
  };

  const handleDelete = async (couponId: string, couponCode: string) => {
    if (confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) {
      try {
        await adminDeleteCouponAction(couponId);
        await loadCoupons();
      } catch (err: any) {
        alert("Failed to delete coupon: " + err.message);
      }
    }
  };

  const copyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Coupons & Promotional Discounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
              Live Neon DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create and distribute launch promotional codes for Sangli patients. Applied during doorstep booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>

          <button
            onClick={loadCoupons}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-900">Active Coupons</span>
            <span className="text-xs text-slate-400 font-medium">({coupons.length} Total)</span>
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800">
              No Coupons in Database
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Create New Coupon&quot; to offer personal discounts to your first patients in Sangli.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Promo Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const isCopied = copiedCode === coupon.code;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            title="Copy code"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 text-sm">
                        {coupon.discountType === "PERCENT"
                          ? `${coupon.discountValue}% Off`
                          : `₹${coupon.discountValue} Flat Off`}
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-semibold">
                        {formatCurrency(coupon.minOrderAmount)}
                      </td>

                      <td className="py-4 px-4 font-bold text-teal-600">
                        {coupon.usageCount} visits
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {coupon.isActive ? "Active / Usable" : "Paused"}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleToggle(coupon.id, coupon.isActive)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                        >
                          {coupon.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Create Promotional Coupon
                </h3>
                <p className="text-[11px] text-slate-500">
                  Patients can enter this code at booking time for instant discount.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coupon Code (कूपन कोड) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SANGLI100 or WELCOME50"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-purple-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Offer Description (वर्णन)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Flat ₹100 Off for first-time Sangli patient"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="FIXED">Flat ₹ Amount</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-md shadow-purple-600/20"
                >
                  {isSaving ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
