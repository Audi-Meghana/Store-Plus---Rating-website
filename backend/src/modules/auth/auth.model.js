import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["review_reply", "deal", "helpful_vote", "system"],
      required: true,
    },
    title:  { type: String, required: true },
    body:   { type: String, default: "" },
    store:  { type: mongoose.Schema.Types.ObjectId, ref: "Shop"   },
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
    read:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },
    phone:  { type: String, default: "" },
    avatar: { type: String, default: "" },
    city:   { type: String, default: "" },
    role: {
      type:    String,
      enum:    ["user", "shop_owner", "admin"],
      default: "user",
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],

    notifPrefs: {
      newReview:     { type: Boolean, default: true  },
      replyReceived: { type: Boolean, default: true  },
      dealExpiry:    { type: Boolean, default: true  },
      weeklyReport:  { type: Boolean, default: false },
      tipAlerts:     { type: Boolean, default: true  },
      marketing:     { type: Boolean, default: false },
    },

    // ── Embedded notifications (replaces Notification collection) ──
    notifications: {
      type:    [notificationSchema],
      default: [],
    },

    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model("User", userSchema);