'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { nurseAccessLoginAction } from '@/actions/nurses';
import {
  Stethoscope,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

function NurseLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/nurse';

  const [activeTab, setActiveTab] = useState<'ID_LOGIN' | 'PASSWORD_LOGIN'>('ID_LOGIN');

  // ID Login
  const [nurseCode, setNurseCode] = useState('');
  const [idLoading, setIdLoading] = useState(false);
  const [idSuccess, setIdSuccess] = useState(false);

  // Password Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // 1. Direct Nurse ID Login (No Password needed)
  const handleIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nurseCode.trim()) {
      setError('कृपया तुमचा Nurse ID टाका / Please enter your Nurse ID.');
      return;
    }

    setIdLoading(true);
    try {
      const res = await nurseAccessLoginAction(nurseCode.trim());
      if (res.success && res.redirectUrl) {
        setIdSuccess(true);
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || 'वैध Nurse ID आढळला नाही.');
        setIdLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setIdLoading(false);
    }
  };

  // 2. Mobile/ID + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPwdLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      if (data.user?.role !== 'NURSE' && data.user?.role !== 'ADMIN') {
        throw new Error('This login is strictly reserved for verified nurses.');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient medical glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/50 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/25">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Careoon Nurse Portal
        </h1>
        <p className="text-xs text-teal-700 font-bold uppercase tracking-wider">
          Sangli - Miraj Verified Healthcare Network
        </p>
        <span className="inline-block px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800">
          Private Nursing Staff Access (परिचारिका लॉगिन)
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-5 text-xs">
          
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ID_LOGIN');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'ID_LOGIN'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              १-स्टेप Nurse ID ने
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('PASSWORD_LOGIN');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'PASSWORD_LOGIN'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मोबाईल + पासवर्ड
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Direct Nurse ID Access */}
          {activeTab === 'ID_LOGIN' && (
            <>
              {idSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="text-base font-extrabold text-slate-900">Nurse ID Verified!</h3>
                  <p className="text-xs text-slate-500">Opening your Sangli clinical dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleIdLogin} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nurse Access Code / ID (Nurse ID कोड टाका) *
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Admin कडून मिळालेला युनिक कोड (उदा. SANGLI-RN-7401)
                    </p>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={nurseCode}
                        onChange={(e) => setNurseCode(e.target.value.toUpperCase())}
                        placeholder="SANGLI-RN-XXXX"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-black text-sm uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={idLoading}
                    className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <span>{idLoading ? "Verifying Access ID..." : "Open Nurse Dashboard (डॅशबोर्ड उघडा)"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

          {/* TAB 2: Mobile/ID + Password */}
          {activeTab === 'PASSWORD_LOGIN' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Mobile Number or Nurse ID *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="9822XXXXXX or SANGLI-RN-XXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>{pwdLoading ? "Signing In..." : "Sign In to Nurse Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>New nurse? Contact Admin for Sangli license verification.</span>
            <Link href="/" className="hover:text-slate-800 transition">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NurseLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <NurseLoginForm />
    </Suspense>
  );
}
