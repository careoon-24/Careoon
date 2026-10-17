"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Layers,
  Edit2,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  MapPin,
  X,
  ShieldCheck,
} from "lucide-react";

export default function AdminServicesPage() {
  const {
    services,
    categories,
    adminSaveService,
    adminToggleServiceStatus,
    bookings,
  } = useCareoon();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "");
  const [description, setDescription] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number>(120);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(20.0);
  const [serviceAreasStr, setServiceAreasStr] = useState<string>("10001, 10002, 10003, 10004");
  const [eligibilityStr, setEligibilityStr] = useState<string>(
    "Requires physician prescription or hospital discharge summary"
  );
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setBasePrice(100);
    setDurationMinutes(60);
    setCommissionPercentage(20.0);
    setServiceAreasStr("10001, 10002, 10003, 10004");
    setEligibilityStr("Requires active clinical doctor prescription");
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setCategoryId(service.categoryId);
    setDescription(service.description);
    setBasePrice(service.basePrice);
    setDurationMinutes(service.durationMinutes);
    setCommissionPercentage(service.commissionPercentage);
    setServiceAreasStr(service.serviceAreas.join(", "));
    setEligibilityStr(service.eligibilityConditions.join("\n"));
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim()) {
      setFormError("Service name is required.");
      return;
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      setFormError("Commission percentage must be strictly between 0% and 100%.");
      return;
    }

    if (basePrice <= 0) {
      setFormError("Base service price must be greater than $0.");
      return;
    }

    const areas = serviceAreasStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const eligibility = eligibilityStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = adminSaveService({
      id: editingService ? editingService.id : undefined,
      name,
      categoryId,
      description,
      basePrice,
      durationMinutes,
      commissionPercentage,
      serviceAreas: areas,
      eligibilityConditions: eligibility,
    });

    if (res.success) {
      setFormSuccess(
        editingService
          ? `Service "${name}" updated. Commission rate saved at ${commissionPercentage}%. Existing bookings retain their locked snapshots.`
          : `Service "${name}" created with ${commissionPercentage}% platform commission.`
      );
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } else {
      setFormError(res.error || "Failed to save service.");
    }
  };

  // Preview Calculations
  const previewCommission = Math.round((basePrice * (commissionPercentage / 100)) * 100) / 100;
  const previewNursePayout = Math.round((basePrice - previewCommission) * 100) / 100;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Services & Commission Rates
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Configure clinical procedures, pricing, and <strong>mandatory platform commission percentage</strong>.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Clinical Service
        </button>
      </div>

      {/* Snapshot Protection Notice */}
      <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-purple-950 dark:text-purple-100">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          Snapshot Immutability Guarantee
        </div>
        <p className="text-purple-800 dark:text-purple-300">
          When an admin sets or changes a commission rate here, it applies to all <strong>future bookings</strong>. Every confirmed booking stores an immutable <code>lockedCommissionPercentage</code> snapshot, ensuring financial history and nurse payables are never retroactively corrupted.
        </p>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Service Procedure</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3 font-extrabold text-purple-700 dark:text-purple-400">
                  Commission %
                </th>
                <th className="py-3 px-3">Est. Nurse Net</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {services.map((service) => {
                const category = categories.find((c) => c.id === service.categoryId);
                const nurseNet = service.basePrice - (service.basePrice * service.commissionPercentage) / 100;
                const activeBookingsOnService = bookings.filter((b) => b.serviceId === service.id).length;

                return (
                  <tr key={service.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                      <div>{service.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {service.durationMinutes}m duration • {service.serviceAreas.length} zip codes
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400">
                      {category?.name || "Uncategorized"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(service.basePrice)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                        {service.commissionPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-teal-600 dark:text-teal-400">
                      {formatCurrency(nurseNet)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                        }`}
                      >
                        {service.isActive ? "Active / Bookable" : "Paused"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => adminToggleServiceStatus(service.id)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline font-medium"
                      >
                        {service.isActive ? "Pause" : "Activate"}
                      </button>
                      <button
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingService ? "Edit Service & Commission Rate" : "Add New Clinical Procedure"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PICC Line Dressing & Heparin Flush"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing & Commission Setting */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="font-bold text-xs text-purple-950 dark:text-purple-200 flex items-center justify-between">
                  <span>Price & Platform Commission Configuration</span>
                  <Percent className="w-3.5 h-3.5 text-purple-600" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Standard Base Price ($)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300">
                      Careoon Commission (% Rate)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      required
                      value={commissionPercentage}
                      onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border-2 border-purple-500 text-xs font-black text-purple-700 dark:text-purple-300 outline-hidden"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/60 text-center text-[11px]">
                  <div>
                    <div className="text-zinc-500">Gross Patient Fee</div>
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(basePrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700 font-bold">Careoon Revenue</div>
                    <div className="font-black text-purple-900 dark:text-purple-200">
                      {formatCurrency(previewCommission)} ({commissionPercentage}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-700 font-bold">Nurse Net Payout</div>
                    <div className="font-black text-teal-600 dark:text-teal-400">
                      {formatCurrency(previewNursePayout)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Service Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Eligible Service Areas (Comma separated postal codes)
                </label>
                <input
                  type="text"
                  value={serviceAreasStr}
                  onChange={(e) => setServiceAreasStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Eligibility Conditions (One per line)
                </label>
                <textarea
                  rows={2}
                  value={eligibilityStr}
                  onChange={(e) => setEligibilityStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                  {formSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  Save Service & Lock Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
