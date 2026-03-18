/**
 * dealExpiry.js
 * Runs every hour — marks deals as inactive when their expiry date has passed.
 */

import Shop from "../modules/stores/stores.model.js";

const dealExpiry = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Find all shops that have at least one active deal
    const shops = await Shop.find({ "deals.active": true });

    let expiredCount = 0;

    for (const shop of shops) {
      let changed = false;

      shop.deals.forEach((deal) => {
        if (!deal.active) return;
        if (!deal.expiry)  return;

        // expiry stored as "YYYY-MM-DD" string
        if (deal.expiry < today) {
          deal.active = false;
          changed     = true;
          expiredCount++;
        }
      });

      if (changed) await shop.save();
    }

    console.log(`[dealExpiry] ✅ Expired ${expiredCount} deal(s)`);
  } catch (err) {
    console.error("[dealExpiry] ❌ Error:", err.message);
  }
};

export default dealExpiry;