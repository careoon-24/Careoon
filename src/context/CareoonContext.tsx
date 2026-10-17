"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import {
  AuditLog,
  Booking,
  BookingAddress,
  BookingOffer,
  BookingStatus,
  BookingTimelineEvent,
  BookingEventType,
  NurseInvitation,
  NursePayable,
  NurseProfile,
  NurseServiceQualification,
  PatientProfile,
  PaymentMethod,
  PaymentRecord,
  PayoutBatch,
  QualificationStatus,
  Service,
  ServiceCategory,
  ServiceReview,
  SupportTicket,
  User,
  UserRole,
} from "@/types";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_CATEGORIES,
  INITIAL_NURSE_PROFILES,
  INITIAL_NURSE_QUALIFICATIONS,
  INITIAL_OFFERS,
  INITIAL_PATIENT_PROFILES,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUT_BATCHES,
  INITIAL_REVIEWS,
  INITIAL_SERVICES,
  INITIAL_TICKETS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_USERS,
  INITIAL_NURSE_PAYABLES,
} from "@/lib/seedData";
import { calculateFinancials, canTransitionBooking, isNurseEligibleForService } from "@/lib/stateMachine";

interface CareoonContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUserRole: (role: UserRole, specificUserId?: string) => void;
  users: User[];
  
  // Data models
  categories: ServiceCategory[];
  services: Service[];
  nurseProfiles: NurseProfile[];
  patientProfiles: PatientProfile[];
  nurseQualifications: NurseServiceQualification[];
  bookings: Booking[];
  offers: BookingOffer[];
  timelineEvents: BookingTimelineEvent[];
  payments: PaymentRecord[];
  nursePayables: NursePayable[];
  payoutBatches: PayoutBatch[];
  reviews: ServiceReview[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  invitations: NurseInvitation[];
  
  // Portal helpers
  getCurrentPatientProfile: () => PatientProfile | undefined;
  getCurrentNurseProfile: () => NurseProfile | undefined;
  getEligibleNursesForService: (
    serviceId: string,
    postalCode: string,
    targetDate: string,
    targetTimeSlot: string
  ) => { nurse: NurseProfile; user: User; eligible: boolean; reasons: string[] }[];
  
  // Patient Actions
  createBookingWithNurseOffer: (
    serviceId: string,
    address: BookingAddress,
    scheduledDate: string,
    scheduledTimeSlot: string,
    nurseId: string,
    specialInstructions?: string
  ) => { success: boolean; bookingId?: string; error?: string };
  reselectNurseForBooking: (
    bookingId: string,
    newNurseId: string
  ) => { success: boolean; error?: string };
  patientCancelBooking: (bookingId: string, reason: string) => { success: boolean; error?: string };
  submitReview: (
    bookingId: string,
    rating: number,
    text: string
  ) => { success: boolean; error?: string };
  fileTicket: (
    bookingId: string | undefined,
    category: SupportTicket["category"],
    subject: string,
    description: string
  ) => { success: boolean; error?: string };

  // Nurse Actions
  nurseAcceptOffer: (offerId: string) => { success: boolean; error?: string };
  nurseRejectOffer: (offerId: string, reason: string) => { success: boolean; error?: string };
  nurseUpdateJobProgress: (
    bookingId: string,
    targetStatus: BookingStatus,
    notes?: string
  ) => { success: boolean; error?: string };
  nurseToggleAvailability: (nurseId: string, isAvailable: boolean) => void;
  nurseUpdateServiceAreas: (nurseId: string, areas: string[]) => void;
  claimNurseInvitation: (
    token: string,
    fullName: string,
    phone: string
  ) => { success: boolean; error?: string };

  // Admin Actions
  adminSaveService: (serviceData: Partial<Service> & { name: string; basePrice: number; commissionPercentage: number; categoryId: string }) => { success: boolean; error?: string };
  adminToggleServiceStatus: (serviceId: string) => void;
  adminVerifyNurse: (nurseId: string, status: QualificationStatus) => void;
  adminToggleNurseQualification: (nurseId: string, serviceId: string, isApproved: boolean) => void;
  adminInviteNurse: (
    fullName: string,
    email: string,
    phone: string,
    licenseNumber: string,
    serviceAreas: string[]
  ) => { success: boolean; invitation?: NurseInvitation; error?: string };
  adminRecordPayment: (
    bookingId: string,
    amount: number,
    method: PaymentMethod,
    referenceNumber: string,
    notes?: string
  ) => { success: boolean; error?: string };
  adminCreatePayoutBatch: (payableIds: string[]) => { success: boolean; batchId?: string; error?: string };
  adminSettlePayoutBatch: (batchId: string, paymentReference: string) => { success: boolean; error?: string };
  adminReassignBooking: (bookingId: string, nurseId: string, reason: string) => { success: boolean; error?: string };
  adminResolveTicket: (ticketId: string, notes: string) => void;

  // System
  resetAllData: () => void;
}

