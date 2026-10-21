'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Banknote,
  ShieldCheck,
  Activity,
  User,
  Phone,
  Timer,
  Check,
  X,
  FileCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { updateClinicalProgressAction } from '@/actions/bookings';
import { nurseCollectPaymentAction } from '@/actions/finance';

export default function NurseJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Clinical Vitals Form State
  const [bp, setBp] = useState<string>('120/80');
  const [pulse, setPulse] = useState<string>('74');
  const [sugar, setSugar] = useState<string>('110');
  const [spo2, setSpo2] = useState<string>('99');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Payment Collection State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(600); // 10 minutes countdown

  const fetchLiveBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
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
    const interval = setInterval(fetchLiveBooking, 3000); // Sync every 3s
    return () => clearInterval(interval);
  }, [bookingId]);

  // QR Timer Countdown
  useEffect(() => {
    if (qrTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setQrTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [qrTimeLeft]);

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
        <p className="text-xs text-rose-500 font-semibold">Job not found or unauthorized.</p>
        <Link href="/nurse" className="text-xs text-teal-600 underline">
          Return to Nurse Dashboard
        </Link>
      </div>
    );
  }

  const handleProgress = async (stage: 'ARRIVED' | 'STARTED' | 'COMPLETED') => {
    setActionLoading(true);
    setError('');
    try {
      const notesPayload = JSON.stringify({
        notes: clinicalNotes,
        vitals: { bp, pulse, sugar, spo2 },
      });
      await updateClinicalProgressAction(booking.id, stage, notesPayload);
      await fetchLiveBooking();
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentResolution = async (isDone: boolean) => {
    setActionLoading(true);
    setError('');
    try {
      await nurseCollectPaymentAction({
        bookingId: booking.id,
        method: paymentMethod,
        isDone,
        notes: paymentNotes || (isDone ? 'Payment collected at doorstep' : 'Payment disputed/failed'),
      });
      await fetchLiveBooking();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const totalAmount = booking.totalPatientAmount || booking.servicePrice;
  const upiQrString = `upi://pay?pa=careoon.upi@okhdfcbank&pn=Careoon%20Home%20Health&am=${totalAmount}&tr=${booking.bookingCode}&tn=Careoon%20${booking.bookingCode}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiQrString)}&margin=10`;

  return (
    <div className="space-y-4 pb-12 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/nurse')}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </button>
        <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
          {booking.bookingCode}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient & Procedure Summary Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
              Patient Information
            </span>
            <h2 className="text-sm font-bold text-slate-900">{booking.patientName || booking.patient?.fullName}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Age: {booking.patientAge || '58'}</span>
              <span>•</span>
              <span>Gender: {booking.patientGender || 'Female'}</span>
            </div>
          </div>

          <a
            href={`tel:${booking.patientContactPhone || booking.patient?.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800">{booking.addressLine}</div>
            <div className="text-[11px] text-slate-400">
              {booking.landmark ? `Near ${booking.landmark}, ` : ''}{booking.city} - {booking.postalCode}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Procedure</span>
            <span className="font-bold text-slate-800">{booking.service?.name}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Amount to Collect</span>
            <span className="text-sm font-extrabold text-slate-900">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* CLINICAL STATUS PROGRESSION STEPPER */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Clinical Progress Actions
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {/* Step 1: Arrived */}
          <button
            type="button"
            disabled={actionLoading || booking.status !== 'CONFIRMED'}
            onClick={() => handleProgress('ARRIVED')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              ['NURSE_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : booking.status === 'CONFIRMED'
                ? 'bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20'
                : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px]">
              {['NURSE_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? '✓ Arrived'
                : '1. Mark Arrived'}
            </span>
          </button>

          {/* Step 2: Start Care */}
          <button
            type="button"
            disabled={actionLoading || booking.status !== 'NURSE_ARRIVED'}
            onClick={() => handleProgress('STARTED')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              ['IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : booking.status === 'NURSE_ARRIVED'
                ? 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20'
                : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-[10px]">
              {['IN_PROGRESS', 'COMPLETED'].includes(booking.status)
                ? '✓ In Progress'
                : '2. Start Care'}
            </span>
          </button>

          {/* Step 3: Complete Care */}
          <button
            type="button"
            disabled={actionLoading || booking.status !== 'IN_PROGRESS'}
            onClick={() => handleProgress('COMPLETED')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
              booking.status === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                : booking.status === 'IN_PROGRESS'
                ? 'bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="text-[10px]">
              {booking.status === 'COMPLETED' ? '✓ Completed' : '3. Complete Care'}
            </span>
          </button>
        </div>
      </div>

      {/* CLINICAL VITALS LOGGER (Saved permanently into patient health record) */}
      {['IN_PROGRESS', 'COMPLETED'].includes(booking.status) && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Patient Health & Vitals Record
            </span>
            <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
              Saves to Patient History
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80 mmHg"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Pulse (BPM)</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72 bpm"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Blood Glucose</label>
              <input
                type="text"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="110 mg/dL"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">SpO2 Oxygen</label>
              <input
                type="text"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="99%"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500">Clinical Observations & Dressing Notes</label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Wound margins healthy, no erythema or exudate. Dressed with sterile povidone iodine."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC IN-APP UPI QR CODE & PAYMENT COLLECTION */}
      {['IN_PROGRESS', 'COMPLETED'].includes(booking.status) && (
        <div className="p-4 rounded-3xl bg-gradient-to-b from-white to-slate-50 border-2 border-teal-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Doorstep Payment Collection</h3>
                <span className="text-[10px] text-slate-500">Nurse Collection Responsibility</span>
              </div>
            </div>

            {/* Payment Status Pill */}
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
              }`}
            >
              {booking.paymentStatus === 'PAID' ? '✓ PAID' : 'PENDING PAYMENT'}
            </span>
          </div>

          {booking.paymentStatus === 'PAID' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 text-emerald-900">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <div className="text-xs font-bold">Payment Successfully Recorded</div>
              <div className="text-[11px] text-emerald-700 font-mono">
                Amount: {formatCurrency(totalAmount)} • Timestamp Logged in Audit Trail
              </div>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash in Hand</span>
                </button>
              </div>

              {/* Dynamic QR Code Display if UPI is selected */}
              {paymentMethod === 'UPI' && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      QR Valid for: {Math.floor(qrTimeLeft / 60)}:
                      {String(qrTimeLeft % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                    <img
                      src={qrImageUrl}
                      alt="Doorstep UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Ask patient to scan via GPay / PhonePe / Paytm: <br />
                    <span className="font-bold text-slate-800 text-xs">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    Cash Collection Protocol
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Please collect exactly <strong>{formatCurrency(totalAmount)}</strong> in cash from the patient.
                    Your weekly payout statement will reconcile this against your net earnings.
                  </p>
                </div>
              )}

              {/* Explicit Actions: DONE vs NOT DONE */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center">
                  Confirm Payment Status with Exact Timestamp
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePaymentResolution(true)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>✓ Payment DONE</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePaymentResolution(false)}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>✕ NOT Done</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
