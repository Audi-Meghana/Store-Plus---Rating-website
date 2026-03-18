import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const CATEGORIES = ["All","Restaurant","Cafe","Bakery","Grocery","Clothing","Electronics","Pharmacy","Salon","Gym","Other"];
const SORT_OPTIONS = [
  { label: "Best Rating",   value: "rating"   },
  { label: "Most Reviews",  value: "reviews"  },
  { label: "Newest",        value: "newest"   },
  { label: "Name A–Z",      value: "name_asc" },
];
const CAT_COLORS = {
  Restaurant:"#FF6B35", Cafe:"#D97706", Bakery:"#A21CAF", Grocery:"#16A34A",
  Clothing:"#DB2777", Electronics:"#2563EB", Pharmacy:"#DC2626",
  Salon:"#7C3AED", Gym:"#0891B2", All:"#4F46E5", Other:"#6B7280",
};

/* ── StoreFilters ── */
const StoreFilters = ({ onFilter, initialValues = {} }) => {
  const [search,      setSearch]      = useState(initialValues.search   || "");
  const [city,        setCity]        = useState(initialValues.city     || "");
  const [category,    setCategory]    = useState(initialValues.category || "All");
  const [sort,        setSort]        = useState(initialValues.sort     || "rating");
  const [minRating,   setMinRating]   = useState(initialValues.minRating || 0);
  const [openOnly,    setOpenOnly]    = useState(initialValues.openOnly  || false);
  const [showPanel,   setShowPanel]   = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);

  const activeFilters = [openOnly, minRating > 0].filter(Boolean).length;

  const emit = (overrides = {}) => {
    onFilter?.({ search, city, category, sort, minRating, openOnly, ...overrides });
  };

  const handleSearch = (val) => { setSearch(val); emit({ search: val }); };
  const handleCity   = (val) => { setCity(val);   emit({ city: val });   };
  const handleCat    = (val) => { setCategory(val); emit({ category: val }); };
  const handleSort   = (val) => { setSort(val); setSortOpen(false); emit({ sort: val }); };
  const handleRating = (val) => { const v = minRating === val ? 0 : val; setMinRating(v); emit({ minRating: v }); };
  const handleOpen   = ()    => { const v = !openOnly; setOpenOnly(v); emit({ openOnly: v }); };
  const clearAll     = ()    => { setMinRating(0); setOpenOnly(false); emit({ minRating: 0, openOnly: false }); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .sf-input:focus { outline: none; border-color: #93C5FD !important; background: #fff !important; }
        .sf-input::placeholder { color: #A5B4FC; }
      `}</style>

      {/* ── Search bar ── */}
      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1.5px solid #E0E7FF",
        boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
        display: "flex", flexWrap: "wrap", overflow: "hidden",
        marginBottom: 14,
      }}>
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 180, padding: "0 12px", borderRight: "1px solid #EEF2FF" }}>
          <Search size={15} style={{ color: "#A5B4FC", flexShrink: 0 }} />
          <input
            className="sf-input"
            type="text"
            placeholder="Store name or keyword…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ flex: 1, border: "none", padding: "13px 8px", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "#0F172A" }}
          />
          {search && <button onClick={() => handleSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2 }}><X size={13} /></button>}
        </div>

        {/* City input */}
        <div style={{ display: "flex", alignItems: "center", width: 140, padding: "0 12px", borderRight: "1px solid #EEF2FF" }}>
          <MapPin size={13} style={{ color: "#A5B4FC", flexShrink: 0 }} />
          <input
            className="sf-input"
            type="text"
            placeholder="City"
            value={city}
            onChange={e => handleCity(e.target.value)}
            style={{ flex: 1, border: "none", padding: "13px 8px", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "#0F172A", width: "100%" }}
          />
        </div>

        {/* Sort dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSortOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "13px 14px", background: "none", border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: "#374151", fontFamily: "inherit", whiteSpace: "nowrap",
              borderRight: "1px solid #EEF2FF",
            }}
          >
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
            <ChevronDown size={12} style={{ transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {sortOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0,
              background: "#fff", border: "1.5px solid #F1F5F9",
              borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              zIndex: 30, minWidth: 150, overflow: "hidden",
            }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleSort(opt.value)} style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                  fontFamily: "inherit",
                  background: sort === opt.value ? "#EFF6FF" : "#fff",
                  color:      sort === opt.value ? "#2563EB" : "#374151",
                  transition: "background 0.15s",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowPanel(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "13px 16px", background: showPanel ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "none",
            border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            color: showPanel ? "#fff" : "#374151", fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilters > 0 && (
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* ── Category pills ── */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14, scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => {
          const col = CAT_COLORS[c] || "#4F46E5";
          const active = category === c;
          return (
            <button key={c} onClick={() => handleCat(c)} style={{
              padding: "7px 16px", borderRadius: 100, border: `1.5px solid ${active ? "transparent" : "#E5E7EB"}`,
              fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              fontFamily: "inherit", transition: "all 0.2s",
              background: active ? `linear-gradient(135deg,${col},${col}cc)` : "#fff",
              color:      active ? "#fff" : "#6B7280",
              boxShadow:  active ? `0 4px 12px ${col}44` : "none",
            }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* ── Filter panel ── */}
      {showPanel && (
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1.5px solid #F1F5F9", padding: "18px 18px 20px",
          marginBottom: 14, boxShadow: "0 6px 24px rgba(99,102,241,0.07)",
          animation: "sfSlide 0.2s ease",
        }}>
          <style>{`@keyframes sfSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Filters</span>
            {activeFilters > 0 && (
              <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {/* Open only */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", marginBottom: 10 }}>Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={handleOpen}>
                <div style={{ width: 40, height: 22, borderRadius: 100, background: openOnly ? "#4F46E5" : "#E5E7EB", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: openOnly ? "calc(100% - 19px)" : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Open Now</span>
              </div>
            </div>

            {/* Min rating */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", marginBottom: 10 }}>Min Rating</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[0, 3, 3.5, 4, 4.5].map(r => (
                  <button key={r} onClick={() => handleRating(r)} style={{
                    padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${minRating === r ? "#4F46E5" : "#E5E7EB"}`,
                    background: minRating === r ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "#fff",
                    color: minRating === r ? "#fff" : "#6B7280",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    {r === 0 ? "Any" : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active chips ── */}
      {activeFilters > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {openOnly && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669" }}>
              Open Now <X size={10} style={{ cursor: "pointer" }} onClick={() => { setOpenOnly(false); emit({ openOnly: false }); }} />
            </span>
          )}
          {minRating > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#D97706" }}>
              {minRating}+ ★ <X size={10} style={{ cursor: "pointer" }} onClick={() => { setMinRating(0); emit({ minRating: 0 }); }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreFilters;