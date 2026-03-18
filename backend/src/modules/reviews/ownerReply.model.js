import mongoose from "mongoose";

const ownerReplySchema = new mongoose.Schema(
  {
    review: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Review",
      required: true,
      unique:   true, // one reply per review
      index:    true,
    },
    shop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Shop",
      required: true,
      index:    true,
    },
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    text: {
      type:      String,
      required:  true,
      trim:      true,
      minlength: 5,
      maxlength: 1000,
    },
    isEdited: {
      type:    Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const OwnerReply = mongoose.model("OwnerReply", ownerReplySchema);
export default OwnerReply;