"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCareoon } from "@/context/CareoonContext";
import { Star, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SubmitReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const { bookings, services, nurseProfiles, users, submitReview, reviews } = useCareoon();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const booking = bookings.find((b) => b.id === bookingId);
  const service = services.find((s) => s.id === booking?.serviceId);
  const nurse = nurseProfiles.find((n) => n.id === booking?.currentNurseId);
  const nurseUser = nurse ? users.find((u) => u.id === nurse.userId) : null;

  const existingReview = reviews.find((r) => r.bookingId === bookingId);

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

  if (existingReview || submitted) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Review Submitted</h2>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          Thank you for verifying your clinical care experience. Your feedback helps maintain high standards across Careoon.
        </p>
        <div className="pt-2">
          <Link
            href="/patient/bookings"
            className="inline-block py-2 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reviewText.trim()) {
      setError("Please share a brief comment about your care visit.");
      return;
    }

    const res = submitReview(booking.id, rating, reviewText);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Failed to submit review.");
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <div className="space-y-1">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          Review Your Nursing Care
        </h1>
        <p className="text-xs text-zinc-500">
          Verified review for {service?.name} delivered by Nurse {nurseUser?.fullName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        {/* Rating Stars */}
        <div className="text-center space-y-1.5 py-2">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Overall Clinical Rating
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300 dark:text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {rating === 5 ? "Exceptional clinical care" : `${rating} out of 5 stars`}
          </span>
        </div>

        {/* Written Review */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Care Details & Clinical Observations
          </label>
          <textarea
            rows={4}
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="How was the nurse's punctuality, sterile technique, bedside manner, and explanation?"
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-800 outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          Publish Verified Review
        </button>
      </form>
    </div>
  );
}
