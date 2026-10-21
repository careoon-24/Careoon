'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, Lock, Mail, ArrowRight, AlertCircle, Phone, User, ShieldCheck, MapPin } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            role: 'PATIENT', // Always PATIENT for public users
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
          {activeTab === 'LOGIN' ? 'Sign In to Your Account' : 'Create Your Patient Account'}
        </h1>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          {activeTab === 'LOGIN'
            ? 'Access your home procedure bookings, nurse live tracking, and clinical vitals'
            : 'Register in seconds to book verified, MNC-certified nurses at your doorstep'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 sm:p-8">
          
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Patient Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name (रुग्णाचे नाव)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anand Kulkarni"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Phone (मोबाईल नंबर)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {activeTab === 'LOGIN' ? 'Mobile, Email, or Nurse ID (मोबाईल, ईमेल किंवा Nurse ID)' : 'Email Address (ईमेल)'}
              </label>
              <div className="relative">
                <input
                  type={activeTab === 'LOGIN' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'LOGIN' ? 'e.g. 98220XXXXX or SANGLI-RN-7401' : 'name@example.com'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none font-sans"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'LOGIN' ? 'Sign In to Account' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clinical trust badges */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>100% MNC Verified</span>
            </div>
            <span>•</span>
            <div>Sangli & Miraj Care</div>
            <span>•</span>
            <div>Zero Advance Fee</div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 transition"
          >
            <span>← Return to Home Care Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

