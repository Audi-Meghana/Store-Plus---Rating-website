import Shop from "../stores/stores.model.js";

const getShop = async (ownerId) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) throw { status: 404, message: "No shop found. Create your shop first." };
  return shop;
};

// ── Owner: get their deals ────────────────────────────────────────────────────
export const getOwnerDeals = async (ownerId) => {
  const shop = await getShop(ownerId);
  return shop.deals.sort((a, b) => b.createdAt - a.createdAt);
};

// ── Owner: create a deal ──────────────────────────────────────────────────────
export const createDeal = async (ownerId, data) => {
  const { title, type, value, description, expiry, active } = data;
  if (!title?.trim()) throw { status: 422, message: "Title is required" };
  if (!value?.trim()) throw { status: 422, message: "Value is required" };

  const shop = await Shop.findOneAndUpdate(
    { owner: ownerId },
    { $push: { deals: { title, type, value, description, expiry, active: active ?? true } } },
    { new: true }
  );
  // return the newly added deal (last pushed)
  return shop.deals[shop.deals.length - 1];
};

// ── Owner: update a deal ──────────────────────────────────────────────────────
export const updateDeal = async (ownerId, dealId, data) => {
  const allowed = ["title", "type", "value", "description", "expiry", "active"];
  const update  = {};
  allowed.forEach((k) => {
    if (data[k] !== undefined) update[`deals.$.${k}`] = data[k];
  });

  const shop = await Shop.findOneAndUpdate(
    { owner: ownerId, "deals._id": dealId },
    { $set: update },
    { new: true }
  );
  if (!shop) throw { status: 404, message: "Deal not found" };
  return shop.deals.id(dealId);
};

// ── Owner: delete a deal ──────────────────────────────────────────────────────
export const deleteDeal = async (ownerId, dealId) => {
  const shop = await Shop.findOne({ owner: ownerId });
  if (!shop) throw { status: 404, message: "Shop not found" };
  const deal = shop.deals.id(dealId);
  if (!deal) throw { status: 404, message: "Deal not found" };
  await Shop.updateOne(
    { owner: ownerId },
    { $pull: { deals: { _id: dealId } } }
  );
};

// ── Public: active deals for one shop ────────────────────────────────────────
export const getPublicDealsForShop = async (shopId) => {
  const shop = await Shop.findById(shopId).select("deals");
  if (!shop) return [];
  const now = new Date().toISOString().split("T")[0];
  return shop.deals.filter(
    (d) => d.active && (!d.expiry || d.expiry >= now)
  );
};

// ── Public: all active deals across shops ────────────────────────────────────
export const getAllActiveDeals = async ({ category, city, page = 1, limit = 12 } = {}) => {
  const now = new Date().toISOString().split("T")[0];

  const shopQuery = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };
  if (category && category !== "All") shopQuery.category = category;
  if (city) shopQuery["location.city"] = new RegExp(city, "i");

  const shops = await Shop.find(shopQuery).select("name category location logo avgRating isOpen deals");

  // flatten deals from all shops, filter active + not expired
  const allDeals = [];
  shops.forEach((shop) => {
    shop.deals
      .filter((d) => d.active && (!d.expiry || d.expiry >= now))
      .forEach((d) => {
        allDeals.push({
          ...d.toObject(),
          shop: {
            _id:       shop._id,
            name:      shop.name,
            category:  shop.category,
            location:  shop.location,
            logo:      shop.logo,
            avgRating: shop.avgRating,
            isOpen:    shop.isOpen,
          },
        });
      });
  });

  // sort by createdAt desc, paginate
  allDeals.sort((a, b) => b.createdAt - a.createdAt);
  const skip = (Number(page) - 1) * Number(limit);
  return allDeals.slice(skip, skip + Number(limit));
};