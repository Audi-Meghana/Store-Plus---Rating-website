/**
 * ratingRecalculator.js
 * Runs every 6 hours — recalculates avgRating + reviewCount for every shop
 * from both the separate Review collection and embedded reviews.
 */

import Shop   from "../modules/stores/stores.model.js";
import Review from "../modules/reviews/reviews.model.js";

const ratingRecalculator = async () => {
  try {
    const shops = await Shop.find().select("_id reviews avgRating reviewCount");
    let updated = 0;

    for (const shop of shops) {
      // Reviews from separate collection
      const separateReviews = await Review.find({
        shop:      shop._id,
        isVisible: { $ne: false },
      });

      // Embedded reviews
      const embeddedReviews = (shop.reviews ?? []).filter((r) => r.isVisible !== false);

      // Deduplicate — separate collection takes priority
      const separateUserIds = new Set(separateReviews.map((r) => r.user.toString()));
      const uniqueEmbedded  = embeddedReviews.filter(
        (r) => !separateUserIds.has(r.user.toString())
      );

      const all   = [...separateReviews, ...uniqueEmbedded];
      const count = all.length;
      const avg   = count === 0
        ? 0
        : all.reduce((sum, r) => sum + r.rating, 0) / count;

      const newAvg   = Math.round(avg * 10) / 10;
      const newCount = count;

      // Only save if something changed
      if (shop.avgRating !== newAvg || shop.reviewCount !== newCount) {
        await Shop.findByIdAndUpdate(shop._id, {
          avgRating:   newAvg,
          reviewCount: newCount,
        });
        updated++;
      }
    }

    console.log(`[ratingRecalculator] ✅ Updated ${updated}/${shops.length} shop(s)`);
  } catch (err) {
    console.error("[ratingRecalculator] ❌ Error:", err.message);
  }
};

export default ratingRecalculator;