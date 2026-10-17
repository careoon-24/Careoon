import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all active services for patients/public
export const listActiveServices = query({
  args: { categorySlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let services = await ctx.db
      .query("services")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.categorySlug) {
      const category = await ctx.db
        .query("serviceCategories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .first();
      if (category) {
        services = services.filter((s) => s.categoryId === category._id);
      }
    }

    // Strip commission percentage from patient/public view for security
    return services.map((s) => ({
      _id: s._id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      basePrice: s.basePrice,
      durationMinutes: s.durationMinutes,
      serviceAreas: s.serviceAreas,
      eligibilityConditions: s.eligibilityConditions,
      isActive: s.isActive,
    }));
  },
});

// Admin list all services (includes commission percentage)
export const adminListAllServices = query({
  handler: async (ctx) => {
    return await ctx.db.query("services").order("desc").collect();
  },
});

// Admin create or update service (strictly validates commission %)
export const adminUpsertService = mutation({
  args: {
    serviceId: v.optional(v.id("services")),
    categoryId: v.id("serviceCategories"),
    name: v.string(),
    description: v.string(),
    basePrice: v.number(),
    durationMinutes: v.number(),
    commissionPercentage: v.number(),
    serviceAreas: v.array(v.string()),
    eligibilityConditions: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.commissionPercentage < 0 || args.commissionPercentage > 100) {
      throw new Error("Commission percentage must be between 0 and 100 percent.");
    }
    if (args.basePrice < 0) {
      throw new Error("Base price cannot be negative.");
    }

    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (args.serviceId) {
      await ctx.db.patch(args.serviceId, {
        categoryId: args.categoryId,
        name: args.name,
        slug,
        description: args.description,
        basePrice: args.basePrice,
        durationMinutes: args.durationMinutes,
        commissionPercentage: args.commissionPercentage,
        serviceAreas: args.serviceAreas,
        eligibilityConditions: args.eligibilityConditions,
        isActive: args.isActive,
      });
      return args.serviceId;
    } else {
      return await ctx.db.insert("services", {
        categoryId: args.categoryId,
        name: args.name,
        slug,
        description: args.description,
        basePrice: args.basePrice,
        durationMinutes: args.durationMinutes,
        commissionPercentage: args.commissionPercentage,
        serviceAreas: args.serviceAreas,
        eligibilityConditions: args.eligibilityConditions,
        isActive: args.isActive,
        createdAt: Date.now(),
      });
    }
  },
});
