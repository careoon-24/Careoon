'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShieldCheck, Stethoscope, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'NURSE'>('PATIENT');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(redirectPath || data.redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        if (!res.ok) throw new Error(data.error || 'Login failed');

        router.push(redirectPath || data.redirectUrl);
        router.refresh();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, fullName, password, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        router.push(redirectPath || data.redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">Careoon</span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          {activeTab === 'LOGIN' ? 'Sign in to your account' : 'Create your Careoon account'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Verified Home Nursing & Post-Operative Care Marketplace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          
          {/* Quick Demo Login Cards */}
          {activeTab === 'LOGIN' && (
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Test Logins (1-Click)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('patient@careoon.com', 'patient123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-50 text-teal-800 transition text-center"
                >
                  <Heart className="w-4 h-4 mb-1 text-teal-600" />
                  <span className="text-xs font-semibold">Patient</span>
                  <span className="text-[9px] text-teal-600">Sunita D.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('nurse@careoon.com', 'nurse123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-800 transition text-center"
                >
                  <Stethoscope className="w-4 h-4 mb-1 text-blue-600" />
                  <span className="text-xs font-semibold">Nurse</span>
                  <span className="text-[9px] text-blue-600">Pooja K.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@careoon.com', 'admin123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 text-amber-800 transition text-center"
                >
                  <ShieldCheck className="w-4 h-4 mb-1 text-amber-600" />
                  <span className="text-xs font-semibold">Admin</span>
                  <span className="text-[9px] text-amber-600">Operations</span>
                </button>
              </div>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">or enter credentials</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('PATIENT')}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                        role === 'PATIENT'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Patient / Family
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('NURSE')}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                        role === 'NURSE'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Registered Nurse
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === 'LOGIN' ? 'Sign In Securely' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {activeTab === 'LOGIN' ? (
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGISTER');
                    setError(null);
                  }}
                  className="font-bold text-teal-600 hover:text-teal-700 underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setError(null);
                  }}
                  className="font-bold text-teal-600 hover:text-teal-700 underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Return to Careoon Home
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
