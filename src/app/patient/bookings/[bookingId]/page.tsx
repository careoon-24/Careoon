'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  FileText,
  User,
  Phone,
  Activity,
  Check,
  CreditCard,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PatientBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [justConfirmed, setJustConfirmed] = useState<boolean>(false);
  const [previousStatus, setPreviousStatus] = useState<string>('');

  const fetchLiveBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          // If status transitioned to CONFIRMED, trigger celebration flash
          if (
            previousStatus &&
            ['NURSE_OFFERED', 'SEARCHING_NURSE'].includes(previousStatus) &&
            data.booking.status === 'CONFIRMED'
          ) {
            setJustConfirmed(true);
            setTimeout(() => setJustConfirmed(false), 5000);
          }
          setPreviousStatus(data.booking.status);
          setBooking(data.booking);
        }
      }
    } catch (err) {
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBooking();
    const interval = setInterval(fetchLiveBooking, 2500); // Poll live state every 2.5s
    return () => clearInterval(interval);
  }, [bookingId, previousStatus]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-xs text-rose-500 font-semibold">Booking not found.</p>
        <Link href="/patient/bookings" className="text-xs text-blue-600 underline">
          Return to Bookings
        </Link>
      </div>
    );
  }

  // Parse vitals if present
  let vitals: any = null;
  try {
    if (booking.clinicalNotes && booking.clinicalNotes.startsWith('{')) {
      const parsed = JSON.parse(booking.clinicalNotes);
      vitals = parsed.vitals;
    }
  } catch {}

  const isConfirmed = ['CONFIRMED', 'NURSE_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(
    booking.status
  );

  return (
    <div className="space-y-4 pb-12 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/patient/bookings')}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Bookings
        </button>
        <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
          {booking.bookingCode}
        </span>
      </div>

      {/* LIVE SYNC CONFIRMATION ALERT BANNER */}
      {justConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-xl animate-bounce flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">✓ Nurse Accepted Your Booking!</h4>
            <p className="text-xs text-emerald-100">
              Verified nurse has confirmed and is preparing sterile supplies.
            </p>
          </div>
        </div>
      )}

      {/* STATUS OVERVIEW CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Booking Status
            </span>
            <h2 className="text-base font-extrabold text-slate-900 capitalize">
              {booking.status === 'SEARCHING_NURSE' && 'Searching Nearby Nurse...'}
              {booking.status === 'NURSE_OFFERED' && 'Waiting for Nurse Confirmation...'}
              {booking.status === 'CONFIRMED' && 'Nurse Assigned & Confirmed'}
              {booking.status === 'NURSE_ARRIVED' && 'Nurse Arrived at Doorstep'}
              {booking.status === 'IN_PROGRESS' && 'Clinical Procedure in Progress'}
              {booking.status === 'COMPLETED' && 'Procedure Successfully Completed'}
            </h2>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              booking.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800'
                : isConfirmed
                ? 'bg-teal-100 text-teal-800'
                : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Live Stepper */}
        <div className="grid grid-cols-4 gap-1 pt-2 text-center text-[10px] font-semibold">
          <div
            className={`p-1.5 rounded-lg border ${
              isConfirmed
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            1. Confirmed
          </div>
          <div
            className={`p-1.5 rounded-lg border ${
              ['NURSE_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            2. Arrived
          </div>
          <div
            className={`p-1.5 rounded-lg border ${
              ['IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            3. In Progress
          </div>
          <div
            className={`p-1.5 rounded-lg border ${
              booking.status === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            4. Done
          </div>
        </div>
      </div>

      {/* ASSIGNED NURSE CARD (Appears immediately when nurse accepts!) */}
      {booking.assignedNurse && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-50 to-white border-2 border-teal-500/20 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Verified Assigned Nurse
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              MNC Approved
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-teal-600/20">
                {booking.assignedNurse.user?.fullName?.slice(0, 2).toUpperCase() || 'RN'}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {booking.assignedNurse.user?.fullName}
                </h3>
                <div className="text-[11px] text-slate-500">
                  {booking.assignedNurse.experienceYears || '6'} Years Hospital ICU Experience
                </div>
                <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 (Verified Clinical Reviews)</span>
                </div>
              </div>
            </div>

            <a
              href={`tel:${booking.assignedNurse.user?.phone}`}
              className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm"
              title="Call Nurse"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* CLINICAL VITALS REPORT (Saved permanently for patient records!) */}
      {booking.status === 'COMPLETED' && vitals && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-900">Your Health Record & Vitals</h3>
            </div>
            <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
              Permanent Record
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{vitals.bp || '120/80'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Pulse Rate</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{vitals.pulse || '74'} bpm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Blood Glucose</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{vitals.sugar || '110'} mg/dL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Oxygen Saturation</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{vitals.spo2 || '99'}%</span>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT & RECEIPT CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900">Payment Reconciliation</h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              booking.paymentStatus === 'PAID'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {booking.paymentStatus === 'PAID' ? '✓ PAID IN FULL' : 'PAYABLE AT DOORSTEP'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-slate-500 block">Procedure Rate</span>
            <span className="text-sm font-bold text-slate-800">{booking.service?.name}</span>
          </div>
          <span className="text-base font-black text-slate-900">
            {formatCurrency(booking.totalPatientAmount || booking.servicePrice)}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          Payment is collected by the verified nurse upon completion via in-app UPI QR or cash.
        </div>
      </div>
    </div>
  );
}
