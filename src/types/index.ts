export type UserRole = "patient" | "nurse" | "admin";

export type UserStatus = "active" | "suspended" | "pending_activation";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  status: UserStatus;
  createdAt: number;
  avatarUrl?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  address: {
    street: string;
    apartment?: string;
    city: string;
    postalCode: string;
    landmark?: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalAlertNotes?: string;
}

export type QualificationStatus = "unverified" | "verified" | "rejected";

export interface NurseProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  qualificationStatus: QualificationStatus;
  verifiedAt?: number;
  verifiedByAdminId?: string;
  serviceAreas: string[]; // postal codes or zones
  isAvailable: boolean;
  completedBookingsCount: number;
  cancellationCount: number;
  ratingAverage: number;
  ratingCount: number;
  hourlyBaseRate?: number;
  bio?: string;
  yearsExperience?: number;
}

export interface NurseServiceQualification {
  id: string;
  nurseId: string;
  serviceId: string;
  isApproved: boolean;
  approvedByAdminId?: string;
  approvedAt?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number; // in USD / currency units
  durationMinutes: number;
  commissionPercentage: number; // e.g. 20 for 20%
  serviceAreas: string[];
  eligibilityConditions: string[];
  isActive: boolean;
  createdAt: number;
}

export type BookingStatus =
  | "draft"
  | "offer_pending"
  | "reselection_required"
  | "confirmed"
  | "nurse_arrived"
  | "in_progress"
  | "completed"
  | "payment_pending"
  | "closed"
  | "cancelled_by_patient"
  | "cancelled_by_nurse"
  | "cancelled_by_admin"
  | "no_show"
  | "admin_intervention"
  | "disputed";

export interface BookingAddress {
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  instructions?: string;
}

export interface Booking {
  id: string;
  patientId: string;
  serviceId: string;
  serviceAddress: BookingAddress;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeSlot: string; // e.g. "10:00 - 11:30 AM"
  status: BookingStatus;
  currentNurseId?: string;
  
  // Snapshots & Financials
  servicePriceSnapshot: number;
  lockedCommissionPercentage: number;
  calculatedCommissionAmount: number;
  calculatedNursePayable: number;
  
  // Timestamps and deadlines
  activeOfferId?: string;
  activeOfferExpiresAt?: number; // 15-minute countdown timestamp
  createdAt: number;
  confirmedAt?: number;
  arrivedAt?: number;
  startedAt?: number;
  completedAt?: number;
  closedAt?: number;
  
  // Exceptions
  cancellationReason?: string;
  cancelledBy?: {
    userId: string;
    role: UserRole;
  };
  disputeReason?: string;
  specialInstructions?: string;
}

export type OfferStatus = "pending" | "accepted" | "rejected" | "expired" | "superseded";

export interface BookingOffer {
  id: string;
  bookingId: string;
  nurseId: string;
  status: OfferStatus;
  offeredAt: number;
  expiresAt: number; // offeredAt + 15 * 60 * 1000
  respondedAt?: number;
  rejectionReason?: string;
}

export type BookingEventType =
  | "BOOKING_CREATED"
  | "OFFER_SENT"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "OFFER_EXPIRED"
  | "RESELECTION_REQUESTED"
  | "BOOKING_CONFIRMED"
  | "NURSE_ARRIVED"
  | "CARE_STARTED"
  | "CARE_COMPLETED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_VERIFIED"
  | "PAYABLE_ACCRUED"
  | "PAYOUT_BATCHED"
  | "PAYOUT_COMPLETED"
  | "CANCELLED"
  | "DISPUTE_OPENED"
  | "ADMIN_REASSIGNED"
  | "REVIEW_SUBMITTED";

export interface BookingTimelineEvent {
  id: string;
  bookingId: string;
  actorId: string;
  actorRole: UserRole | "system";
  actorName: string;
  eventType: BookingEventType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export type PaymentMethod = "bank_transfer" | "cash_on_delivery" | "pos_terminal" | "card_manual_entry";

export type PaymentStatus = "pending" | "received" | "partially_refunded" | "refunded" | "disputed";

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  status: PaymentStatus;
  receivedAt?: number;
  verifiedByAdminId?: string;
  verifiedAt?: number;
  reconciliationStatus: "unreconciled" | "reconciled";
  notes?: string;
  createdAt: number;
}

export type PayableStatus = "accrued" | "approved" | "held" | "batched" | "paid";

export interface NursePayable {
  id: string;
  bookingId: string;
  nurseId: string;
  grossServiceAmount: number;
  careoonCommissionAmount: number;
  adjustmentsAmount: number;
  netPayableAmount: number;
  status: PayableStatus;
  holdReason?: string;
  payoutBatchId?: string;
  createdAt: number;
  paidAt?: number;
}

export type PayoutBatchStatus = "draft" | "processing" | "completed" | "failed";

export interface PayoutBatch {
  id: string;
  batchReference: string;
  periodStartDate: string;
  periodEndDate: string;
  totalAmount: number;
  totalNursesCount: number;
  payableIds: string[];
  status: PayoutBatchStatus;
  settledByAdminId?: string;
  paymentReference?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ServiceReview {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  nurseId: string;
  rating: number; // 1 - 5
  reviewText: string;
  isPublic: boolean;
  createdAt: number;
}

export type TicketCategory = "cancellation" | "payment" | "clinical_concern" | "no_show" | "other";

export type TicketStatus = "open" | "in_investigation" | "resolved" | "dismissed";

export interface SupportTicket {
  id: string;
  bookingId?: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  resolutionNotes?: string;
  resolvedByAdminId?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | "system";
  action: string;
  entityType: "service" | "nurse" | "booking" | "payment" | "payout" | "user";
  entityId: string;
  details: {
    before?: any;
    after?: any;
    rationale?: string;
  };
  timestamp: number;
}

export interface NurseInvitation {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  token: string;
  licenseNumber: string;
  serviceAreas: string[];
  invitedByAdminId: string;
  expiresAt: number;
  isClaimed: boolean;
  createdAt: number;
}
