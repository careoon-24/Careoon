'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Phone,
  User,
  ShieldCheck,
  MapPin,
  Shield,
  Stethoscope,
  Sparkles,
  KeyRound,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [portalRole, setPortalRole] = useState<'PATIENT' | 'NURSE' | 'ADMIN'>('PATIENT');
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: 'PATIENT' | 'NURSE' | 'ADMIN') => {
    setPortalRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setActiveTab('LOGIN');
      setEmail('admin@careoon.com');
      setPassword('admin123');
    } else if (role === 'NURSE') {
      setActiveTab('LOGIN');
      setEmail('');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'LOGIN') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid email or password');

        router.push(redirectPath || data.redirectUrl);
        router.refresh();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            phone,
            fullName,
            password,
            role: 'PATIENT',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        router.push(redirectPath || '/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient medical glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/50 via-emerald-50/30 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-600/25 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">Careoon</span>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Home Nursing Care</span>
          </div>
        </Link>

        {/* Exclusive Launch Location Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold mb-3 shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Sangli - Miraj Official Healthcare Network</span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {portalRole === 'ADMIN'
            ? 'Careoon Admin Console Login'
            : portalRole === 'NURSE'
            ? 'Verified Nurse Portal Access'
            : activeTab === 'LOGIN'
            ? 'Sign In to Your Account'
            : 'Create Your Patient Account'}
        </h1>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          {portalRole === 'ADMIN'
            ? 'Sangli operations, pricing control, and nurse licensing audit'
            : portalRole === 'NURSE'
            ? 'Access your assigned visits, accept offers, and log doorstep vitals'
            : 'Book verified, MNC-certified nurses at your doorstep in Sangli'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-5">
          
          {/* 1. ROLE SELECTOR PILLS */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider text-center">
              Select Your Portal (पोर्टल निवडा)
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleSelect('PATIENT')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  portalRole === 'PATIENT'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('NURSE')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  portalRole === 'NURSE'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Nurse</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  portalRole === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Nurse Quick Direct Code Banner */}
          {portalRole === 'NURSE' && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between gap-2 animate-in fade-in">
              <div>
                <span className="font-extrabold block text-teal-950">Have a Nurse ID?</span>
                <span className="text-[11px] text-teal-700">Enter directly via your unique access code</span>
              </div>
              <Link
                href="/nurse/activate"
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-[11px] shrink-0 shadow-xs transition"
              >
                1-Step ID Login &rarr;
              </Link>
            </div>
          )}

          {/* Admin Demo Helper */}
          {portalRole === 'ADMIN' && (
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-2 animate-in fade-in">
              <div>
                <span className="font-extrabold block text-purple-950">Master Admin Account</span>
                <span className="text-[11px] text-purple-700 font-mono">admin@careoon.com / admin123</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@careoon.com');
                  setPassword('admin123');
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shrink-0 transition"
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* Patient Tabs: Sign In vs Register */}
          {portalRole === 'PATIENT' && (
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOGIN');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'LOGIN'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In (लॉगिन)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('REGISTER');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'REGISTER'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Patient (नवीन खाते)
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {portalRole === 'PATIENT' && activeTab === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name (रुग्णाचे नाव) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anand Kulkarni"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 text-sm font-medium text-slate-900 outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Phone (मोबाईल नंबर) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98220XXXXX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 text-sm font-medium text-slate-900 outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {portalRole === 'NURSE'
                  ? 'Nurse ID or Mobile Number (Nurse ID किंवा मोबाईल) *'
                  : portalRole === 'ADMIN'
                  ? 'Admin Email Address *'
                  : 'Mobile or Email (मोबाईल किंवा ईमेल) *'}
              </label>
              <div className="relative">
                <input
                  type={activeTab === 'REGISTER' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    portalRole === 'NURSE'
                      ? 'e.g. SANGLI-RN-7401 or 9822XXXXXX'
                      : portalRole === 'ADMIN'
                      ? 'admin@careoon.com'
                      : '98220XXXXX or name@example.com'
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 text-sm font-medium text-slate-900 outline-none font-sans"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password (पासवर्ड) *
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 text-sm font-medium text-slate-900 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 ${
                portalRole === 'ADMIN'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {portalRole === 'ADMIN'
                      ? 'Access Admin Console'
                      : portalRole === 'NURSE'
                      ? 'Open Nurse Dashboard'
                      : activeTab === 'LOGIN'
                      ? 'Sign In to Account'
                      : 'Create Free Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
