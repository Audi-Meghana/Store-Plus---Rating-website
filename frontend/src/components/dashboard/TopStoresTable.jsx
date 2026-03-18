import { useState, useEffect } from "react";
import {
  Star, TrendingUp, TrendingDown, Minus,
  ChevronRight, Award, Search,
} from "lucide-react";
import axios from "axios";

const CATEGORY_COLORS = {
  Restaurant:  { bg: "#FFF7ED", color: "#EA580C" },
  Café:        { bg: "#FFFBEB", color: "#D97706" },
  Fashion:     { bg: "#FDF2F8", color: "#DB2777" },
  Grocery:     { bg: "#F0FDF4", color: "#16A34A" },
  Electronics: { bg: "#EFF6FF", color: "#2563EB" },
  Beauty:      { bg: "#F5F3FF", color: "#7C3AED" },
  Books:       { bg: "#F0FDFA", color: "#0D9488" },
};

const BADGE = { gold: "🥇", silver: "🥈", bronze: "🥉" };

const getBadge = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : null;

/* ── Sub-components ── */
const RankBadge = ({ rank, badge }) => (
  <div style={{
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: badge ? { gold: "#FEFCE8", silver: "#F9FAFB", bronze: "#FFF7ED" }[badge] : "#F3F4F6",
    border: `2px solid ${badge ? { gold: "#FDE047", silver: "#D1D5DB", bronze: "#FDBA74" }[badge] : "#E5E7EB"}`,
    fontSize: badge ? 16 : 11, fontWeight: 700, color: "#6B7280",
  }}>
    {badge ? BADGE[badge] : rank}
  </div>
);

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <div style={{ display: "flex", gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={11} style={{
          color: s <= Math.floor(rating) ? "#FBBF24" : "#E5E7EB",
          fill:  s <= Math.floor(rating) ? "#FBBF24" : "#E5E7EB",
        }} />
      ))}
    </div>
    <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{rating.toFixed(1)}</span>
  </div>
);

const TrendBadge = ({ change }) => {
  const isFlat = change === 0 || change === null;
  const up     = change > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
      background: isFlat ? "#F3F4F6" : up ? "#DCFCE7" : "#FEE2E2",
      color:      isFlat ? "#9CA3AF" : up ? "#15803D" : "#DC2626",
    }}>
      {isFlat ? <Minus size={10} /> : up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isFlat ? "0.0" : `${up ? "+" : "-"}${Math.abs(change).toFixed(1)}`}
    </span>
  );
};

const CategoryChip = ({ category }) => {
  const theme = CATEGORY_COLORS[category] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
      background: theme.bg, color: theme.color,
    }}>
      {category}
    </span>
  );
};

/* ── Main ── */
const TopStoresTable = ({ onViewAll }) => {
  const [stores,  setStores]  = useState([]);
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("rank");

  useEffect(() => {
    axios.get("/api/stores/top")
      .then(res => setStores(
        res.data.map((store, i) => ({ ...store, rank: store.rank || i + 1, badge: getBadge(i) }))
      ))
      .catch(err => console.error("Failed to load stores", err));
  }, []);

  const filtered = stores
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      (s.location || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "rating"  ? b.rating  - a.rating  :
      sortBy === "reviews" ? b.reviews - a.reviews  :
      a.rank - b.rank
    );

  return (
    <div style={{
      background: "#fff", borderRadius: 20,
      border: "1.5px solid #F1F5F9", overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .tst-table { display: none; }
        .tst-cards { display: flex; flex-direction: column; }
        @media (min-width: 768px) {
          .tst-table { display: block; }
          .tst-cards { display: none; }
        }
        .tst-row:hover { background: #FAFBFF; }
        .tst-search:focus { outline: none; border-color: #93C5FD; background: #fff; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "16px 16px 0", borderBottom: "1px solid #F8FAFC" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <Award size={15} style={{ color: "#EAB308" }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Top Stores</h2>
            </div>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Ranked by overall rating</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Sort toggle */}
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 }}>
              {["rank", "rating", "reviews"].map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit", textTransform: "capitalize",
                  background: sortBy === s ? "#fff"    : "transparent",
                  color:      sortBy === s ? "#2563EB" : "#9CA3AF",
                  boxShadow:  sortBy === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>
                  {s}
                </button>
              ))}
            </div>

            {onViewAll && (
              <button onClick={onViewAll} style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 11, fontWeight: 600, color: "#2563EB",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", padding: "5px 2px",
              }}>
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            className="tst-search"
            type="text"
            placeholder="Search by name, category or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12,
              paddingTop: 9, paddingBottom: 9,
              fontSize: 12, borderRadius: 11,
              border: "1.5px solid #E5E7EB", background: "#F8FAFC",
              fontFamily: "inherit", color: "#374151",
              boxSizing: "border-box", transition: "border-color 0.15s",
            }}
          />
        </div>
      </div>

      {/* ── MOBILE: Card list (hidden ≥768px) ── */}
      <div className="tst-cards">
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "32px 16px", fontSize: 13, color: "#9CA3AF" }}>
            No stores found
          </p>
        ) : filtered.map(store => (
          <div key={store.rank} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "13px 16px", borderBottom: "1px solid #F8FAFC",
          }}>
            <RankBadge rank={store.rank} badge={store.badge} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                  {store.name}
                </span>
                <CategoryChip category={store.category} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <StarRating rating={store.rating} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{store.reviews?.toLocaleString()} reviews</span>
                {store.location && (
                  <span style={{ fontSize: 11, color: "#CBD5E1" }}>{store.location}</span>
                )}
              </div>
            </div>

            <TrendBadge change={store.change} />
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Table (hidden <768px) ── */}
      <div className="tst-table" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              {["Rank", "Store", "Category", "Location", "Rating", "Reviews", "Trend"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: 10, fontWeight: 700, color: "#9CA3AF",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(store => (
              <tr key={store.rank} className="tst-row" style={{ borderBottom: "1px solid #F8FAFC", transition: "background 0.15s" }}>
                <td style={{ padding: "12px 16px" }}>
                  <RankBadge rank={store.rank} badge={store.badge} />
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                  {store.name}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <CategoryChip category={store.category} />
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                  {store.location}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StarRating rating={store.rating} />
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#374151" }}>
                  {store.reviews?.toLocaleString()}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <TrendBadge change={store.change} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "11px 16px", borderTop: "1px solid #F8FAFC",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 6,
      }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
          Showing <strong style={{ color: "#374151" }}>{filtered.length}</strong> of {stores.length} stores
        </span>
        <span style={{ fontSize: 11, color: "#CBD5E1" }}>Updated just now</span>
      </div>
    </div>
  );
};

export default TopStoresTable;