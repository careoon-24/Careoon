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
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Pune');

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
  }, []);

  // Fallback services if API is empty yet
  const displayServices =
    services.length > 0
      ? services
      : [
          {
            id: 'srv_1',
            name: 'Surgical Wound Dressing (Aseptic)',
            description: 'Sterile surgical dressing, suture check, and antiseptic cleaning by certified nurse.',
            basePrice: 750,
            durationMinutes: 45,
            categoryId: 'cat_1',
            rating: 4.9,
            bookingsCount: 142,
          },
          {
            id: 'srv_2',
            name: 'Urinary Catheterization & Care',
            description: 'Safe Foley catheter insertion, replacement, and antiseptic bladder wash at home.',
            basePrice: 1100,
            durationMinutes: 60,
            categoryId: 'cat_2',
            rating: 4.95,
            bookingsCount: 88,
          },
          {
            id: 'srv_3',
            name: 'IV Infusion & Cannulation',
            description: 'Intravenous fluid drip setup, cannulation, and doctor-prescribed medication infusion.',
            basePrice: 650,
            durationMinutes: 60,
            categoryId: 'cat_3',
            rating: 4.88,
            bookingsCount: 215,
          },
          {
            id: 'srv_4',
            name: 'Full Health Vitals & Sugar Check',
            description: 'Comprehensive checkup: Blood pressure, Blood sugar (glucometer), SpO2, and pulse.',
            basePrice: 400,
            durationMinutes: 30,
            categoryId: 'cat_2',
            rating: 4.92,
            bookingsCount: 320,
          },
        ];

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
      // Direct guest to login first, then resume booking seamlessly
      router.push(`/login?redirect=/patient/book/${serviceId}`);
    } else {
      router.push(`/patient/book/${serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-24">
      {/* 1. ZOMATO/SWIGGY STYLE LOCATION & SEARCH HEADER */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-14 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {/* Location row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-500 font-medium">Home Care In:</span>
              <button
                onClick={() => setSelectedCity(selectedCity === 'Pune' ? 'Mumbai' : 'Pune')}
                className="font-bold text-slate-800 flex items-center gap-0.5 hover:text-teal-700 transition"
              >
                <span>{selectedCity}, Maharashtra</span>
                <span className="text-[10px] text-teal-600 font-normal">▼</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Nurses Active Now
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 'Surgical Dressing', 'Catheter', 'IV Drip'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-xs shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* 2. HERO GLASSMORPHIC BANNER */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-5 shadow-xl shadow-teal-900/10">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-teal-200">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Direct-to-Doorstep Certified Nursing
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Verified Registered Nurses <br />
              <span className="text-teal-300">at Your Home in 45 Mins</span>
            </h1>

            <p className="text-xs text-teal-100/80 max-w-sm leading-relaxed">
              Hospital-grade sterile wound dressing, IV infusions, and post-surgery care without the hassle of hospital travel.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-medium text-teal-200">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                100% MNC Verified
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Fixed Transparent Rates
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                15-Min Confirmation
              </span>
            </div>
          </div>

          {/* Decorative glowing sphere */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-teal-400/20 rounded-full blur-2xl" />
        </div>
      </div>

      {/* 3. QUICK CATEGORY PILLS (SWIGGY/ZOMATO STYLE) */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight text-slate-800">
            Clinical Categories
          </h2>
          <span className="text-[11px] text-teal-700 font-semibold cursor-pointer" onClick={() => setSelectedCategory('all')}>
            View All
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-500" />
            <span>All Services</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. TRENDING SERVICES CARDS (URBAN COMPANY / ZOMATO STYLE) */}
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-800">
            Recommended Home Procedures
          </h2>
          <span className="text-[10px] text-slate-400 font-medium">
            {filteredServices.length} available today
          </span>
        </div>

        <div className="space-y-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Verified Nurse Required
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{service.rating || '4.9'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({service.bookingsCount || '90+'})
                    </span>
                  </div>
                </div>

                {/* Title & Details */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {service.durationMinutes} mins
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Sterile Kit Included</span>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Rate</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(service.basePrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookClick(service.id)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <span>Book Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. VERIFIED NURSES SPOTLIGHT */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                Quality Assurance
              </span>
              <h3 className="text-sm font-bold">Top Verified Nurses in Pune</h3>
            </div>
            <Award className="w-6 h-6 text-teal-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  PK
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    Pooja Kulkarni, RN
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">B.Sc. Nursing • 6 yrs exp</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Specialized in ICU and sterile surgical wound dressings. Maharashtra Nursing Council verified.
              </p>
              <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1 pt-0.5">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                4.9 / 5 (38 ratings)
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  MP
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    Maya Patel, RN
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">G.N.M. Geriatric Specialist • 8 yrs exp</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Compassionate bedridden patient catheterization, vitals surveillance, and IV medication.
              </p>
              <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1 pt-0.5">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                4.95 / 5 (64 ratings)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. HOW CAREOON WORKS STEPPER */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h2 className="text-sm font-bold tracking-tight text-slate-800 mb-3 text-center">
          How Careoon Works
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-800">Select Care</h4>
            <p className="text-[10px] text-slate-500">Pick required procedure & preferred time</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-800">Choose Nurse</h4>
            <p className="text-[10px] text-slate-500">Compare verified ratings & credentials</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-800">15-Min Lock</h4>
            <p className="text-[10px] text-slate-500">Nurse confirms within 15 mins</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center space-y-1">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              4
            </div>
            <h4 className="text-xs font-bold text-slate-800">Care at Home</h4>
            <p className="text-[10px] text-slate-500">Aseptic service & digital clinical record</p>
          </div>
        </div>
      </div>

      {/* 7. GLASSMORPHIC MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-2xl">
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
