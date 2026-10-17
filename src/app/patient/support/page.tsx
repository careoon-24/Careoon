"use client";

import React, { useState } from "react";
import { useCareoon } from "@/context/CareoonContext";
import { TicketCategory } from "@/types";
import { HelpCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PatientSupportPage() {
  const { currentUser, bookings, fileTicket, tickets } = useCareoon();

  const [bookingId, setBookingId] = useState<string>("");
  const [category, setCategory] = useState<TicketCategory>("clinical_concern");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const patientBookings = bookings.filter((b) =>
    currentUser ? b.patientId === currentUser.id : true
  );

  const patientTickets = tickets.filter((t) =>
    currentUser ? t.reporterId === currentUser.id : true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !description.trim()) {
      setError("Please fill in both the subject and description.");
      return;
    }

    const res = fileTicket(bookingId || undefined, category, subject, description);
    if (res.success) {
      setSuccess(true);
      setSubject("");
      setDescription("");
      setBookingId("");
    } else {
      setError(res.error || "Failed to submit ticket.");
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Care Support & Help
        </h1>
        <p className="text-xs text-zinc-500">
          Report an issue, request billing assistance, or discuss clinical care.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your support ticket has been received by the clinical care desk.</span>
        </div>
      )}

      {/* New Support Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          File a Care Ticket
        </h2>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Related Booking (Optional)
          </label>
          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
          >
            <option value="">General Inquiry / No specific booking</option>
            {patientBookings.map((b) => (
              <option key={b.id} value={b.id}>
                #{b.id.slice(-6)} — {formatDate(b.scheduledDate)} ({b.status})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
          >
            <option value="clinical_concern">Clinical Concern / Medication Question</option>
            <option value="no_show">Nurse No-Show or Late Arrival</option>
            <option value="payment">Payment & Receipt Reconciliation</option>
            <option value="cancellation">Cancellation Policy Dispute</option>
            <option value="other">Other Inquiry</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Subject
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Question regarding IV dressing aftercare"
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Detailed Description
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the situation in detail so our supervisory RN can assist immediately."
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs outline-hidden"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Submit Ticket
        </button>
      </form>

      {/* Ticket History */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          My Past Tickets ({patientTickets.length})
        </h2>
        {patientTickets.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">No previous support tickets filed.</p>
        ) : (
          <div className="space-y-2">
            {patientTickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-white">{t.subject}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">{t.description}</p>
                {t.resolutionNotes && (
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-[10px] text-teal-800 dark:text-teal-300 border-l-2 border-teal-500">
                    <span className="font-bold">Desk Resolution:</span> {t.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
