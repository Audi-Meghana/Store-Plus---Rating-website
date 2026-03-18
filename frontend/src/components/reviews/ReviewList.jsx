import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star, Filter, ChevronDown, ChevronUp, MessageSquare,
  Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import ReviewCard from "./ReviewCard";
import api from "../../services/api";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest First"  },
  { value: "oldest",  label: "Oldest First"  },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest",  label: "Lowest Rated"  },
  { value: "helpful", label: "Most Helpful"  },
];

const RATING_FILTERS = [0, 5, 4, 3, 2, 1];
const LIMIT          = 50;
const INITIAL_SHOW   = 5;
const LOAD_MORE_STEP = 5;

// ── Sort reviews client-side so changes are instant ──────────────────────────
const sortReviews = (list, sortKey) => {
  const arr = [...list];
  switch (sortKey) {
    case "highest": return arr.sort((a, b) => b.rating - a.rating);
    case "lowest":  return arr.sort((a, b) => a.rating - b.rating);
    case "oldest":  return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "helpful": return arr.sort((a, b) => (b.helpfulVotes?.length ?? 0) - (a.helpfulVotes?.length ?? 0));
    default:        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest
  }
};

// ── ReviewList ────────────────────────────────────────────────────────────────
// Props:
//   shopId       — required
//   avgRating    — passed from parent
//   reviewCount  — passed from parent
//   refreshKey   — increment this from the parent after a review is submitted
//                  to trigger an automatic refetch
const ReviewList = ({ shopId, avgRating = 0, reviewCount = 0, refreshKey = 0 }) => {
  const [allReviews,   setAllReviews]   = useState([]);   // raw from API
  const [reviews,      setReviews]      = useState([]);   // sorted + filtered
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [sort,         setSort]         = useState("newest");
  const [rFilter,      setRFilter]      = useState(0);
  const [total,        setTotal]        = useState(0);
  const [showSort,     setShowSort]     = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);
  const sortRef = useRef(sort);
  sortRef.current = sort;

  // ── Fetch (reruns when shopId, page, or refreshKey changes) ────────────────
  const fetchReviews = useCallback(async (silent = false) => {
    if (!shopId) return;
    try {
      if (!silent) setLoading(true);
      setError("");
      const params = new URLSearchParams({ sort: "newest", limit: LIMIT, page: 1 });
      const res    = await api.get(`/shops/${shopId}/reviews?${params}`);
      const root   = res?.data ?? res;
      const data   = root?.data ?? root;
      const raw    = Array.isArray(data?.reviews) ? data.reviews
                   : Array.isArray(data)          ? data
                   : [];
      setAllReviews(raw);
      setTotal(data?.total ?? raw.length);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // Initial load + refetch when parent increments refreshKey
  useEffect(() => {
    fetchReviews();
    setVisibleCount(INITIAL_SHOW); // scroll back to top on refresh
  }, [fetchReviews, refreshKey]);

  // ── Re-sort + re-filter client-side whenever sort / filter / allReviews changes
  useEffect(() => {
    let filtered = rFilter > 0
      ? allReviews.filter((r) => r.rating === rFilter)
      : allReviews;
    setReviews(sortReviews(filtered, sort));
    // don't reset visibleCount on sort — keep the user's position
  }, [allReviews, sort, rFilter]);

  // Reset visible count only when filter changes (new result set)
  useEffect(() => {
    setVisibleCount(INITIAL_SHOW);
  }, [rFilter]);

  // ── Rating breakdown (from full unfiltered list) ───────────────────────────
  const breakdown = [5, 4, 3, 2, 1].reduce((acc, n) => {
    acc[n] = allReviews.filter((r) => r.rating === n).length;
    return acc;
  }, {});
  const totalVotes = allReviews.length || 1;

  // ── Visible slice ──────────────────────────────────────────────────────────
  const visible     = reviews.slice(0, visibleCount);
  const hasMore     = visibleCount < reviews.length;
  const displayCount = reviews.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Rating Summary ── */}
      {(total > 0 || allReviews.length > 0) && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F1F5F9", padding: "18px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Big number */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
                  {Number(avgRating).toFixed(1)}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 2, margin: "6px 0 4px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15}
                      style={{
                        color: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB",
                        fill:  s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB",
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
                  {total || allReviews.length} review{(total || allReviews.length) !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Bars */}
              <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 6 }}>
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = breakdown[n] || 0;
                  const pct   = Math.round((count / totalVotes) * 100);
                  const active = rFilter === n;
                  return (
                    <button key={n} onClick={() => setRFilter(active ? 0 : n)}
                      style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%" }}>
                      <span style={{ fontSize: 11, color: "#6B7280", width: 10, textAlign: "right", flexShrink: 0 }}>{n}</span>
                      <Star size={10} style={{ color: "#FBBF24", fill: "#FBBF24", flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 7, background: "#F1F5F9", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 100,
                          background: active ? "#F59E0B" : "#FCD34D",
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF", width: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters + Sort row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {/* Rating filter chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Filter size={13} style={{ color: "#9CA3AF" }} />
          {RATING_FILTERS.map((r) => (
            <button key={r} onClick={() => setRFilter(r === rFilter ? 0 : r)}
              style={{
                fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 8,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: rFilter === r ? "#2563EB" : "#F1F5F9",
                color:      rFilter === r ? "#fff"     : "#6B7280",
              }}>
              {r === 0 ? "All" : `${r} ★`}
            </button>
          ))}
        </div>

        {/* Sort dropdown + manual refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => fetchReviews(true)}
            title="Refresh reviews"
            style={{ background: "none", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", color: "#6B7280", transition: "all 0.15s" }}
          >
            <RefreshCw size={13} />
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSort((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#374151", background: "#fff", border: "1.5px solid #E5E7EB", padding: "6px 12px", borderRadius: 10, cursor: "pointer" }}>
              {SORT_OPTIONS.find((s) => s.value === sort)?.label}
              <ChevronDown size={12} style={{ transform: showSort ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {showSort && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "1.5px solid #F1F5F9", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 20, minWidth: 160, overflow: "hidden" }}>
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value}
                    onClick={() => { setSort(opt.value); setShowSort(false); }}
                    style={{
                      width: "100%", textAlign: "left", fontSize: 12, fontWeight: 600,
                      padding: "10px 14px", border: "none", cursor: "pointer", transition: "background 0.15s",
                      background: sort === opt.value ? "#EFF6FF" : "#fff",
                      color:      sort === opt.value ? "#2563EB"  : "#374151",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Review list ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Loader2 size={28} style={{ color: "#3B82F6", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : error ? (
        <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, color: "#DC2626", fontSize: 13 }}>
          <AlertCircle size={15} /> {error}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px solid #F1F5F9", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
          <MessageSquare size={32} style={{ color: "#E5E7EB", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>
            {rFilter > 0 ? `No ${rFilter}-star reviews yet` : "No reviews yet"}
          </p>
          <p style={{ fontSize: 12, color: "#CBD5E1", marginTop: 4 }}>Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {/* Result count */}
          <p style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
            Showing <strong style={{ color: "#374151" }}>{Math.min(visibleCount, displayCount)}</strong> of{" "}
            <strong style={{ color: "#374151" }}>{displayCount}</strong> review{displayCount !== 1 ? "s" : ""}
            {rFilter > 0 && <span> · filtered by {rFilter}★</span>}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map((rev) => (
              <ReviewCard
                key={rev._id ?? rev.id}
                review={rev}
                shopId={shopId}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>

          {/* Load more / Show less */}
          {displayCount > INITIAL_SHOW && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
              {hasMore ? (
                <button
                  onClick={() => setVisibleCount((v) => v + LOAD_MORE_STEP)}
                  style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#2563EB", background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, padding: "10px 22px", cursor: "pointer", transition: "all 0.15s" }}
                >
                  <ChevronDown size={15} />
                  Load more ({reviews.length - visibleCount} remaining)
                </button>
              ) : (
                <button
                  onClick={() => setVisibleCount(INITIAL_SHOW)}
                  style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#6B7280", background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "10px 22px", cursor: "pointer" }}
                >
                  <ChevronUp size={15} />
                  Show less
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;