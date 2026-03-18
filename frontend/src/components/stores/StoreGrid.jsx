import { useState, useEffect, useCallback } from "react";
import { Grid3X3, List, Loader2, Store } from "lucide-react";
import api from "../../services/api";
import StoreCard from "./StoreCard";
import StoreFilters from "./StoreFilters";

/* ── StoreGrid ── */
const StoreGrid = ({ initialCategory = "", onStoreClick }) => {
  const [shops,    setShops]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters,  setFilters]  = useState({
    search: "", city: "", category: initialCategory || "All",
    sort: "rating", minRating: 0, openOnly: false,
  });

  const LIMIT = 12;

  const fetchShops = useCallback(async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search && f.search !== "")        params.set("search",      f.search);
      if (f.city   && f.city   !== "")        params.set("city",        f.city);
      if (f.category && f.category !== "All") params.set("category",    f.category);
      if (f.openOnly)                         params.set("openOnly",    "true");
      if (f.minRating > 0)                    params.set("minRating",   f.minRating);
      params.set("sort",  f.sort);
      params.set("page",  p);
      params.set("limit", LIMIT);

      const res  = await api.get(`/shops?${params}`);
      const data = res?.data?.data ?? res?.data ?? [];
      setShops(data);
      setTotal(res?.data?.total ?? data.length);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(filters, page); }, [page]);

  const handleFilter = (f) => {
    setFilters(f);
    setPage(1);
    fetchShops(f, 1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .sg-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .sg-list  { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 640px)  { .sg-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
        @media (min-width: 900px)  { .sg-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
        @media (min-width: 1200px) { .sg-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 400px)  { .sg-grid { grid-template-columns: 1fr; } }
        @keyframes sgFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .sg-item { animation: sgFadeUp 0.35s ease both; }
      `}</style>

      {/* Filters */}
      <StoreFilters onFilter={handleFilter} initialValues={filters} />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
          {loading ? "Loading…" : <><strong style={{ color: "#374151" }}>{total}</strong> stores found</>}
        </span>
        {/* View toggle */}
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 }}>
          {[["grid", Grid3X3], ["list", List]].map(([m, Icon]) => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: viewMode === m ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "transparent",
              transition: "all 0.2s",
            }}>
              <Icon size={14} style={{ color: viewMode === m ? "#fff" : "#9CA3AF" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={28} style={{ color: "#4F46E5", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : shops.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", background: "#fff", borderRadius: 18, border: "1.5px solid #F1F5F9" }}>
          <Store size={36} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No stores found</p>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "sg-grid" : "sg-list"}>
          {shops.map((shop, i) => (
            <div key={shop._id} className="sg-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <StoreCard shop={shop} mode={viewMode} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#D1D5DB" : "#374151", fontFamily: "inherit" }}
          >
            ← Prev
          </button>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)} style={{
                width: 34, height: 34, borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                background: page === pg ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "#F3F4F6",
                color:      page === pg ? "#fff" : "#6B7280",
                transition: "all 0.2s",
              }}>
                {pg}
              </button>
            ))}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", fontSize: 12, fontWeight: 600, cursor: page >= totalPages ? "not-allowed" : "pointer", color: page >= totalPages ? "#D1D5DB" : "#374151", fontFamily: "inherit" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreGrid;