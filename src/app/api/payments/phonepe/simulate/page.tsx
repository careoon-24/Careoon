'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Smartphone, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function PhonePeSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const txnId = searchParams.get('txnId') || `TXN_${Date.now()}`;
  const amount = Number(searchParams.get('amount') || 0);
  const code = searchParams.get('code') || 'CRN-2026';

  const handleSimulate = (status: 'SUCCESS' | 'FAILURE') => {
    router.push(`/api/payments/phonepe/callback?bookingId=${bookingId}&txnId=${txnId}&status=${status}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5 text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/20">
            Pe
          </div>
          <div className="text-left">
            <span className="font-black text-slate-900 block leading-tight">PhonePe Payment Gateway</span>
            <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">UAT Sandbox Simulator</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
          <span className="text-xs text-purple-900 font-medium">Paying to: <strong>Careoon Healthcare (Sangli - Miraj)</strong></span>
          <div className="text-3xl font-black text-purple-950 mt-1">
            {formatCurrency(amount)}
          </div>
          <p className="text-[11px] text-purple-700 font-mono mt-0.5">
            Booking ID: {code} • {txnId}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>UPI Intent & QR Testing Mode</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            हा PhonePe चा सुरक्षित UAT टेस्ट मोड आहे. सुवर्णा मॅडमचे मर्चंट की येईपर्यंत सिस्टीम टेस्ट करण्यासाठी खालील बटनांवर क्लिक करा:
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => handleSimulate('SUCCESS')}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Payment SUCCESS (पेमेंट यशस्वी करा)</span>
          </button>

          <button
            onClick={() => handleSimulate('FAILURE')}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Simulate Payment FAILURE (पेमेंट रद्द करा)</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Secure 256-bit Encrypted Transaction • Maharashtra Nursing Network
        </div>
      </div>
    </div>
  );
}

export default function PhonePeSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PhonePeSimulatorContent />
    </Suspense>
  );
}
