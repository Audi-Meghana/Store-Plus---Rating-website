import mongoose from "mongoose";

const storePhotoSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    // e.g. "/uploads/shops/123/logo-abc.jpg" or any HTTP URL
    url:       { type: String, required: true },
    // No Cloudinary public_id now
    type:      { type: String, enum: ["logo", "cover", "gallery"], required: true },
    uploadedBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

storePhotoSchema.index({ shop: 1, type: 1 });

const StorePhoto = mongoose.model("StorePhoto", storePhotoSchema);
export default StorePhoto;
