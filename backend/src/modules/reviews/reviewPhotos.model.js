import mongoose from "mongoose";

const reviewPhotoSchema = new mongoose.Schema(
  {
    review: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Review",
      required: true,
      index:    true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    shop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Shop",
      required: true,
    },
    // path relative to server root, e.g. "uploads/reviews/filename.jpg"
    path: {
      type:     String,
      required: true,
    },
    filename: {
      type:     String,
      required: true,
    },
    mimetype: {
      type: String,
      enum: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    },
    size: {
      type: Number, // bytes
    },
  },
  {
    timestamps: true,
  }
);

// Max 5 photos per review — enforced in service layer
reviewPhotoSchema.statics.MAX_PER_REVIEW = 5;

const ReviewPhoto = mongoose.model("ReviewPhoto", reviewPhotoSchema);
export default ReviewPhoto;