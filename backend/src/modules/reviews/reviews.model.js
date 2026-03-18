import mongoose from "mongoose";

const ownerReplySchema = new mongoose.Schema(
  {
    text:      { type: String, default: "" },
    repliedAt: { type: Date,   default: null },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    shop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Shop",
      required: true,
      index:    true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    // "text" — matches what reviews.service.js writes
    text: {
      type:    String,
      trim:    true,
      default: "",
    },
    aspects: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },
    photos: [{ type: String }],

    helpfulVotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    // embedded — matches service: review.ownerReply = { text, repliedAt }
    ownerReply: {
      type:    ownerReplySchema,
      default: null,
    },
    replied: {
      type:    Boolean,
      default: false,
      index:   true,
    },
    isVisible: {
      type:    Boolean,
      default: true,
      index:   true,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per user per shop
reviewSchema.index({ shop: 1, user: 1 }, { unique: true });

// Handy virtual so frontend can read review.helpfulCount
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpfulVotes?.length ?? 0;
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;