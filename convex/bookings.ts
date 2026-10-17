import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Server-side offer expiration scheduled mutation
export const internalExpireOffer = internalMutation({
  args: { offerId: v.id("bookingOffers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer || offer.status !== "pending") return;

    const now = Date.now();
    await ctx.db.patch(args.offerId, {
      status: "expired",
      respondedAt: now,
    });

    const booking = await ctx.db.get(offer.bookingId);
    if (booking && booking.status === "offer_pending") {
      await ctx.db.patch(booking._id, {
        status: "reselection_required",
        activeOfferExpiresAt: undefined,
      });

      await ctx.db.insert("bookingTimelineEvents", {
        bookingId: booking._id,
        actorId: "system",
        actorRole: "system",
        actorName: "Careoon Automation",
        eventType: "OFFER_EXPIRED",
        description: "15-minute response deadline elapsed. Patient notified to reselect nurse.",
        timestamp: now,
      });
    }
  },
});

// Nurse responds to offer: Accept or Reject
export const nurseRespondOffer = mutation({
  args: {
    offerId: v.id("bookingOffers"),
    nurseId: v.id("nurseProfiles"),
    decision: v.union(v.literal("accept"), v.literal("reject")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found.");
    if (offer.nurseId !== args.nurseId) throw new Error("Unauthorized offer access.");
    if (offer.status !== "pending") throw new Error(`Offer is already ${offer.status}.`);

    const now = Date.now();
    if (offer.expiresAt < now) {
      await ctx.db.patch(args.offerId, { status: "expired", respondedAt: now });
      throw new Error("This offer has expired. The 15-minute response window has elapsed.");
    }

    const booking = await ctx.db.get(offer.bookingId);
    if (!booking) throw new Error("Booking not found.");

    if (args.decision === "accept") {
      await ctx.db.patch(args.offerId, {
        status: "accepted",
        respondedAt: now,
      });

      await ctx.db.patch(booking._id, {
        status: "confirmed",
        confirmedAt: now,
        activeOfferExpiresAt: undefined,
      });

      await ctx.db.insert("bookingTimelineEvents", {
        bookingId: booking._id,
        actorId: args.nurseId,
        actorRole: "nurse",
        actorName: "Nurse",
        eventType: "OFFER_ACCEPTED",
        description: "Nurse accepted offer within 15-minute window. Booking confirmed.",
        timestamp: now,
      });
    } else {
      await ctx.db.patch(args.offerId, {
        status: "rejected",
        respondedAt: now,
        rejectionReason: args.reason || "Declined by nurse",
      });

      await ctx.db.patch(booking._id, {
        status: "reselection_required",
        activeOfferExpiresAt: undefined,
      });

      await ctx.db.insert("bookingTimelineEvents", {
        bookingId: booking._id,
        actorId: args.nurseId,
        actorRole: "nurse",
        actorName: "Nurse",
        eventType: "OFFER_REJECTED",
        description: `Nurse declined offer. Reason: ${args.reason || "Unavailable"}.`,
        timestamp: now,
      });
    }
  },
});
