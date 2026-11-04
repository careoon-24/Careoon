"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  ExternalLink,
  X,
  UserCheck,
  Building,
  Activity,
  HeartPulse,
} from "lucide-react";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalPatients: 0,
    patientsWithBookings: 0,
    sangliCityCount: 0,
    chronicPatientsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      if (data.success && data.patients) {
        setPatients(data.patients);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load patients database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.addressStreet && p.addressStreet.toLowerCase().includes(q)) ||
      (p.addressCity && p.addressCity.toLowerCase().includes(q));

    let matchesFilter = true;
    if (filterType === "has_bookings") {
      matchesFilter = p.patientBookings && p.patientBookings.length > 0;
    } else if (filterType === "chronic") {
      matchesFilter = Boolean(p.chronicConditions && p.chronicConditions.trim());
    } else if (filterType === "sangli") {
      matchesFilter = (p.addressCity || "").toLowerCase().includes("sangli");
    } else if (filterType === "miraj") {
      matchesFilter =
        (p.addressCity || "").toLowerCase().includes("miraj") ||
        (p.addressStreet || "").toLowerCase().includes("miraj");
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Patients Database & Clinical Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
              Live Neon DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified Sangli - Miraj patient profiles, emergency contacts, chronic conditions, and appointment history.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.totalPatients}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Registered User Profiles</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>With Care Bookings</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.patientsWithBookings}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              ({metrics.totalPatients > 0 ? Math.round((metrics.patientsWithBookings / metrics.totalPatients) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Scheduled / Completed Care</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Sangli - Miraj Local</span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.sangliCityCount}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Verified Doorstep Addresses</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
            <span>Chronic Conditions</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-950">
            {metrics.chronicPatientsCount}
          </div>
          <div className="text-[10px] text-rose-700 font-medium">Medical Watch / Ongoing Care</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Patients" },
            { id: "has_bookings", label: "Has Bookings" },
            { id: "chronic", label: "Chronic Conditions" },
            { id: "sangli", label: "Sangli City" },
            { id: "miraj", label: "Miraj" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search name, phone, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient Name & Demographics</th>
                <th className="py-3 px-4">Contact Phone (10-Digit)</th>
                <th className="py-3 px-4">Sangli Address</th>
                <th className="py-3 px-4">Medical Profile</th>
                <th className="py-3 px-4">Bookings</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                      <span>Loading patients database from Neon Cloud...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No patient records found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const bookingCount = p.patientBookings ? p.patientBookings.length : 0;
                  const latestBooking = bookingCount > 0 ? p.patientBookings[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Demographics */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {p.fullName ? p.fullName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {p.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              {p.age && <span>{p.age} Yrs</span>}
                              {p.gender && <span>• {p.gender}</span>}
                              {p.bloodGroup && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                                  {p.bloodGroup}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4 font-mono">
                        <a
                          href={`tel:${p.phone}`}
                          className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span>{p.phone}</span>
                        </a>
                        {p.email && (
                          <div className="text-[10px] text-slate-400 font-sans truncate max-w-[150px]">
                            {p.email}
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-start gap-1 max-w-[180px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 text-[11px]">
                            {p.addressStreet ? `${p.addressStreet}, ` : ""}
                            {p.addressCity || "Sangli"} ({p.addressPincode || "416416"})
                          </span>
                        </div>
                      </td>

                      {/* Medical Profile */}
                      <td className="py-3.5 px-4">
                        {p.chronicConditions ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 line-clamp-1 max-w-[140px]">
                            {p.chronicConditions}
                          </span>
                        ) : p.allergies ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Allergies: {p.allergies}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None recorded</span>
                        )}
                      </td>

                      {/* Bookings */}
                      <td className="py-3.5 px-4">
                        {bookingCount > 0 ? (
                          <div>
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                              {bookingCount} {bookingCount === 1 ? "Visit" : "Visits"}
                            </span>
                            {latestBooking && (
                              <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px]">
                                Last: {latestBooking.service?.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">0 Bookings</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedPatient(p)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Patient Drawer / Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                  {selectedPatient.fullName ? selectedPatient.fullName.charAt(0).toUpperCase() : "P"}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    {selectedPatient.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedPatient.id.slice(0, 8)}... • Registered {formatDate(selectedPatient.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contact & Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Contact Information
                </span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedPatient.phone}</span>
                </div>
                {selectedPatient.email && (
                  <div className="text-slate-600 flex items-center gap-2 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedPatient.email}</span>
                  </div>
                )}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${selectedPatient.phone}`}
                    className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Phone className="w-3 h-3" />
                    Call Patient
                  </a>
                  <a
                    href={`https://wa.me/91${selectedPatient.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sangli Doorstep Address
                </span>
                <div className="text-slate-800 font-semibold leading-relaxed">
                  {selectedPatient.addressApartment && `${selectedPatient.addressApartment}, `}
                  {selectedPatient.addressStreet || "Street address not filled yet"}
                  <br />
                  {selectedPatient.addressCity || "Sangli"} - {selectedPatient.addressPincode || "416416"}
                </div>
              </div>
            </div>

            {/* Clinical & Emergency Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Emergency Contact
                </span>
                <div className="font-bold text-slate-900">
                  {selectedPatient.emergencyContactName || "Not provided"}
                </div>
                {selectedPatient.emergencyContactPhone && (
                  <a
                    href={`tel:${selectedPatient.emergencyContactPhone}`}
                    className="text-teal-700 font-mono font-bold hover:underline block"
                  >
                    📞 {selectedPatient.emergencyContactPhone}
                  </a>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Medical Notes & Conditions
                </span>
                <div className="text-slate-800">
                  <strong>Chronic:</strong> {selectedPatient.chronicConditions || "None"}
                </div>
                <div className="text-slate-800">
                  <strong>Allergies:</strong> {selectedPatient.allergies || "None"}
                </div>
              </div>
            </div>

            {/* Saved Family Members */}
            {selectedPatient.savedFamilyMembers && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Saved Family Members
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(() => {
                    try {
                      const list = JSON.parse(selectedPatient.savedFamilyMembers);
                      if (!Array.isArray(list) || list.length === 0) return <p className="text-slate-400">None saved.</p>;
                      return list.map((m: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                          <div className="font-bold text-purple-950">{m.name}</div>
                          <div className="text-[11px] text-purple-700">{m.relationship} • {m.age} Yrs ({m.gender})</div>
                        </div>
                      ));
                    } catch {
                      return <p className="text-slate-400">No family members.</p>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Bookings History */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Care Bookings History ({selectedPatient.patientBookings?.length || 0})
              </span>

              {(!selectedPatient.patientBookings || selectedPatient.patientBookings.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                  No bookings placed by this patient yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedPatient.patientBookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {b.service?.name || "Clinical Procedure"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          #{b.bookingCode || b.id.slice(-6)} • {b.scheduledDate} ({b.scheduledTime})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-slate-900">
                          {formatCurrency(b.totalPatientAmount || b.servicePrice)}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
