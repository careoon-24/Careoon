"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  adminCreateServiceAction,
  adminUpdateServiceAction,
  adminDeleteServiceAction,
  adminToggleServiceAction,
  adminCreateCategoryAction,
} from "@/actions/services";
import {
  Plus,
  Layers,
  Edit2,
  Clock,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Trash2,
  FolderPlus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Service Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");

  // Form State
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number>(750);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(15.0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        const all = data.categories.flatMap((cat: any) =>
          (cat.services || []).map((s: any) => ({
            ...s,
            categoryName: cat.name,
            categoryId: cat.id,
          }))
        );
        setServices(all);
        if (data.categories.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setBasePrice(750);
    setDurationMinutes(45);
    setCommissionPercentage(15.0);
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setName(service.name);
    setCategoryId(service.categoryId);
    setDescription(service.description);
    setBasePrice(service.basePrice);
    setDurationMinutes(service.durationMinutes);
    setCommissionPercentage(service.commissionPercent || 15.0);
    setFormError("");
    setFormSuccess("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim()) {
      setFormError("Service name is required.");
      return;
    }

    if (!categoryId) {
      setFormError("Please select or create a Service Category first.");
      return;
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      setFormError("Commission percentage must be between 0% and 100%.");
      return;
    }

    if (basePrice <= 0) {
      setFormError("Base price must be greater than ₹0.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingService) {
        await adminUpdateServiceAction(editingService.id, {
          name,
          categoryId,
          description,
          basePrice: Number(basePrice),
          durationMinutes: Number(durationMinutes),
          commissionPercent: Number(commissionPercentage),
        });
        setFormSuccess(`Service "${name}" updated successfully.`);
      } else {
        await adminCreateServiceAction({
          name,
          categoryId,
          description,
          basePrice: Number(basePrice),
          durationMinutes: Number(durationMinutes),
          commissionPercent: Number(commissionPercentage),
        });
        setFormSuccess(`Service "${name}" published in real-time.`);
      }

      await loadData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Failed to save service to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await adminCreateCategoryAction({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
        displayOrder: categories.length + 1,
      });
      setNewCatName("");
      setNewCatDesc("");
      setIsCategoryModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert("Failed to create category: " + err.message);
    }
  };

  const handleToggle = async (serviceId: string, currentStatus: boolean) => {
    try {
      await adminToggleServiceAction(serviceId, !currentStatus);
      await loadData();
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (confirm(`Are you sure you want to delete "${serviceName}" from the platform?`)) {
      try {
        await adminDeleteServiceAction(serviceId);
        await loadData();
      } catch (err: any) {
        alert("Failed to delete service: " + err.message);
      }
    }
  };

  // Preview Calculations
  const previewCommission = Math.round(basePrice * (commissionPercentage / 100));
  const previewNursePayout = Math.round(basePrice - previewCommission);

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Clinical Procedures & Pricing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
              Live Neon DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage procedures, pricing in ₹, duration, and mandatory Careoon commission percentage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            <FolderPlus className="w-4 h-4 text-purple-600" />
            <span>New Category</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clinical Procedure</span>
          </button>
        </div>
      </div>

      {/* Snapshot Protection Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50/50 dark:from-purple-950/40 dark:via-zinc-900 dark:to-purple-950/20 border border-purple-200 dark:border-purple-800/80 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-purple-950 dark:text-purple-100">
            Real-Time Neon Database Synchronization
          </div>
          <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5 leading-relaxed">
            Every procedure added, edited, or deleted here updates the live Cloud PostgreSQL database instantly. The changes immediately reflect on the public Homepage and Patient Booking screen.
          </p>
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-900 dark:text-white">Published Services</span>
            <span className="text-xs text-slate-400 font-medium">({services.length} Total)</span>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              Zero Procedures in Database
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your database is 100% clean. Click &quot;Add Clinical Procedure&quot; above to create your first verified home nursing service.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Clinical Procedure</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Patient Rate</th>
                  <th className="py-3.5 px-4 font-black text-purple-700 dark:text-purple-400">
                    Commission %
                  </th>
                  <th className="py-3.5 px-4">Est. Nurse Net</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {services.map((service) => {
                  const commission = service.commissionPercent || 15.0;
                  const nurseNet = service.basePrice - (service.basePrice * commission) / 100;

                  return (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        <div className="text-sm">{service.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-teal-600" />
                          <span>{service.durationMinutes} mins duration</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {service.categoryName || "Clinical Care"}
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(service.basePrice)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border border-purple-200">
                          {commission.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-teal-600 dark:text-teal-400 text-xs">
                        {formatCurrency(nurseNet)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            service.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 dark:bg-zinc-800 border border-slate-200"
                          }`}
                        >
                          {service.isActive ? "Active / Bookable" : "Paused"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleToggle(service.id, service.isActive)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
                        >
                          {service.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.name)}
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

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingService ? "Edit Clinical Procedure" : "Add New Clinical Procedure"}
                </h3>
                <p className="text-xs text-slate-500">Saves directly into live Neon PostgreSQL.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Surgical Wound Dressing (Aseptic)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Description & Sterile Protocol
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe sterile kit requirements, aseptic cleaning, and post-procedure monitoring..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Rate (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Careoon Platform Commission (%)
                  </label>
                  <span className="font-black text-purple-600">{commissionPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="mt-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex justify-between text-xs">
                  <span>Careoon Revenue: <strong>{formatCurrency(previewCommission)}</strong></span>
                  <span className="text-teal-600 font-bold">Nurse Net: <strong>{formatCurrency(previewNursePayout)}</strong></span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 active:scale-95 transition"
                >
                  {isSaving ? "Saving to Cloud DB..." : editingService ? "Update Procedure" : "Publish Procedure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Add Clinical Category
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g., Post-Operative Clinical Care"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Specialized care after major surgeries and hospital discharge..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-md shadow-purple-600/20"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
