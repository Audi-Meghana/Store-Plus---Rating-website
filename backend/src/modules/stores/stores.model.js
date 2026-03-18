import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  { url: { type: String, default: "" }, public_id: { type: String, default: "" } },
  { _id: false }
);

const hoursSchema = new mongoose.Schema(
  {
    open: { type: Boolean, default: false },
    from: { type: String,  default: ""    },
    to:   { type: String,  default: ""    },
  },
  { _id: false }
);

// ── Embedded review schema (replaces Review collection) ───────────────────────
const ownerReplySchema = new mongoose.Schema(
  {
    text:      { type: String, default: "" },
    repliedAt: { type: Date,   default: null },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    text:     { type: String, default: "" },
    aspects:  { type: mongoose.Schema.Types.Mixed, default: {} },
    photos:   [{ type: String }],
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ownerReply: { type: ownerReplySchema, default: null },
    replied:  { type: Boolean, default: false },
    isVisible:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type:    String,
      enum:    ["Discount %", "Flat Off ₹", "Buy 1 Get 1", "Free Item", "Combo Offer"],
      default: "Discount %",
    },
    value:       { type: String, default: "" },
    description: { type: String, default: "" },
    expiry:      { type: String, default: "" },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },

    // Basic Info
    name:        { type: String, required: true, trim: true, default: "My Shop" },
    category: {
      type: String,
      enum: ["Restaurant","Cafe","Grocery","Clothing","Electronics","Pharmacy","Bakery","Salon","Gym","Other"],
      default: "Other",
    },
    description: { type: String, default: "" },
    phone:       { type: String, default: "" },
    website:     { type: String, default: "" },
    instagram:   { type: String, default: "" },
    facebook:    { type: String, default: "" },

    // Location
    location: {
      address:  { type: String, default: "" },
      city:     { type: String, default: "" },
      state:    { type: String, default: "" },
      pincode:  { type: String, default: "" },
      landmark: { type: String, default: "" },
      lat:      { type: Number, default: null },
      lng:      { type: Number, default: null },
    },

    // Hours
    hours: {
      Monday:    { type: hoursSchema, default: () => ({}) },
      Tuesday:   { type: hoursSchema, default: () => ({}) },
      Wednesday: { type: hoursSchema, default: () => ({}) },
      Thursday:  { type: hoursSchema, default: () => ({}) },
      Friday:    { type: hoursSchema, default: () => ({}) },
      Saturday:  { type: hoursSchema, default: () => ({}) },
      Sunday:    { type: hoursSchema, default: () => ({}) },
    },

    // Images
    logo:    { type: imageSchema, default: () => ({}) },
    cover:   { type: imageSchema, default: () => ({}) },
    gallery: [{ url: { type: String }, public_id: { type: String } }],

    // ── Embedded reviews (replaces Review collection) ──────────────────────────
    reviews: {
      type:    [reviewSchema],
      default: [],
    },

    // ── Embedded deals (replaces Deal collection) ──────────────────────────────
    deals: {
      type:    [dealSchema],
      default: [],
    },

    // Stats
    avgRating:    { type: Number, default: 0 },
    reviewCount:  { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },

    // Flags
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true  },
    isOpen:     { type: Boolean, default: true  },
  },
  { timestamps: true }
);

storeSchema.index({ name: "text", "location.city": "text" });
storeSchema.index({ "location.city": 1 });
storeSchema.index({ category: 1 });
storeSchema.index({ avgRating: -1 });

export default mongoose.model("Shop", storeSchema);