import Category from "./categories.model.js";
import Shop     from "../stores/stores.model.js";

// ── sync shopCount for all categories ────────────────────────
const syncShopCounts = async () => {
  const counts = await Shop.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const map = {};
  counts.forEach((c) => { map[c._id] = c.count; });

  const categories = await Category.find();
  await Promise.all(
    categories.map((cat) =>
      Category.findByIdAndUpdate(cat._id, { shopCount: map[cat.name] ?? 0 })
    )
  );
};

// ── Get all categories ────────────────────────────────────────
export const getCategories = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  await syncShopCounts();
  return Category.find(filter).sort({ name: 1 });
};

// ── Get single category ───────────────────────────────────────
export const getCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw { status: 404, message: "Category not found" };
  return cat;
};

// ── Create category ───────────────────────────────────────────
export const createCategory = async (data) => {
  if (!data.name) throw { status: 422, message: "Name is required" };

  const exists = await Category.findOne({ name: { $regex: `^${data.name}$`, $options: "i" } });
  if (exists) throw { status: 409, message: "Category already exists" };

  const cat = await Category.create({
    name:        data.name.trim(),
    description: data.description ?? "",
    icon:        data.icon        ?? "🏪",
    color:       data.color       ?? "#6366F1",
    isActive:    data.isActive    ?? true,
  });
  return cat;
};

// ── Update category ───────────────────────────────────────────
export const updateCategory = async (id, data) => {
  const cat = await Category.findById(id);
  if (!cat) throw { status: 404, message: "Category not found" };

  // Check name uniqueness if changing name
  if (data.name && data.name !== cat.name) {
    const exists = await Category.findOne({
      name: { $regex: `^${data.name}$`, $options: "i" },
      _id:  { $ne: id },
    });
    if (exists) throw { status: 409, message: "Category name already taken" };
  }

  const allowed = ["name", "description", "icon", "color", "isActive"];
  allowed.forEach((k) => { if (data[k] !== undefined) cat[k] = data[k]; });
  await cat.save();
  return cat;
};

// ── Delete category ───────────────────────────────────────────
export const deleteCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw { status: 404, message: "Category not found" };

  // Check if any shops use this category
  const shopCount = await Shop.countDocuments({ category: cat.name });
  if (shopCount > 0) {
    throw { status: 400, message: `Cannot delete — ${shopCount} shop(s) use this category. Reassign them first.` };
  }

  await Category.findByIdAndDelete(id);
};

// ── Seed default categories (run once) ───────────────────────
export const seedCategories = async () => {
  const defaults = [
    { name: "Restaurant",   icon: "🍽️", color: "#EF4444" },
    { name: "Cafe",         icon: "☕",  color: "#92400E" },
    { name: "Grocery",      icon: "🛒",  color: "#16A34A" },
    { name: "Clothing",     icon: "👗",  color: "#7C3AED" },
    { name: "Electronics",  icon: "💻",  color: "#2563EB" },
    { name: "Pharmacy",     icon: "💊",  color: "#DC2626" },
    { name: "Salon",        icon: "✂️",  color: "#DB2777" },
    { name: "Gym",          icon: "💪",  color: "#D97706" },
    { name: "Bookstore",    icon: "📚",  color: "#0891B2" },
    { name: "Hardware",     icon: "🔧",  color: "#64748B" },
    { name: "Other",        icon: "🏪",  color: "#6366F1" },
  ];

  for (const d of defaults) {
    const exists = await Category.findOne({ name: d.name });
    if (!exists) await Category.create(d);
  }

  return Category.find().sort({ name: 1 });
};