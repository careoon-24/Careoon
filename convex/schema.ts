import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    role: v.union(v.literal("patient"), v.literal("nurse"), v.literal("admin")),
    fullName: v.string(),
    phoneNumber: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("pending_activation")),
    createdAt: v.number(),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_role", ["role"]),

  patientProfiles: defineTable({
    userId: v.id("users"),
    address: v.object({
      street: v.string(),
      apartment: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      landmark: v.optional(v.string()),
    }),
    emergencyContact: v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }),
    medicalAlertNotes: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  nurseProfiles: defineTable({
    userId: v.id("users"),
    licenseNumber: v.string(),
    qualificationStatus: v.union(v.literal("unverified"), v.literal("verified"), v.literal("rejected")),
    verifiedAt: v.optional(v.number()),
    verifiedByAdminId: v.optional(v.id("users")),
    serviceAreas: v.array(v.string()),
    isAvailable: v.boolean(),
    completedBookingsCount: v.number(),
    cancellationCount: v.number(),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    hourlyBaseRate: v.optional(v.number()),
    bio: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),
  }).index("by_userId", ["userId"]).index("by_status", ["qualificationStatus"]),

  nurseServiceQualifications: defineTable({
    nurseId: v.id("nurseProfiles"),
    serviceId: v.id("services"),
    isApproved: v.boolean(),
    approvedByAdminId: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
  }).index("by_nurse_service", ["nurseId", "serviceId"]),

  serviceCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    iconName: v.string(),
    isActive: v.boolean(),
    displayOrder: v.number(),
  }).index("by_slug", ["slug"]),

  services: defineTable({
    categoryId: v.id("serviceCategories"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    basePrice: v.number(),
    durationMinutes: v.number(),
    commissionPercentage: v.number(), // Admin configured commission percentage
    serviceAreas: v.array(v.string()),
    eligibilityConditions: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["categoryId"]).index("by_slug", ["slug"]),

  bookings: defineTable({
    patientId: v.id("users"),
    serviceId: v.id("services"),
    serviceAddress: v.object({
      street: v.string(),
      apartment: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      instructions: v.optional(v.string()),
    }),
    scheduledDate: v.string(),
    scheduledTimeSlot: v.string(),
    status: v.string(),
    currentNurseId: v.optional(v.id("nurseProfiles")),
    
    // Financial Snapshots
    servicePriceSnapshot: v.number(),
    lockedCommissionPercentage: v.number(),
    calculatedCommissionAmount: v.number(),
    calculatedNursePayable: v.number(),
    
    // Offer & deadlines
    activeOfferId: v.optional(v.id("bookingOffers")),
    activeOfferExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
    arrivedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    
    cancellationReason: v.optional(v.string()),
    cancelledBy: v.optional(v.object({
      userId: v.id("users"),
      role: v.string(),
    })),
    disputeReason: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
  }).index("by_patient", ["patientId"]).index("by_nurse", ["currentNurseId"]).index("by_status", ["status"]),

  bookingOffers: defineTable({
    bookingId: v.id("bookings"),
    nurseId: v.id("nurseProfiles"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("expired"), v.literal("superseded")),
    offeredAt: v.number(),
    expiresAt: v.number(),
    respondedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  }).index("by_booking", ["bookingId"]).index("by_nurse", ["nurseId"]).index("by_status", ["status"]),

  bookingTimelineEvents: defineTable({
    bookingId: v.id("bookings"),
    actorId: v.string(),
    actorRole: v.string(),
    actorName: v.string(),
    eventType: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_booking", ["bookingId"]),

  payments: defineTable({
    bookingId: v.id("bookings"),
    amount: v.number(),
    paymentMethod: v.string(),
    referenceNumber: v.string(),
    status: v.string(),
    receivedAt: v.optional(v.number()),
    verifiedByAdminId: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
    reconciliationStatus: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_booking", ["bookingId"]).index("by_status", ["status"]),

  nursePayables: defineTable({
    bookingId: v.id("bookings"),
    nurseId: v.id("nurseProfiles"),
    grossServiceAmount: v.number(),
    careoonCommissionAmount: v.number(),
    adjustmentsAmount: v.number(),
    netPayableAmount: v.number(),
    status: v.string(),
    holdReason: v.optional(v.string()),
    payoutBatchId: v.optional(v.id("payoutBatches")),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  }).index("by_nurse", ["nurseId"]).index("by_status", ["status"]).index("by_batch", ["payoutBatchId"]),

  payoutBatches: defineTable({
    batchReference: v.string(),
    periodStartDate: v.string(),
    periodEndDate: v.string(),
    totalAmount: v.number(),
    totalNursesCount: v.number(),
    payableIds: v.array(v.id("nursePayables")),
    status: v.string(),
    settledByAdminId: v.optional(v.id("users")),
    paymentReference: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  reviews: defineTable({
    bookingId: v.id("bookings"),
    patientId: v.id("users"),
    patientName: v.string(),
    nurseId: v.id("nurseProfiles"),
    rating: v.number(),
    reviewText: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_booking", ["bookingId"]).index("by_nurse", ["nurseId"]),

  supportTickets: defineTable({
    bookingId: v.optional(v.id("bookings")),
    reporterId: v.id("users"),
    reporterName: v.string(),
    reporterRole: v.string(),
    category: v.string(),
    subject: v.string(),
    description: v.string(),
    status: v.string(),
    resolutionNotes: v.optional(v.string()),
    resolvedByAdminId: v.optional(v.id("users")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_status", ["status"]).index("by_reporter", ["reporterId"]),

  auditLogs: defineTable({
    actorId: v.string(),
    actorName: v.string(),
    actorRole: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      rationale: v.optional(v.string()),
    }),
    timestamp: v.number(),
  }).index("by_entity", ["entityType", "entityId"]).index("by_timestamp", ["timestamp"]),

  nurseInvitations: defineTable({
    email: v.string(),
    fullName: v.string(),
    phoneNumber: v.string(),
    token: v.string(),
    licenseNumber: v.string(),
    serviceAreas: v.array(v.string()),
    invitedByAdminId: v.id("users"),
    expiresAt: v.number(),
    isClaimed: v.boolean(),
    createdAt: v.number(),
  }).index("by_token", ["token"]).index("by_email", ["email"]),
});
