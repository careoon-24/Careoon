'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Star,
  ChevronRight,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Activity,
  Award,
  CalendarCheck,
  User,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  LogIn,
  Check,
  Building2,
  Shield,
  FileCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Sangli');

  // Check login state
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real database services
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(data.categories);
          const allServices = data.categories.flatMap((cat: any) =>
            (cat.services || []).map((s: any) => ({
              ...s,
              categoryName: cat.name,
              categoryId: cat.id,
            }))
          );
          setServices(allServices);
        }
      })
      .catch(() => {});

    // Fetch real verified nurses
    fetch('/api/nurses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.nurses) {
          setNurses(data.nurses);
        }
      })
      .catch(() => {});
  }, []);

  const displayServices = services;

  const filteredServices = displayServices.filter((service) => {
    const matchesCategory =
      selectedCategory === 'all' || service.categoryId === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleBookClick = (serviceId: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=/patient/book/${serviceId}`);
    } else {
      router.push(`/patient/book/${serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-20 md:pb-12">
      {/* 1. LOCATION & SEARCH BAR (Responsive Web & Mobile) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-16 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Location row */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Verified Care Location
                </span>
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm">Sangli - Miraj, Maharashtra</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-extrabold uppercase tracking-wider">
                    Official Launch
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sangli Care Network Active</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 'Surgical Dressing', 'Catheter', 'IV Drip' in Sangli..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-xs shadow-inner transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* 2. HERO GLASSMORPHIC BANNER (Expanded 2-Column Desktop Grid) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 text-white p-6 sm:p-10 shadow-2xl shadow-teal-950/20">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Sangli & Miraj Certified Home Care Nurses
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Hospital-Grade Nursing Care, <br />
                <span className="text-teal-300">Directly at Your Home in Sangli</span>
              </h1>

              <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl leading-relaxed">
                Connect directly with background-verified, Maharashtra Nursing Council registered nurses across Sangli, Miraj, Vishrambag & Kupwad for sterile wound dressings, IV therapy, catheterization, and elderly care.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-teal-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  100% MNC Verified Nurses
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Transparent Fixed Rates
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  15-Min Confirmation Guarantee
                </span>
              </div>
            </div>

            {/* Right Quick Highlights (Desktop) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Careoon Clinical Standards
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Verified Nursing Degree & License</div>
                      <div className="text-teal-200/80 text-[11px]">Strict verification against state clinical registries before activation.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">15-Minute Response Protocol</div>
                      <div className="text-teal-200/80 text-[11px]">Nurse confirms in 15 mins. If unavailable, instant one-tap reselection.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Doorstep In-App UPI & Cash Payment</div>
                      <div className="text-teal-200/80 text-[11px]">Pay safely after clinical completion with digital invoice & audit log.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Decorative glowing sphere */}
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* 3. CATEGORY PILLS (SWIGGY/ZOMATO STYLE) */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
              Clinical Service Categories
            </h2>
            <p className="text-xs text-slate-500">Select a category to filter doctor-prescribed home procedures</p>
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-teal-700 font-bold hover:underline"
          >
            Reset Filter
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-slate-900/20'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-500" />
            <span>All Procedures</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. PROCEDURE CARDS (RESPONSIVE PC & MOBILE GRID: 1 col on mobile, 2 col on tablet, 3 col on desktop) */}
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
              Available Home Procedures
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredServices.length} verified procedures in Sangli - Miraj District
            </p>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">No Clinical Procedures Published Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Careoon operates with verified hospital-standard services. The platform administrator can configure clinical procedures, aseptic protocols, and pricing in the Admin Operations Console.
            </p>
            {currentUser?.role === 'ADMIN' && (
              <div className="pt-2">
                <Link
                  href="/admin/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
                >
                  <span>Configure Services in Admin</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  {/* Badge row */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      MNC Nurse Required
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                      <span className="text-[10px] text-slate-400 font-normal">(120+ visits)</span>
                    </div>
                  </div>

                  {/* Title & Details */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {service.description || service.shortDescription}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {service.durationMinutes} mins
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Sterile Kit Included
                    </span>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fixed Rate</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookClick(service.id)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition flex items-center gap-1.5"
                  >
                    <span>Book Care</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. VERIFIED NURSES SPOTLIGHT (Dynamic Real-Time Data from DB) */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Quality & Credential Assurance
              </span>
              <h3 className="text-lg sm:text-xl font-bold">Top Verified Nurses in Your Area</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Background & License Verified</span>
            </div>
          </div>

          {nurses.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <h4 className="text-base font-bold text-white">0 Registered Nurses in Current Area</h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                Careoon maintains a 100% verified network. All home nurses must hold active state nursing council credentials, sterile clinical procedure experience, and police clearance.
              </p>
              <div className="pt-2">
                <Link
                  href="/nurse/activate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <span>Apply as Verified Nurse</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nurses.map((nurse) => {
                const name = nurse.user?.fullName || 'Verified Nurse';
                const initials = name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const qual = Array.isArray(nurse.qualifications)
                  ? nurse.qualifications.join(', ')
                  : nurse.qualifications || 'Certified RN';
                const rating = nurse.ratingAverage ? Number(nurse.ratingAverage).toFixed(1) : '5.0';
                const reviewsCount = nurse.reviews?.length || nurse.ratingCount || 0;

                return (
                  <div
                    key={nurse.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 hover:border-teal-400/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1">
                          {name}, RN
                          <ShieldCheck className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {qual} • {nurse.experienceYears || 1} yrs Clinical Exp
                        </div>
                      </div>
                    </div>
                    {nurse.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2">{nurse.bio}</p>
                    )}
                    <div className="text-xs text-amber-300 font-bold flex items-center gap-1 pt-1 border-t border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      {rating} / 5.0 ({reviewsCount} patient reviews)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. HOW CAREOON WORKS STEPPER (Responsive 4-Card Row) */}
      <div id="why" className="max-w-6xl mx-auto px-4 pt-12">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Safe & Simple Process
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            How Careoon Home Nursing Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Select Procedure</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose your doctor-prescribed clinical service and preferred date & time slot.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Distance Matching</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compare nearby verified nurses with experience, clinical reviews, and exact distance.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">15-Min Lock</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nurse confirms within 15 minutes. If unavailable, instant reselection without re-typing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-900">Doorstep Care & Pay</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nurse delivers sterile care, logs health vitals, and collects payment via in-app QR or cash.
            </p>
          </div>
        </div>
      </div>

      {/* 7. GLASSMORPHIC MOBILE BOTTOM NAVIGATION (Hidden on Desktop: md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-teal-600 font-bold text-[10px]"
        >
          <HeartPulse className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/patient"
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800 font-medium text-[10px] transition"
        >
          <Stethoscope className="w-5 h-5" />
          <span>Procedures</span>
        </Link>

        <Link
          href={currentUser ? '/patient/bookings' : '/login?redirect=/patient/bookings'}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800 font-medium text-[10px] transition"
        >
          <CalendarCheck className="w-5 h-5" />
          <span>My Bookings</span>
        </Link>

        <Link
          href={currentUser ? '/patient/profile' : '/login?redirect=/patient/profile'}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-800 font-medium text-[10px] transition"
        >
          <User className="w-5 h-5" />
          <span>{currentUser ? 'Profile' : 'Sign In'}</span>
        </Link>
      </nav>
    </div>
  );
}
