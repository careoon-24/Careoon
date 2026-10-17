"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
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
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const { auditLogs } = useCareoon();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesType = filterType === "all" || log.entityType === filterType;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details.rationale && log.details.rationale.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Administrative Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Immutable system log of all administrative rate changes, credential verifications, and financial transactions.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "service", "nurse", "payment", "payout"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors capitalize ${
                filterType === type
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {type === "all" ? "All Entities" : `${type}s`}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search action or actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-hidden"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              No audit records matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {log.entityType} #{log.entityId.slice(-6)}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-400" />
                  <span>
                    Executed by: <strong>{log.actorName}</strong> ({log.actorRole})
                  </span>
                </div>

                {log.details.rationale && (
                  <p className="text-[11px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Rationale:</span>{" "}
                    {log.details.rationale}
                  </p>
                )}

                {log.details.after && (
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 overflow-x-auto">
                    Data: {JSON.stringify(log.details.after)}
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
