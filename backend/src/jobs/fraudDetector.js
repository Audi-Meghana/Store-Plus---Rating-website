/**
 * fraudDetector.js
 * Runs every day — flags suspicious reviews based on heuristics:
 * 1. Same user reviewing multiple shops in under 1 minute
 * 2. All 5-star reviews from brand new accounts (created < 1 day before review)
 * 3. Duplicate review text across different shops
 * Flagged reviews are hidden (isVisible = false) and owner is notified.
 */

import Review from "../modules/reviews/reviews.model.js";
import Shop   from "../modules/stores/stores.model.js";
import User   from "../modules/auth/auth.model.js";

const fraudDetector = async () => {
  try {
    let flagged = 0;

    // ── Rule 1: Same user, multiple reviews within 60 seconds ────────────────
    const recentReviews = await Review.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
      isVisible: true,
    }).sort({ user: 1, createdAt: 1 });

    const byUser = {};
    recentReviews.forEach((r) => {
      const uid = r.user.toString();
      if (!byUser[uid]) byUser[uid] = [];
      byUser[uid].push(r);
    });

    for (const [, reviews] of Object.entries(byUser)) {
      for (let i = 1; i < reviews.length; i++) {
        const diff = reviews[i].createdAt - reviews[i - 1].createdAt;
        if (diff < 60 * 1000) { // less than 60 seconds apart
          await Review.findByIdAndUpdate(reviews[i]._id, { isVisible: false });
          flagged++;
          console.log(`[fraudDetector] Rule 1 — flagged review ${reviews[i]._id} (rapid submission)`);
        }
      }
    }

    // ── Rule 2: 5-star review from account created < 1 day before review ─────
    const fiveStarReviews = await Review.find({
      rating:    5,
      isVisible: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).populate("user", "createdAt");

    for (const review of fiveStarReviews) {
      if (!review.user?.createdAt) continue;
      const accountAge = review.createdAt - review.user.createdAt;
      if (accountAge < 24 * 60 * 60 * 1000) { // account < 1 day old
        await Review.findByIdAndUpdate(review._id, { isVisible: false });
        flagged++;
        console.log(`[fraudDetector] Rule 2 — flagged review ${review._id} (new account 5-star)`);
      }
    }

    // ── Rule 3: Duplicate review text across different shops ──────────────────
    const allReviews = await Review.find({ isVisible: true, text: { $ne: "" } })
      .select("_id text shop user");

    const textMap = {};
    for (const review of allReviews) {
      const key = review.text?.trim().toLowerCase();
      if (!key || key.length < 20) continue;
      if (!textMap[key]) textMap[key] = [];
      textMap[key].push(review);
    }

    for (const [, reviews] of Object.entries(textMap)) {
      if (reviews.length < 2) continue;
      // Flag all but the first (oldest would be first if sorted)
      for (let i = 1; i < reviews.length; i++) {
        await Review.findByIdAndUpdate(reviews[i]._id, { isVisible: false });
        flagged++;
        console.log(`[fraudDetector] Rule 3 — flagged review ${reviews[i]._id} (duplicate text)`);
      }
    }

    // ── Notify admins if anything was flagged ─────────────────────────────────
    if (flagged > 0) {
      const admins = await User.find({ role: "admin" });
      await Promise.all(
        admins.map((admin) =>
          User.findByIdAndUpdate(admin._id, {
            $push: {
              notifications: {
                $each: [
                  {
                    type:  "system",
                    title: "🚨 Fraud Detection Alert",
                    body:  `${flagged} suspicious review(s) were automatically hidden. Check moderation panel.`,
                    read:  false,
                  },
                ],
                $slice:    -50,
                $position: 0,
              },
            },
          })
        )
      );
    }

    console.log(`[fraudDetector] ✅ Flagged ${flagged} suspicious review(s)`);
  } catch (err) {
    console.error("[fraudDetector] ❌ Error:", err.message);
  }
};

export default fraudDetector;