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

  const activeServices = services.filter((s) => s.isActive);

  const filteredServices = activeServices.filter((service) => {
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
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Book Home Nursing
        </h1>
        <p className="text-xs text-zinc-500">
          Admin-verified registered nurses for post-op, wounds, & infusions.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search surgical dressing, IV therapy..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:text-zinc-400"
        />
      </div>

      {/* Category Pills Carousel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
          }`}
        >
          All Procedures
        </button>
        {categories
          .filter((c) => c.isActive)
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Services List */}
      <div className="space-y-3 pt-1">
        {filteredServices.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Info className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              No matching home nursing services found.
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Try adjusting your search query or selecting all categories.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-900 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {service.durationMinutes} mins
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Nurse Required
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <Link
                  href={`/patient/services/${service.id}`}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-0.5"
                >
                  View Details
                </Link>

                <Link
                  href={`/patient/book/${service.id}`}
                  className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
