"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
} from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { services, categories } = useCareoon();

  const serviceId = params?.serviceId as string;
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
        <h2 className="text-sm font-semibold">Service Not Found</h2>
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-xs text-blue-600 underline font-medium"
        >
          Return to Service Catalog
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === service.categoryId);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </button>

      {/* Main Service Card */}
      <div className="space-y-3">
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {category?.name || "Home Nursing"}
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
          {service.name}
        </h1>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
          <div>
            <div className="text-[11px] text-zinc-400 font-medium">Fixed Standard Price</div>
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrency(service.basePrice)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-zinc-400 font-medium">Estimated Duration</div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {service.durationMinutes} Minutes
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Description */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Procedure Overview
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {service.description}
        </p>
      </div>

      {/* Eligibility Requirements */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Patient Eligibility Requirements
        </h3>
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          {service.eligibilityConditions.map((condition, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{condition}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Service Areas */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Active Coverage Areas
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {service.serviceAreas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <MapPin className="w-3 h-3 text-zinc-400" />
              Zip {area}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4">
        <Link
          href={`/patient/book/${service.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          Proceed to Nurse Selection
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
