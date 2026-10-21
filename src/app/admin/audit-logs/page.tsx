"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  FileSpreadsheet,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  History,
  RefreshCw,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesType =
      filterType === "all" ||
      (log.entityType && log.entityType.toLowerCase() === filterType.toLowerCase());

    const actorName = log.actor?.fullName || log.actorRole || "";
    const action = log.action || "";
    const details = log.newValues || "";

    const matchesSearch =
      action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable database log of all bookings, offer dispatches, credential verifications, and pricing changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin text-teal-600" : ""}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "booking", "service", "nurse", "payment", "coupon"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors capitalize ${
                filterType === type
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "all" ? "All Logs" : `${type}s`}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search action or actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="divide-y divide-slate-100 text-xs">
          {isLoading && auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Fetching audit records from database...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No audit records matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {log.entityType} #{log.entityId ? log.entityId.slice(-6) : "N/A"}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Executed by: <strong>{log.actor?.fullName || "System Admin"}</strong> ({log.actorRole || log.actor?.role || "SYSTEM"})
                  </span>
                </div>

                {log.newValues && (
                  <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto">
                    {log.newValues}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
