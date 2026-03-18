/**
 * jobScheduler.js
 * All 5 background jobs defined and scheduled in one file.
 * No separate imports needed — just place this in src/jobs/
 */

import cron   from "node-cron";
import Shop   from "../modules/stores/stores.model.js";
import User   from "../modules/auth/auth.model.js";
import Review from "../modules/reviews/reviews.model.js";

// ══════════════════════════════════════════════════════════════════
// JOB 1 — Deal Expiry (every hour)
// Marks deals inactive when their expiry date has passed
// ══════════════════════════════════════════════════════════════════
const dealExpiry = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const shops = await Shop.find({ "deals.active": true });
    let expired = 0;

    for (const shop of shops) {
      let changed = false;
      shop.deals.forEach((deal) => {
        if (!deal.active || !deal.expiry) return;
        if (deal.expiry < today) {
          deal.active = false;
          changed = true;
          expired++;
        }
      });
      if (changed) await shop.save();
    }

    console.log(`[dealExpiry] ✅ Expired ${expired} deal(s)`);
  } catch (err) {
    console.error("[dealExpiry] ❌", err.message);
  }
};

// ══════════════════════════════════════════════════════════════════
// JOB 2 — Rating Recalculator (every 6 hours)
// Recalculates avgRating + reviewCount for every shop
// ══════════════════════════════════════════════════════════════════
const ratingRecalculator = async () => {
  try {
    const shops = await Shop.find().select("_id reviews avgRating reviewCount");
    let updated = 0;

    for (const shop of shops) {
      const separateReviews = await Review.find({
        shop:      shop._id,
        isVisible: { $ne: false },
      });

      const embeddedReviews = (shop.reviews ?? []).filter((r) => r.isVisible !== false);
      const separateUserIds = new Set(separateReviews.map((r) => r.user.toString()));
      const uniqueEmbedded  = embeddedReviews.filter((r) => !separateUserIds.has(r.user.toString()));

      const all   = [...separateReviews, ...uniqueEmbedded];
      const count = all.length;
      const avg   = count === 0 ? 0 : all.reduce((s, r) => s + r.rating, 0) / count;
      const newAvg   = Math.round(avg * 10) / 10;
      const newCount = count;

      if (shop.avgRating !== newAvg || shop.reviewCount !== newCount) {
        await Shop.findByIdAndUpdate(shop._id, { avgRating: newAvg, reviewCount: newCount });
        updated++;
      }
    }

    console.log(`[ratingRecalculator] ✅ Updated ${updated}/${shops.length} shop(s)`);
  } catch (err) {
    console.error("[ratingRecalculator] ❌", err.message);
  }
};

// ══════════════════════════════════════════════════════════════════
// JOB 3 — Analytics Snapshot (daily at midnight)
// Saves daily stats snapshot per shop, keeps last 90 days
// ══════════════════════════════════════════════════════════════════
const analyticsSnapshot = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const shops = await Shop.find().select("_id avgRating reviewCount profileViews analytics");
    let captured = 0;

    for (const shop of shops) {
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

      if (!Array.isArray(shop.analytics)) shop.analytics = [];
      shop.analytics = shop.analytics.filter((s) => s.date !== today);
      shop.analytics.push(snapshot);
      if (shop.analytics.length > 90) shop.analytics = shop.analytics.slice(-90);
      shop.profileViews = 0;

      await shop.save();
      captured++;
    }

    console.log(`[analyticsSnapshot] ✅ Captured ${captured} shop snapshot(s)`);
  } catch (err) {
    console.error("[analyticsSnapshot] ❌", err.message);
  }
};

