import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Category name is required"],
      trim:     true,
      unique:   true,
    },
    slug: {
      type:   String,
      unique: true,
      lowercase: true,
    },
    description: {
      type:    String,
      default: "",
    },
    icon: {
      type:    String,
      default: "🏪",
    },
    color: {
      type:    String,
      default: "#6366F1",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    shopCount: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  next();
});

export default mongoose.model("Category", categorySchema);