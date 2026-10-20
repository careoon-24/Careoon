'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-sm text-slate-500 mb-6">
          {reason === 'admin_only'
            ? 'This area requires verified Admin credentials with operations management authority.'
            : reason === 'nurse_only'
            ? 'This portal is reserved for registered and background-verified nursing professionals.'
            : 'You do not have the required permissions to view this resource.'}
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Switch Account / Log In
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
