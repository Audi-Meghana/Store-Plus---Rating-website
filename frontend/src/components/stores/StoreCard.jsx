import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Heart, CheckCircle, ArrowRight } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const FALLBACK = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";

const getImage = (shop) =>
  getImageUrl(shop?.cover?.url) ||
  getImageUrl(shop?.logo?.url) ||
  getImageUrl(shop?.gallery?.[0]?.url) ||
  FALLBACK;

const CAT_THEMES = {
  Restaurant:  { bg: "#FFF7ED", color: "#EA580C" },
  Cafe:        { bg: "#FFFBEB", color: "#D97706" },
  Bakery:      { bg: "#FDF4FF", color: "#A21CAF" },
  Grocery:     { bg: "#F0FDF4", color: "#16A34A" },
  Clothing:    { bg: "#FDF2F8", color: "#DB2777" },
  Electronics: { bg: "#EFF6FF", color: "#2563EB" },
  Pharmacy:    { bg: "#FEF2F2", color: "#DC2626" },
  Salon:       { bg: "#F5F3FF", color: "#7C3AED" },
  Gym:         { bg: "#ECFEFF", color: "#0891B2" },
  Other:       { bg: "#F3F4F6", color: "#6B7280" },
};

const CAT_EMOJI = {
  Restaurant:"🍽️", Cafe:"☕", Bakery:"🥐", Grocery:"🛒",
  Clothing:"👗", Electronics:"📱", Pharmacy:"💊", Salon:"✂️", Gym:"💪", Other:"🏪",
};

/* ── StoreCard ── */
const StoreCard = ({ shop, mode = "grid", onWishlistToggle }) => {
  const navigate    = useNavigate();
  const [wished, setWished] = useState(shop?.isWishlisted ?? false);
  const [wishLoading, setWishLoading] = useState(false);

  const catTheme  = CAT_THEMES[shop?.category] || CAT_THEMES.Other;
  const catEmoji  = CAT_EMOJI[shop?.category]  || "🏪";
  const avgRating = shop?.avgRating ?? 0;
  const city      = shop?.location?.city || shop?.location?.address || "";

  const handleWish = async (e) => {
    e.stopPropagation();
    if (wishLoading) return;
    setWishLoading(true);
    setWished(w => !w);
    onWishlistToggle?.(shop._id);
    setWishLoading(false);
  };

  const goToStore = () => navigate(`/store/${shop._id}`);

  /* ── LIST mode ── */
  if (mode === "list") {
    return (
      <div
        onClick={goToStore}
        style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "#fff", borderRadius: 16,
          border: "1.5px solid #F1F5F9", overflow: "hidden",
          cursor: "pointer", transition: "all 0.22s",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#F1F5F9"; }}
      >
        <div style={{ width: 100, minWidth: 100, height: 80, overflow: "hidden", flexShrink: 0, position: "relative" }}>
          <img src={getImage(shop)} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.src = FALLBACK; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15))" }} />
        </div>
        <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{shop.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: catTheme.bg, color: catTheme.color }}>{shop.category}</span>
            {shop.isVerified && <CheckCircle size={12} style={{ color: "#16A34A", flexShrink: 0 }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={10} style={{ color: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB", fill: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB" }} />)}
              <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginLeft: 3 }}>{avgRating.toFixed(1)}</span>
            </div>
            <span style={{ fontSize: 11, color: "#CBD5E1" }}>{shop.reviewCount ?? 0} reviews</span>
            {city && <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: "#9CA3AF" }}><MapPin size={10} />{city}</span>}
          </div>
        </div>
        <div style={{ padding: "0 14px", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={handleWish} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: wished ? "#EF4444" : "#D1D5DB" }}>
            <Heart size={15} style={{ fill: wished ? "#EF4444" : "none" }} />
          </button>
          <ArrowRight size={14} style={{ color: "#CBD5E1" }} />
        </div>
      </div>
    );
  }

  /* ── GRID mode (default) ── */
  return (
    <div
      onClick={goToStore}
      style={{
        background: "#fff", borderRadius: 18,
        border: "1.5px solid #F1F5F9", overflow: "hidden",
        cursor: "pointer", transition: "all 0.28s",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 44px rgba(0,0,0,0.10)"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#F1F5F9"; }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 172, overflow: "hidden" }}>
        <img
          src={getImage(shop)} alt={shop.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }}
          onError={e => { e.target.src = FALLBACK; }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.06)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)" }} />

        {/* Top left: open/closed */}
        <span style={{
          position: "absolute", top: 10, left: 10,
          fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
          background: shop.isOpen ? "rgba(5,150,105,0.88)" : "rgba(220,38,38,0.88)",
          color: "#fff", backdropFilter: "blur(4px)",
        }}>
          {shop.isOpen ? "● Open" : "● Closed"}
        </span>

        {/* Top right: rating */}
        <span style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 3,
          fontSize: 11, fontWeight: 700, color: "#92400E",
          background: "rgba(255,255,255,0.92)", borderRadius: 100,
          padding: "3px 8px", backdropFilter: "blur(4px)",
        }}>
          <Star size={10} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
          {avgRating > 0 ? avgRating.toFixed(1) : "New"}
        </span>

        {/* Wishlist btn */}
        <button
          onClick={handleWish}
          style={{
            position: "absolute", bottom: 10, right: 10,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <Heart size={13} style={{ color: wished ? "#EF4444" : "#9CA3AF", fill: wished ? "#EF4444" : "none" }} />
        </button>

        {/* Category */}
        <span style={{
          position: "absolute", bottom: 10, left: 10,
          fontSize: 10, fontWeight: 700,
          background: "rgba(255,255,255,0.90)", borderRadius: 7,
          padding: "2px 8px", color: "#374151", backdropFilter: "blur(4px)",
        }}>
          {catEmoji} {shop.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "13px 14px 15px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shop.name}</span>
          {shop.isVerified && <CheckCircle size={13} style={{ color: "#16A34A", flexShrink: 0 }} />}
        </div>

        {city && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#9CA3AF" }}>
            <MapPin size={11} />{city}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={12} style={{ color: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB", fill: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB" }} />)}
          </div>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{shop.reviewCount ?? 0} reviews</span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
export { getImageUrl, getImage, FALLBACK, CAT_THEMES, CAT_EMOJI };