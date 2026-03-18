/**
 * analyticsService.js
 * Provides analytics data for shop owners and admin.
 * Reads from shop.analytics (daily snapshots) + live review/deal data.
 */

import Shop   from "../modules/stores/stores.model.js";
import Review from "../modules/reviews/reviews.model.js";

// ── Get analytics for a single shop ──────────────────────────────────────────
export const getShopAnalytics = async (shopId, days = 30) => {
  const shop = await Shop.findById(shopId).select(
    "name analytics avgRating reviewCount profileViews deals reviews"
  );
  if (!shop) throw { status: 404, message: "Shop not found" };

  // Slice last N days of snapshots
  const snapshots = (shop.analytics ?? []).slice(-days);

  // Reviews from separate collection in the last N days
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentReviews = await Review.find({
    shop:      shopId,
    createdAt: { $gte: since },
  }).select("rating createdAt");

  // Group reviews by date
  const reviewsByDate = {};
  recentReviews.forEach((r) => {
    const date = r.createdAt.toISOString().split("T")[0];
    if (!reviewsByDate[date]) reviewsByDate[date] = [];
    reviewsByDate[date].push(r.rating);
  });

  // Rating distribution
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  recentReviews.forEach((r) => { ratingDist[r.rating] = (ratingDist[r.rating] ?? 0) + 1; });

  // Active vs expired deals
  const activeDeals  = (shop.deals ?? []).filter((d) => d.active).length;
  const expiredDeals = (shop.deals ?? []).filter((d) => !d.active).length;

  // Views trend from snapshots
  const viewsTrend = snapshots.map((s) => ({ date: s.date, views: s.views ?? 0 }));

  // Rating trend from snapshots
  const ratingTrend = snapshots.map((s) => ({ date: s.date, avgRating: s.avgRating ?? 0 }));

  // Review trend from snapshots
  const reviewTrend = snapshots.map((s) => ({ date: s.date, newReviews: s.newReviews ?? 0 }));

  return {
    overview: {
      avgRating:    shop.avgRating    ?? 0,
      reviewCount:  shop.reviewCount  ?? 0,
      profileViews: shop.profileViews ?? 0,
      activeDeals,
      expiredDeals,
    },
    ratingDistribution: ratingDist,
    viewsTrend,
    ratingTrend,
    reviewTrend,
    recentReviews: recentReviews.length,
  };
};

// ── Get platform-wide analytics (admin) ──────────────────────────────────────
export const getPlatformAnalytics = async (days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalShops,
    activeShops,
    totalReviews,
    recentReviews,
    topShops,
    categoryDist,
  ] = await Promise.all([
    Shop.countDocuments(),
    Shop.countDocuments({ isActive: true, isVerified: true }),
    Review.countDocuments(),
    Review.countDocuments({ createdAt: { $gte: since } }),
    Shop.find({ isVerified: true })
      .sort({ avgRating: -1 })
      .limit(10)
      .select("name avgRating reviewCount category"),
    Shop.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, avgRating: { $avg: "$avgRating" } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    overview: {
      totalShops,
      activeShops,
      totalReviews,
      recentReviews,
    },
    topShops,
    categoryDistribution: categoryDist.map((c) => ({
      category:  c._id,
      count:     c.count,
      avgRating: Math.round((c.avgRating ?? 0) * 10) / 10,
    })),
  };
};

// ── Increment profile view count ──────────────────────────────────────────────
export const incrementViews = async (shopId) => {
  await Shop.findByIdAndUpdate(shopId, { $inc: { profileViews: 1 } });
};