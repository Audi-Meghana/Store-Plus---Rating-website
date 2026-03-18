/**
 * analyticsSnapshot.js
 * Runs once per day at midnight — saves a daily snapshot of each shop's
 * stats (views, reviews, rating) into an embedded analytics array on the shop.
 * Keeps last 90 days of snapshots.
 */

import Shop   from "../modules/stores/stores.model.js";
import Review from "../modules/reviews/reviews.model.js";

const analyticsSnapshot = async () => {
  try {
    const today  = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const shops  = await Shop.find().select("_id name avgRating reviewCount profileViews analytics");
    let captured = 0;

    for (const shop of shops) {
      // Count today's new reviews
      const startOfDay = new Date(today);
      const endOfDay   = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const newReviewsToday = await Review.countDocuments({
        shop:      shop._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const snapshot = {
        date:        today,
        avgRating:   shop.avgRating   ?? 0,
        reviewCount: shop.reviewCount ?? 0,
        newReviews:  newReviewsToday,
        views:       shop.profileViews ?? 0,
      };

      // Init analytics array if missing
      if (!Array.isArray(shop.analytics)) shop.analytics = [];

      // Remove duplicate snapshot for today if exists
      shop.analytics = shop.analytics.filter((s) => s.date !== today);

      // Add today's snapshot
      shop.analytics.push(snapshot);

      // Keep only last 90 days
      if (shop.analytics.length > 90) {
        shop.analytics = shop.analytics.slice(-90);
      }

      // Reset daily view counter
      shop.profileViews = 0;

      await shop.save();
      captured++;
    }

    console.log(`[analyticsSnapshot] ✅ Captured snapshots for ${captured} shop(s)`);
  } catch (err) {
    console.error("[analyticsSnapshot] ❌ Error:", err.message);
  }
};

export default analyticsSnapshot;