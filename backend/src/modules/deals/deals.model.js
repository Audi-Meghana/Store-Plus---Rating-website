import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    // Which shop owns this deal
    shop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Shop",
      required: true,
    },

    // ── Fields that match DealsManagerPage.jsx exactly ────────
    title:       { type: String, required: true, trim: true },
    type: {
      type:    String,
      enum:    ["Discount %", "Flat Off ₹", "Buy 1 Get 1", "Free Item", "Combo Offer"],
      default: "Discount %",
    },
    value:       { type: String, default: "" },        // "20" / "100" / "Free coffee"
    description: { type: String, default: "" },
    expiry:      { type: String, default: "" },        // ISO date string "2025-04-30" or ""
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

dealSchema.index({ shop: 1 });
dealSchema.index({ active: 1 });

export default mongoose.model("Deal", dealSchema);