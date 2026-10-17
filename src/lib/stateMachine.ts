import {
  Booking,
  BookingStatus,
  NurseProfile,
  NurseServiceQualification,
  Service,
  UserRole,
} from "@/types";

export const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ["offer_pending", "cancelled_by_patient"],
  offer_pending: [
    "confirmed",
    "reselection_required",
    "admin_intervention",
    "cancelled_by_patient",
  ],
  reselection_required: [
    "offer_pending",
    "admin_intervention",
    "cancelled_by_patient",
    "cancelled_by_admin",
  ],
  confirmed: [
    "nurse_arrived",
    "cancelled_by_patient",
    "cancelled_by_nurse",
    "cancelled_by_admin",
    "no_show",
    "disputed",
  ],
  nurse_arrived: [
    "in_progress",
    "cancelled_by_nurse",
    "cancelled_by_admin",
    "disputed",
  ],
  in_progress: [
    "completed",
    "disputed",
    "admin_intervention",
  ],
  completed: [
    "payment_pending",
    "closed",
    "disputed",
  ],
  payment_pending: [
    "closed",
    "disputed",
  ],
  closed: [
    "disputed",
  ],
  cancelled_by_patient: [],
  cancelled_by_nurse: ["admin_intervention", "reselection_required"],
  cancelled_by_admin: [],
  no_show: ["admin_intervention", "closed"],
  admin_intervention: [
    "offer_pending",
    "confirmed",
    "cancelled_by_admin",
    "closed",
  ],
  disputed: [
    "admin_intervention",
    "closed",
    "payment_pending",
  ],
};

export function canTransitionBooking(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus,
  role: UserRole
): { allowed: boolean; reason?: string } {
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Illegal state transition from ${currentStatus} to ${targetStatus}`,
    };
  }

  // Role authorization logic for status transitions
  if (role === "nurse") {
    const nurseAllowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      draft: [],
      offer_pending: [], // Offers handled via bookingOffer status mutation
      reselection_required: [],
      confirmed: ["nurse_arrived", "cancelled_by_nurse"],
      nurse_arrived: ["in_progress", "cancelled_by_nurse"],
      in_progress: ["completed", "disputed"],
      completed: [],
      payment_pending: [],
      closed: [],
      cancelled_by_patient: [],
      cancelled_by_nurse: [],
      cancelled_by_admin: [],
      no_show: [],
      admin_intervention: [],
      disputed: [],
    };

    if (!nurseAllowedTransitions[currentStatus]?.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Nurses are not authorized to transition booking from ${currentStatus} to ${targetStatus}`,
      };
    }
  }

  if (role === "patient") {
    const patientAllowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      draft: ["offer_pending", "cancelled_by_patient"],
      offer_pending: ["cancelled_by_patient"],
      reselection_required: ["offer_pending", "cancelled_by_patient"],
      confirmed: ["cancelled_by_patient", "disputed"],
      nurse_arrived: ["disputed"],
      in_progress: ["disputed"],
      completed: ["disputed"],
      payment_pending: ["disputed"],
      closed: ["disputed"],
      cancelled_by_patient: [],
      cancelled_by_nurse: [],
      cancelled_by_admin: [],
      no_show: [],
      admin_intervention: [],
      disputed: [],
    };

    if (!patientAllowedTransitions[currentStatus]?.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Patients are not authorized to transition booking from ${currentStatus} to ${targetStatus}`,
      };
    }
  }

  return { allowed: true };
}

export function calculateFinancials(
  servicePrice: number,
  commissionPercentage: number,
  adjustments: number = 0
): {
  grossServiceAmount: number;
  careoonCommissionAmount: number;
  netPayableAmount: number;
} {
  const gross = Math.max(0, servicePrice);
  const rate = Math.min(100, Math.max(0, commissionPercentage));
  const commission = Math.round((gross * (rate / 100)) * 100) / 100;
  const net = Math.max(0, Math.round((gross - commission + adjustments) * 100) / 100);

  return {
    grossServiceAmount: gross,
    careoonCommissionAmount: commission,
    netPayableAmount: net,
  };
}

export function isNurseEligibleForService(
  nurse: NurseProfile,
  service: Service,
  qualifications: NurseServiceQualification[],
  servicePostalCode: string,
  existingNurseBookings: Booking[],
  targetDate: string,
  targetTimeSlot: string
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Qualification verification
  if (nurse.qualificationStatus !== "verified") {
    reasons.push("Nurse professional qualifications are not verified by admin.");
  }

  // 2. Service-specific qualification approval
  const hasServiceQualification = qualifications.some(
    (q) => q.nurseId === nurse.id && q.serviceId === service.id && q.isApproved
  );
  if (!hasServiceQualification) {
    reasons.push("Nurse has not been approved by admin for this specific clinical procedure.");
  }

  // 3. Service area match
  const normalizedPostal = servicePostalCode.trim().toLowerCase();
  const servesArea = nurse.serviceAreas.some(
    (area) => area.trim().toLowerCase() === normalizedPostal || area.trim() === "*"
  );
  if (!servesArea) {
    reasons.push(`Nurse does not cover postal area "${servicePostalCode}".`);
  }

  // 4. Availability status
  if (!nurse.isAvailable) {
    reasons.push("Nurse is currently toggled offline / unavailable.");
  }

  // 5. Calendar conflict check
  const hasConflict = existingNurseBookings.some((b) => {
    if (b.currentNurseId !== nurse.id) return false;
    if (b.scheduledDate !== targetDate) return false;
    if (b.scheduledTimeSlot === targetTimeSlot) {
      return ["confirmed", "nurse_arrived", "in_progress"].includes(b.status);
    }
    return false;
  });

  if (hasConflict) {
    reasons.push("Nurse has an existing confirmed booking in this time window.");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
