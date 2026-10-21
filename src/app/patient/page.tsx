"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  ShieldCheck,
  ChevronRight,
  Search,
  Sparkles,
  Info,
} from "lucide-react";

export default function PatientServicesPage() {
  const { categories, services } = useCareoon();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setDbCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const dbServices = dbCategories.flatMap((c) =>
    (c.services || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description || s.shortDescription || "",
      basePrice: s.basePrice,
      durationMinutes: s.durationMinutes,
      categoryId: c.id,
      isActive: s.isActive,
    }))
  );

  const effectiveServices = dbServices;
  const effectiveCategories = dbCategories;

  const filteredServices = effectiveServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.categoryId === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header Search */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Book Home Nursing
        </h1>
        <p className="text-xs text-slate-500">
          Admin-verified registered nurses in Sangli-Miraj for post-op, wounds, & infusions.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search surgical dressing, IV therapy, catheter..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none placeholder:text-slate-400 transition"
        />
      </div>

      {/* Category Pills Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Procedures
        </button>
        {effectiveCategories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              selectedCategory === cat.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-3 pt-1">
        {filteredServices.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              No matching home nursing services found.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try adjusting your search query or selecting all categories.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {service.durationMinutes} mins
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    Sterile Kit Included
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Doorstep Visit in Sangli
                </span>

                <Link
                  href={`/patient/book/${service.id}`}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  Book Care
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