// ══════════════════════════════════════════════════════════════════
// JOB 4 — Weekly Digest (every Monday at 9am)
// Sends weekly performance notification to each shop owner
// ══════════════════════════════════════════════════════════════════
const weeklyDigest = async () => {
  try {
    const shops = await Shop.find({ isActive: true })
      .select("_id name owner avgRating reviewCount profileViews deals")
      .populate("owner", "_id notifPrefs");

    let sent = 0;

    for (const shop of shops) {
      if (!shop.owner) continue;
      if (shop.owner.notifPrefs?.weeklyReport === false) continue;

      const activeDeals  = (shop.deals ?? []).filter((d) => d.active).length;
      const expiredDeals = (shop.deals ?? []).filter((d) => !d.active).length;

      const body = [
        `⭐ Rating: ${Number(shop.avgRating ?? 0).toFixed(1)}/5`,
        `💬 Reviews: ${shop.reviewCount ?? 0}`,
        `👁 Views: ${shop.profileViews ?? 0}`,
        `🏷 Active Deals: ${activeDeals}`,
        expiredDeals > 0 ? `⚠️ ${expiredDeals} expired deal(s) need attention` : null,
      ].filter(Boolean).join(" · ");

      await User.findByIdAndUpdate(shop.owner._id, {
        $push: {
          notifications: {
            $each:     [{ type: "system", title: `📊 Weekly Report — ${shop.name}`, body, store: shop._id, read: false }],
            $slice:    -50,
            $position: 0,
          },
        },
      });

      sent++;
    }

    console.log(`[weeklyDigest] ✅ Sent to ${sent} owner(s)`);
  } catch (err) {
    console.error("[weeklyDigest] ❌", err.message);
  }
};

// ══════════════════════════════════════════════════════════════════
// JOB 5 — Fraud Detector (daily at 2am)
// Flags suspicious reviews and notifies admins
// ══════════════════════════════════════════════════════════════════
const fraudDetector = async () => {
  try {
    let flagged = 0;
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Rule 1: Same user, multiple reviews within 60 seconds
    const recent = await Review.find({ createdAt: { $gte: since24h }, isVisible: true })
      .sort({ user: 1, createdAt: 1 });

    const byUser = {};
    recent.forEach((r) => {
      const uid = r.user.toString();
      if (!byUser[uid]) byUser[uid] = [];
      byUser[uid].push(r);
    });

    for (const reviews of Object.values(byUser)) {
      for (let i = 1; i < reviews.length; i++) {
        if (reviews[i].createdAt - reviews[i - 1].createdAt < 60000) {
          await Review.findByIdAndUpdate(reviews[i]._id, { isVisible: false });
          flagged++;
        }
      }
    }

    // Rule 2: 5-star review from account < 1 day old
    const fiveStars = await Review.find({ rating: 5, isVisible: true, createdAt: { $gte: since24h } })
      .populate("user", "createdAt");

    for (const r of fiveStars) {
      if (!r.user?.createdAt) continue;
      if (r.createdAt - r.user.createdAt < 86400000) {
        await Review.findByIdAndUpdate(r._id, { isVisible: false });
        flagged++;
      }
    }

    // Rule 3: Duplicate review text across different shops
    const allReviews = await Review.find({ isVisible: true, text: { $ne: "" } }).select("_id text");
    const textMap = {};
    for (const r of allReviews) {
      const key = r.text?.trim().toLowerCase();
      if (!key || key.length < 20) continue;
      if (!textMap[key]) textMap[key] = [];
      textMap[key].push(r._id);
    }
    for (const ids of Object.values(textMap)) {
      if (ids.length < 2) continue;
      for (let i = 1; i < ids.length; i++) {
        await Review.findByIdAndUpdate(ids[i], { isVisible: false });
        flagged++;
      }
    }

    // Notify admins if anything flagged
    if (flagged > 0) {
      const admins = await User.find({ role: "admin" }).select("_id");
      await Promise.all(admins.map((admin) =>
        User.findByIdAndUpdate(admin._id, {
          $push: {
            notifications: {
              $each:     [{ type: "system", title: "🚨 Fraud Alert", body: `${flagged} suspicious review(s) hidden. Check moderation.`, read: false }],
              $slice:    -50,
              $position: 0,
            },
          },
        })
      ));
    }

    console.log(`[fraudDetector] ✅ Flagged ${flagged} review(s)`);
  } catch (err) {
    console.error("[fraudDetector] ❌", err.message);
  }
};

// ══════════════════════════════════════════════════════════════════
// SCHEDULER — wire all jobs with cron
// ══════════════════════════════════════════════════════════════════
export const startJobs = () => {
  cron.schedule("0 * * * *",   () => dealExpiry());          // every hour
  cron.schedule("0 */6 * * *", () => ratingRecalculator());  // every 6 hours
  cron.schedule("0 0 * * *",   () => analyticsSnapshot());   // daily midnight
  cron.schedule("0 9 * * 1",   () => weeklyDigest());        // monday 9am
  cron.schedule("0 2 * * *",   () => fraudDetector());       // daily 2am

  console.log("✅ Background jobs scheduled");
};