const CareoonContext = createContext<CareoonContextType | undefined>(undefined);

const STORAGE_KEY = "careoon_mvp_state_v1";

export function CareoonProvider({ children }: { children: React.ReactNode }) {
  const [, startTransition] = useTransition();

  // Users & Session
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to Admin for demo visibility

  // Core Data
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>(INITIAL_PATIENT_PROFILES);
  const [nurseProfiles, setNurseProfiles] = useState<NurseProfile[]>(INITIAL_NURSE_PROFILES);
  const [nurseQualifications, setNurseQualifications] = useState<NurseServiceQualification[]>(INITIAL_NURSE_QUALIFICATIONS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [offers, setOffers] = useState<BookingOffer[]>(INITIAL_OFFERS);
  const [timelineEvents, setTimelineEvents] = useState<BookingTimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [nursePayables, setNursePayables] = useState<NursePayable[]>(INITIAL_NURSE_PAYABLES);
  const [payoutBatches, setPayoutBatches] = useState<PayoutBatch[]>(INITIAL_PAYOUT_BATCHES);
  const [reviews, setReviews] = useState<ServiceReview[]>(INITIAL_REVIEWS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [invitations, setInvitations] = useState<NurseInvitation[]>([]);

  // Load from local storage on mount (browser only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.services) setServices(parsed.services);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.patientProfiles) setPatientProfiles(parsed.patientProfiles);
        if (parsed.nurseProfiles) setNurseProfiles(parsed.nurseProfiles);
        if (parsed.nurseQualifications) setNurseQualifications(parsed.nurseQualifications);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.offers) setOffers(parsed.offers);
        if (parsed.timelineEvents) setTimelineEvents(parsed.timelineEvents);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.nursePayables) setNursePayables(parsed.nursePayables);
        if (parsed.payoutBatches) setPayoutBatches(parsed.payoutBatches);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.tickets) setTickets(parsed.tickets);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.invitations) setInvitations(parsed.invitations);
      } else {
        // First mount on client: ensure pending demo offer has live 11-min countdown
        const demoExpiry = Date.now() + 11 * 60 * 1000;
        setBookings((prev) =>
          prev.map((b) => (b.id === "bk_101" ? { ...b, activeOfferExpiresAt: demoExpiry } : b))
        );
        setOffers((prev) =>
          prev.map((o) => (o.id === "off_101" ? { ...o, expiresAt: demoExpiry } : o))
        );
      }
    } catch {
      // Graceful fallback to initial seed
    }
  }, []);

  // Save changes to local storage
  const persistState = (newState: Record<string, any>) => {
    try {
      const currentState = {
        users,
        services,
        categories,
        patientProfiles,
        nurseProfiles,
        nurseQualifications,
        bookings,
        offers,
        timelineEvents,
        payments,
        nursePayables,
        payoutBatches,
        reviews,
        tickets,
        auditLogs,
        invitations,
        ...newState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // Storage quota or SSR ignore
    }
  };

  // Background ticker for 15-minute offer timeouts (server state simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasExpired = false;

      const updatedOffers = offers.map((offer) => {
        if (offer.status === "pending" && offer.expiresAt <= now) {
          hasExpired = true;
          return { ...offer, status: "expired" as const, respondedAt: now };
        }
        return offer;
      });

      if (hasExpired) {
        startTransition(() => {
          setOffers(updatedOffers);

          // Update corresponding bookings to reselection_required
          const expiredOfferBookingIds = updatedOffers
            .filter((o) => o.status === "expired" && offers.find((orig) => orig.id === o.id)?.status === "pending")
            .map((o) => o.bookingId);

          if (expiredOfferBookingIds.length > 0) {
            setBookings((prev) =>
              prev.map((b) => {
                if (expiredOfferBookingIds.includes(b.id) && b.status === "offer_pending") {
                  return {
                    ...b,
                    status: "reselection_required",
                    activeOfferId: undefined,
                    activeOfferExpiresAt: undefined,
                  };
                }
                return b;
              })
            );

            // Append timeline events
            const newTimelineEvents: BookingTimelineEvent[] = expiredOfferBookingIds.map((bId) => ({
              id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              bookingId: bId,
              actorId: "system",
              actorRole: "system",
              actorName: "Careoon Automation",
              eventType: "OFFER_EXPIRED",
              description: "Nurse offer expired after 15 minutes without response. Patient requested to reselect.",
              timestamp: Date.now(),
            }));
            setTimelineEvents((prev) => [...prev, ...newTimelineEvents]);
          }
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [offers, bookings]);

  // Role switching utility
  const switchUserRole = (role: UserRole, specificUserId?: string) => {
    if (specificUserId) {
      const target = users.find((u) => u.id === specificUserId);
      if (target) {
        setCurrentUser(target);
        return;
      }
    }
    const match = users.find((u) => u.role === role);
    if (match) setCurrentUser(match);
  };

  const getCurrentPatientProfile = () => {
    if (!currentUser || currentUser.role !== "patient") return undefined;
    return patientProfiles.find((p) => p.userId === currentUser.id);
  };

  const getCurrentNurseProfile = () => {
    if (!currentUser || currentUser.role !== "nurse") return undefined;
    return nurseProfiles.find((p) => p.userId === currentUser.id);
  };

  // Find eligible nurses for a specific service and booking slot
  const getEligibleNursesForService = (
    serviceId: string,
    postalCode: string,
    targetDate: string,
    targetTimeSlot: string
  ) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];

    return nurseProfiles.map((nurse) => {
      const user = users.find((u) => u.id === nurse.userId)!;
      const { eligible, reasons } = isNurseEligibleForService(
        nurse,
        service,
        nurseQualifications,
        postalCode,
        bookings,
        targetDate,
        targetTimeSlot
      );
      return { nurse, user, eligible, reasons };
    });
  };

  // 1. Patient: Create Booking with Nurse Offer
  const createBookingWithNurseOffer = (
    serviceId: string,
    address: BookingAddress,
    scheduledDate: string,
    scheduledTimeSlot: string,
    nurseId: string,
    specialInstructions?: string
  ) => {
    if (!currentUser) return { success: false, error: "Please log in to submit a booking" };

    const service = services.find((s) => s.id === serviceId);
    if (!service) return { success: false, error: "Selected service does not exist" };

    const nurse = nurseProfiles.find((n) => n.id === nurseId);
    if (!nurse) return { success: false, error: "Selected nurse does not exist" };

    // Eligibility validation
    const { eligible, reasons } = isNurseEligibleForService(
      nurse,
      service,
      nurseQualifications,
      address.postalCode,
      bookings,
      scheduledDate,
      scheduledTimeSlot
    );

    if (!eligible) {
      return { success: false, error: `Selected nurse is not eligible: ${reasons.join(", ")}` };
    }

    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15-minute server countdown
    const bookingId = `bk_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const offerId = `off_${now}_${Math.random().toString(36).substring(2, 6)}`;

    // Lock price and commission rate snapshot
    const financials = calculateFinancials(service.basePrice, service.commissionPercentage);

    const newBooking: Booking = {
      id: bookingId,
      patientId: currentUser.id,
      serviceId,
      serviceAddress: address,
      scheduledDate,
      scheduledTimeSlot,
      status: "offer_pending",
      currentNurseId: nurseId,
      servicePriceSnapshot: service.basePrice,
      lockedCommissionPercentage: service.commissionPercentage,
      calculatedCommissionAmount: financials.careoonCommissionAmount,
      calculatedNursePayable: financials.netPayableAmount,
      activeOfferId: offerId,
      activeOfferExpiresAt: expiresAt,
      createdAt: now,
      specialInstructions,
    };

    const newOffer: BookingOffer = {
      id: offerId,
      bookingId,
      nurseId,
      status: "pending",
      offeredAt: now,
      expiresAt,
    };

    const newTimelineEvents: BookingTimelineEvent[] = [
      {
        id: `evt_${now}_1`,
        bookingId,
        actorId: currentUser.id,
        actorRole: "patient",
        actorName: currentUser.fullName,
        eventType: "BOOKING_CREATED",
        description: `Booking request created for ${service.name}.`,
        timestamp: now,
      },
      {
        id: `evt_${now}_2`,
        bookingId,
        actorId: "system",
        actorRole: "system",
        actorName: "Careoon Automation",
        eventType: "OFFER_SENT",
        description: `15-minute offer sent to Nurse. Offer deadline: ${new Date(expiresAt).toLocaleTimeString()}.`,
        timestamp: now,
      },
    ];

    startTransition(() => {
      setBookings((prev) => [newBooking, ...prev]);
      setOffers((prev) => [newOffer, ...prev]);
      setTimelineEvents((prev) => [...prev, ...newTimelineEvents]);
    });

    persistState({
      bookings: [newBooking, ...bookings],
      offers: [newOffer, ...offers],
      timelineEvents: [...timelineEvents, ...newTimelineEvents],
    });

    return { success: true, bookingId };
  };

  // 2. Patient: Reselect Nurse on rejection/expiration without retyping details
  const reselectNurseForBooking = (bookingId: string, newNurseId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    if (booking.status !== "reselection_required" && booking.status !== "offer_pending") {
      return { success: false, error: "This booking is not currently awaiting nurse reselection" };
    }

    const service = services.find((s) => s.id === booking.serviceId);
    const nurse = nurseProfiles.find((n) => n.id === newNurseId);
    if (!service || !nurse) return { success: false, error: "Service or nurse not found" };

    const { eligible, reasons } = isNurseEligibleForService(
      nurse,
      service,
      nurseQualifications,
      booking.serviceAddress.postalCode,
      bookings,
      booking.scheduledDate,
      booking.scheduledTimeSlot
    );

    if (!eligible) {
      return { success: false, error: `Nurse not eligible: ${reasons.join(", ")}` };
    }

    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;
    const offerId = `off_${now}_${Math.random().toString(36).substring(2, 6)}`;

    const newOffer: BookingOffer = {
      id: offerId,
      bookingId,
      nurseId: newNurseId,
      status: "pending",
      offeredAt: now,
      expiresAt,
    };

    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId,
      actorId: currentUser?.id || "system",
      actorRole: currentUser?.role || "system",
      actorName: currentUser?.fullName || "Careoon System",
      eventType: "OFFER_SENT",
      description: `Reselected nurse. New 15-minute offer dispatched.`,
      timestamp: now,
    };

    startTransition(() => {
      setOffers((prev) => [newOffer, ...prev]);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: "offer_pending",
                currentNurseId: newNurseId,
                activeOfferId: offerId,
                activeOfferExpiresAt: expiresAt,
              }
            : b
        )
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    return { success: true };
  };

  // 3. Nurse: Accept Offer within 15 minutes
  const nurseAcceptOffer = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return { success: false, error: "Offer not found" };

    const now = Date.now();
    if (offer.status !== "pending") {
      return { success: false, error: `Offer is already ${offer.status}` };
    }
    if (offer.expiresAt < now) {
      return { success: false, error: "Offer has expired (15-minute window passed)" };
    }

    const booking = bookings.find((b) => b.id === offer.bookingId);
    if (!booking) return { success: false, error: "Associated booking not found" };

    const transitionCheck = canTransitionBooking(booking.status, "confirmed", "nurse");
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.reason };
    }

    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId: booking.id,
      actorId: currentUser?.id || "nurse",
      actorRole: "nurse",
      actorName: currentUser?.fullName || "Nurse",
      eventType: "OFFER_ACCEPTED",
      description: "Nurse accepted the offer within response window. Booking is confirmed.",
      timestamp: now,
    };

    startTransition(() => {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "accepted", respondedAt: now } : o))
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: "confirmed",
                confirmedAt: now,
                activeOfferExpiresAt: undefined,
              }
            : b
        )
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    return { success: true };
  };

  // 4. Nurse: Reject Offer
  const nurseRejectOffer = (offerId: string, reason: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return { success: false, error: "Offer not found" };

    const now = Date.now();
    const booking = bookings.find((b) => b.id === offer.bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId: booking.id,
      actorId: currentUser?.id || "nurse",
      actorRole: "nurse",
      actorName: currentUser?.fullName || "Nurse",
      eventType: "OFFER_REJECTED",
      description: `Nurse declined offer. Reason: ${reason}. Patient notified to reselect.`,
      timestamp: now,
    };

    startTransition(() => {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offerId
            ? { ...o, status: "rejected", respondedAt: now, rejectionReason: reason }
            : o
        )
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: "reselection_required",
                activeOfferId: undefined,
                activeOfferExpiresAt: undefined,
              }
            : b
        )
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    return { success: true };
  };

  // 5. Nurse: Update Job Progress (Arrived -> In Progress -> Completed)
  const nurseUpdateJobProgress = (
    bookingId: string,
    targetStatus: BookingStatus,
    notes?: string
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    const transitionCheck = canTransitionBooking(booking.status, targetStatus, "nurse");
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.reason };
    }

    const now = Date.now();
    let eventType: BookingEventType = "NURSE_ARRIVED";
    if (targetStatus === "in_progress") eventType = "CARE_STARTED";
    if (targetStatus === "completed") eventType = "CARE_COMPLETED";

    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId,
      actorId: currentUser?.id || "nurse",
      actorRole: "nurse",
      actorName: currentUser?.fullName || "Nurse",
      eventType,
      description: notes || `Nurse updated service status to ${targetStatus}.`,
      timestamp: now,
    };

    startTransition(() => {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          const updated: Booking = { ...b, status: targetStatus };
          if (targetStatus === "nurse_arrived") updated.arrivedAt = now;
          if (targetStatus === "in_progress") updated.startedAt = now;
          if (targetStatus === "completed") {
            updated.completedAt = now;
            // Also update nurse completed count
            setNurseProfiles((np) =>
              np.map((prof) =>
                prof.id === b.currentNurseId
                  ? { ...prof, completedBookingsCount: prof.completedBookingsCount + 1 }
                  : prof
              )
            );
          }
          return updated;
        })
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    return { success: true };
  };

  // 6. Patient: Cancel Booking
  const patientCancelBooking = (bookingId: string, reason: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    const transitionCheck = canTransitionBooking(booking.status, "cancelled_by_patient", "patient");
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.reason };
    }

    const now = Date.now();
    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId,
      actorId: currentUser?.id || "patient",
      actorRole: "patient",
      actorName: currentUser?.fullName || "Patient",
      eventType: "CANCELLED",
      description: `Patient cancelled booking. Reason: ${reason}.`,
      timestamp: now,
    };

    startTransition(() => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: "cancelled_by_patient",
                cancellationReason: reason,
                cancelledBy: { userId: currentUser?.id || "patient", role: "patient" },
                activeOfferExpiresAt: undefined,
              }
            : b
        )
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    return { success: true };
  };

  // 7. Admin: Save or update service (with explicit commission %)
  const adminSaveService = (
    serviceData: Partial<Service> & {
      name: string;
      basePrice: number;
      commissionPercentage: number;
      categoryId: string;
    }
  ) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Unauthorized: Admin required" };

    if (serviceData.commissionPercentage < 0 || serviceData.commissionPercentage > 100) {
      return { success: false, error: "Commission percentage must be between 0% and 100%" };
    }

    const now = Date.now();
    const isEditing = !!serviceData.id;
    let savedService: Service;

    if (isEditing) {
      savedService = {
        ...services.find((s) => s.id === serviceData.id)!,
        ...serviceData,
      } as Service;

      setServices((prev) => prev.map((s) => (s.id === serviceData.id ? savedService : s)));
    } else {
      savedService = {
        id: `srv_${now}_${Math.random().toString(36).substring(2, 6)}`,
        categoryId: serviceData.categoryId,
        name: serviceData.name,
        slug: serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: serviceData.description || "",
        basePrice: serviceData.basePrice,
        durationMinutes: serviceData.durationMinutes || 60,
        commissionPercentage: serviceData.commissionPercentage,
        serviceAreas: serviceData.serviceAreas || ["10001", "10002", "10003"],
        eligibilityConditions: serviceData.eligibilityConditions || [],
        isActive: serviceData.isActive ?? true,
        createdAt: now,
      };

      setServices((prev) => [savedService, ...prev]);
    }

    // Append to audit log
    const audit: AuditLog = {
      id: `aud_${now}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: "admin",
      action: isEditing ? "SERVICE_UPDATED" : "SERVICE_CREATED",
      entityType: "service",
      entityId: savedService.id,
      details: {
        after: {
          name: savedService.name,
          commissionPercentage: savedService.commissionPercentage,
          basePrice: savedService.basePrice,
        },
        rationale: `Commission rate set to ${savedService.commissionPercentage}%`,
      },
      timestamp: now,
    };

    setAuditLogs((prev) => [audit, ...prev]);
    return { success: true };
  };

  const adminToggleServiceStatus = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // 8. Admin: Verify Nurse Credentials
  const adminVerifyNurse = (nurseId: string, status: QualificationStatus) => {
    if (currentUser?.role !== "admin") return;
    const now = Date.now();
    setNurseProfiles((prev) =>
      prev.map((n) =>
        n.id === nurseId
          ? {
              ...n,
              qualificationStatus: status,
              verifiedAt: status === "verified" ? now : undefined,
              verifiedByAdminId: currentUser.id,
            }
          : n
      )
    );

    const audit: AuditLog = {
      id: `aud_${now}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: "admin",
      action: "NURSE_QUALIFICATION_UPDATED",
      entityType: "nurse",
      entityId: nurseId,
      details: {
        after: { qualificationStatus: status },
      },
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const adminToggleNurseQualification = (nurseId: string, serviceId: string, isApproved: boolean) => {
    if (currentUser?.role !== "admin") return;
    setNurseQualifications((prev) => {
      const existing = prev.find((q) => q.nurseId === nurseId && q.serviceId === serviceId);
      if (existing) {
        return prev.map((q) =>
          q.id === existing.id
            ? { ...q, isApproved, approvedByAdminId: currentUser.id, approvedAt: Date.now() }
            : q
        );
      } else {
        return [
          ...prev,
          {
            id: `nq_${Date.now()}`,
            nurseId,
            serviceId,
            isApproved,
            approvedByAdminId: currentUser.id,
            approvedAt: Date.now(),
          },
        ];
      }
    });
  };

  // 9. Admin: Invite Nurse (generates cryptographic one-time activation link)
  const adminInviteNurse = (
    fullName: string,
    email: string,
    phone: string,
    licenseNumber: string,
    serviceAreas: string[]
  ) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Unauthorized" };

    const now = Date.now();
    const token = `tok_${now}_${Math.random().toString(36).substring(2, 12)}`;
    const invitation: NurseInvitation = {
      id: `inv_${now}`,
      email,
      fullName,
      phoneNumber: phone,
      licenseNumber,
      serviceAreas,
      token,
      invitedByAdminId: currentUser.id,
      expiresAt: now + 72 * 3600 * 1000, // 72-hour validity
      isClaimed: false,
      createdAt: now,
    };

    setInvitations((prev) => [invitation, ...prev]);

    const audit: AuditLog = {
      id: `aud_${now}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: "admin",
      action: "NURSE_INVITATION_CREATED",
      entityType: "nurse",
      entityId: invitation.id,
      details: {
        after: { email, licenseNumber },
        rationale: "Secure one-time activation link generated for nurse onboarding.",
      },
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true, invitation };
  };

  // 10. Nurse: Claim invitation & activate account
  const claimNurseInvitation = (token: string, fullName: string, phone: string) => {
    const inv = invitations.find((i) => i.token === token && !i.isClaimed);
    if (!inv) return { success: false, error: "Invalid or expired invitation link" };

    const now = Date.now();
    const userId = `usr_nurse_${now}`;
    const nurseId = `nurse_prof_${now}`;

    const newUser: User = {
      id: userId,
      email: inv.email,
      fullName: fullName || inv.fullName,
      phoneNumber: phone || inv.phoneNumber,
      role: "nurse",
      status: "active",
      createdAt: now,
      avatarUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80",
    };

    const newProfile: NurseProfile = {
      id: nurseId,
      userId,
      licenseNumber: inv.licenseNumber,
      qualificationStatus: "unverified",
      serviceAreas: inv.serviceAreas,
      isAvailable: true,
      completedBookingsCount: 0,
      cancellationCount: 0,
      ratingAverage: 5.0,
      ratingCount: 0,
      hourlyBaseRate: 60,
    };

    setUsers((prev) => [newUser, ...prev]);
    setNurseProfiles((prev) => [newProfile, ...prev]);
    setInvitations((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, isClaimed: true } : i))
    );
    setCurrentUser(newUser);

    return { success: true };
  };

  // 11. Admin: Record Manual Payment Receipt
  const adminRecordPayment = (
    bookingId: string,
    amount: number,
    method: PaymentMethod,
    referenceNumber: string,
    notes?: string
  ) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Admin authorized only" };

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    const now = Date.now();
    const paymentId = `pay_${now}`;

    const newPayment: PaymentRecord = {
      id: paymentId,
      bookingId,
      amount,
      paymentMethod: method,
      referenceNumber,
      status: "received",
      receivedAt: now,
      verifiedByAdminId: currentUser.id,
      verifiedAt: now,
      reconciliationStatus: "reconciled",
      notes,
      createdAt: now,
    };

    // Calculate and accrue nurse payable using the booking's LOCKED commission snapshot
    const financials = calculateFinancials(booking.servicePriceSnapshot, booking.lockedCommissionPercentage);

    const newPayable: NursePayable = {
      id: `np_${now}`,
      bookingId,
      nurseId: booking.currentNurseId || "unassigned",
      grossServiceAmount: financials.grossServiceAmount,
      careoonCommissionAmount: financials.careoonCommissionAmount,
      adjustmentsAmount: 0,
      netPayableAmount: financials.netPayableAmount,
      status: "accrued",
      createdAt: now,
    };

    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId,
      actorId: currentUser.id,
      actorRole: "admin",
      actorName: currentUser.fullName,
      eventType: "PAYMENT_RECORDED",
      description: `Payment of $${amount.toFixed(2)} recorded and verified via ${method}. Reference: ${referenceNumber}.`,
      timestamp: now,
    };

    startTransition(() => {
      setPayments((prev) => [newPayment, ...prev]);
      setNursePayables((prev) => [newPayable, ...prev]);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "closed", closedAt: now } : b))
      );
      setTimelineEvents((prev) => [...prev, newEvent]);
    });

    const audit: AuditLog = {
      id: `aud_${now}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: "admin",
      action: "PAYMENT_RECORDED_AND_VERIFIED",
      entityType: "payment",
      entityId: paymentId,
      details: {
        after: { amount, method, referenceNumber, bookingId },
        rationale: `Manual payment receipt verified. Locked commission rate: ${booking.lockedCommissionPercentage}%. Accrued nurse payable: $${financials.netPayableAmount}.`,
      },
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true };
  };

  // 12. Admin: Create Weekly Payout Batch
  const adminCreatePayoutBatch = (payableIds: string[]) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Unauthorized" };

    const selectedPayables = nursePayables.filter((p) => payableIds.includes(p.id) && p.status === "accrued");
    if (selectedPayables.length === 0) return { success: false, error: "No eligible accrued payables selected" };

    const totalAmount = selectedPayables.reduce((acc, curr) => acc + curr.netPayableAmount, 0);
    const uniqueNurses = new Set(selectedPayables.map((p) => p.nurseId)).size;
    const now = Date.now();
    const batchId = `batch_${now}`;

    const newBatch: PayoutBatch = {
      id: batchId,
      batchReference: `BATCH-${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}-${Math.floor(Math.random() * 90 + 10)}`,
      periodStartDate: new Date(now - 7 * 86400000).toISOString().split("T")[0],
      periodEndDate: new Date().toISOString().split("T")[0],
      totalAmount,
      totalNursesCount: uniqueNurses,
      payableIds,
      status: "draft",
      createdAt: now,
    };

    setPayoutBatches((prev) => [newBatch, ...prev]);
    setNursePayables((prev) =>
      prev.map((p) => (payableIds.includes(p.id) ? { ...p, status: "batched", payoutBatchId: batchId } : p))
    );

    return { success: true, batchId };
  };

  // 13. Admin: Mark Payout Batch Settled with Bank Reference
  const adminSettlePayoutBatch = (batchId: string, paymentReference: string) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Unauthorized" };

    const batch = payoutBatches.find((b) => b.id === batchId);
    if (!batch) return { success: false, error: "Batch not found" };

    const now = Date.now();
    setPayoutBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: "completed",
              settledByAdminId: currentUser.id,
              paymentReference,
              completedAt: now,
            }
          : b
      )
    );

    setNursePayables((prev) =>
      prev.map((p) => (batch.payableIds.includes(p.id) ? { ...p, status: "paid", paidAt: now } : p))
    );

    const audit: AuditLog = {
      id: `aud_${now}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: "admin",
      action: "PAYOUT_BATCH_SETTLED",
      entityType: "payout",
      entityId: batchId,
      details: {
        after: { paymentReference, totalAmount: batch.totalAmount },
        rationale: "Bank wire/settlement transfer reference verified and recorded.",
      },
      timestamp: now,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return { success: true };
  };

  // 14. Admin: Reassign booking manually
  const adminReassignBooking = (bookingId: string, nurseId: string, reason: string) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Unauthorized" };

    const now = Date.now();
    const newEvent: BookingTimelineEvent = {
      id: `evt_${now}`,
      bookingId,
      actorId: currentUser.id,
      actorRole: "admin",
      actorName: currentUser.fullName,
      eventType: "ADMIN_REASSIGNED",
      description: `Admin manually reassigned booking to nurse. Rationale: ${reason}.`,
      timestamp: now,
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              currentNurseId: nurseId,
              status: "confirmed",
              confirmedAt: now,
            }
          : b
      )
    );
    setTimelineEvents((prev) => [...prev, newEvent]);

    return { success: true };
  };

  // 15. Reviews
  const submitReview = (bookingId: string, rating: number, text: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };
    if (!["completed", "closed"].includes(booking.status)) {
      return { success: false, error: "Reviews are permitted only for completed services" };
    }

    const now = Date.now();
    const newReview: ServiceReview = {
      id: `rev_${now}`,
      bookingId,
      patientId: currentUser?.id || booking.patientId,
      patientName: currentUser?.fullName || "Patient",
      nurseId: booking.currentNurseId || "nurse",
      rating,
      reviewText: text,
      isPublic: true,
      createdAt: now,
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate nurse rating
    if (booking.currentNurseId) {
      setNurseProfiles((prev) =>
        prev.map((np) => {
          if (np.id !== booking.currentNurseId) return np;
          const newCount = np.ratingCount + 1;
          const newAvg = (np.ratingAverage * np.ratingCount + rating) / newCount;
          return {
            ...np,
            ratingCount: newCount,
            ratingAverage: Math.round(newAvg * 100) / 100,
          };
        })
      );
    }

    return { success: true };
  };

  // 16. Support Ticket
  const fileTicket = (
    bookingId: string | undefined,
    category: SupportTicket["category"],
    subject: string,
    description: string
  ) => {
    if (!currentUser) return { success: false, error: "Must be logged in" };

    const now = Date.now();
    const newTicket: SupportTicket = {
      id: `tkt_${now}`,
      bookingId,
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      reporterRole: currentUser.role,
      category,
      subject,
      description,
      status: "open",
      createdAt: now,
    };

    setTickets((prev) => [newTicket, ...prev]);
    return { success: true };
  };

  const adminResolveTicket = (ticketId: string, notes: string) => {
    if (currentUser?.role !== "admin") return;
    const now = Date.now();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "resolved",
              resolutionNotes: notes,
              resolvedByAdminId: currentUser.id,
              resolvedAt: now,
            }
          : t
      )
    );
  };

  const nurseToggleAvailability = (nurseId: string, isAvailable: boolean) => {
    setNurseProfiles((prev) =>
      prev.map((n) => (n.id === nurseId ? { ...n, isAvailable } : n))
    );
  };

  const nurseUpdateServiceAreas = (nurseId: string, areas: string[]) => {
    setNurseProfiles((prev) =>
      prev.map((n) => (n.id === nurseId ? { ...n, serviceAreas: areas } : n))
    );
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCategories(INITIAL_CATEGORIES);
    setServices(INITIAL_SERVICES);
    setPatientProfiles(INITIAL_PATIENT_PROFILES);
    setNurseProfiles(INITIAL_NURSE_PROFILES);
    setNurseQualifications(INITIAL_NURSE_QUALIFICATIONS);
    setBookings(INITIAL_BOOKINGS);
    setOffers(INITIAL_OFFERS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setPayments(INITIAL_PAYMENTS);
    setNursePayables(INITIAL_NURSE_PAYABLES);
    setPayoutBatches(INITIAL_PAYOUT_BATCHES);
    setReviews(INITIAL_REVIEWS);
    setTickets(INITIAL_TICKETS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setInvitations([]);
  };

  return (
    <CareoonContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        users,
        categories,
        services,
        nurseProfiles,
        patientProfiles,
        nurseQualifications,
        bookings,
        offers,
        timelineEvents,
        payments,
        nursePayables,
        payoutBatches,
        reviews,
        tickets,
        auditLogs,
        invitations,
        getCurrentPatientProfile,
        getCurrentNurseProfile,
        getEligibleNursesForService,
        createBookingWithNurseOffer,
        reselectNurseForBooking,
        patientCancelBooking,
        submitReview,
        fileTicket,
        nurseAcceptOffer,
        nurseRejectOffer,
        nurseUpdateJobProgress,
        nurseToggleAvailability,
        nurseUpdateServiceAreas,
        claimNurseInvitation,
        adminSaveService,
        adminToggleServiceStatus,
        adminVerifyNurse,
        adminToggleNurseQualification,
        adminInviteNurse,
        adminRecordPayment,
        adminCreatePayoutBatch,
        adminSettlePayoutBatch,
        adminReassignBooking,
        adminResolveTicket,
        resetAllData,
      }}
    >
      {children}
    </CareoonContext.Provider>
  );
}

export function useCareoon() {
  const context = useContext(CareoonContext);
  if (!context) {
    throw new Error("useCareoon must be used within a CareoonProvider");
  }
  return context;
}
