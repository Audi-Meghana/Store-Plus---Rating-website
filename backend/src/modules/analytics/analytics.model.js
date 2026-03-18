import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    // overall stats
    avgRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    profileViews: {
      type: Number,
      default: 0,
    },

    // rating breakdown
    ratingBreakdown: [
      {
        star: {
          type: Number,
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    // monthly trend
    ratingTrend: [
      {
        month: {
          type: String,
        },
        rating: {
          type: Number,
        },
        reviews: {
          type: Number,
        },
      },
    ],

    // weekly review volume
    reviewVolume: [
      {
        week: {
          type: String,
        },
        reviews: {
          type: Number,
        },
      },
    ],

    // growth metrics
    growthScore: {
      type: Number,
      default: 0,
    },

    ratingChange: {
      type: Number,
      default: 0,
    },

    // snapshot date
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;