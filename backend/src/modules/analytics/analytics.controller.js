import Shop from "../stores/stores.model.js";

export const getShopAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id ?? req.user.id;

    const shop = await Shop.findOne({ owner: ownerId });
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const reviews = shop.reviews ?? [];
    const totalReviews = reviews.length;
    const avgRating = totalReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // ── Rating Breakdown ──────────────────────────────────────────────────────
    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      name:  star,
      value: reviews.filter((r) => r.rating === star).length,
    }));

    // ── Monthly Rating Trend ──────────────────────────────────────────────────
    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthMap   = {};

    reviews.forEach((review) => {
      const month = new Date(review.createdAt).toLocaleString("default", { month: "short" });
      if (!monthMap[month]) monthMap[month] = { month, ratingSum: 0, count: 0 };
      monthMap[month].ratingSum += review.rating;
      monthMap[month].count     += 1;
    });

    const ratingTrend = Object.values(monthMap)
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
      .map((m) => ({
        month:  m.month,
        rating: Number((m.ratingSum / m.count).toFixed(2)),
      }));

    // ── Weekly Review Volume ──────────────────────────────────────────────────
    const weekMap = {};
    reviews.forEach((review) => {
      const d    = new Date(review.createdAt);
      const week = `W${Math.ceil(d.getDate() / 7)}`;
      if (!weekMap[week]) weekMap[week] = { week, reviews: 0 };
      weekMap[week].reviews += 1;
    });

    const reviewVolume = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          avgRating:    Number(avgRating.toFixed(2)),
          reviewCount:  totalReviews,
          profileViews: shop.profileViews || 0,
        },
        ratingTrend,
        reviewVolume,
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching analytics" });
  }
};