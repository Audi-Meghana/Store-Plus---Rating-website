import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, MapPin, Star, X, Grid3X3,
  List, ChevronDown, ArrowUpDown, Store, Filter,
  SlidersHorizontal, Sparkles,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80";

const getImage = (shop) =>
  getImageUrl(shop?.cover?.url) ||
  getImageUrl(shop?.logo?.url) ||
  getImageUrl(shop?.gallery?.[0]?.url) ||
  FALLBACK_IMG;

const CATEGORIES = ["All","Restaurant","Cafe","Grocery","Clothing","Electronics","Pharmacy","Salon","Gym"];
const SORT_OPTIONS = [
  { label:"Best Rating",  value:"rating"    },
  { label:"Most Reviews", value:"reviews"   },
  { label:"Name A–Z",     value:"name_asc"  },
  { label:"Name Z–A",     value:"name_desc" },
  { label:"Newest",       value:"newest"    },
];

const CAT_COLORS = {
  Restaurant:"#FF6B35", Cafe:"#8B5E3C", Grocery:"#16A34A",
  Clothing:"#DB2777", Electronics:"#2563EB", Pharmacy:"#DC2626",
  Salon:"#7C3AED", Gym:"#0891B2", All:"#4F46E5",
};

const Stars = ({ rating, size=12 }) => (
  <span style={{ display:"flex", gap:2 }}>
    {[1,2,3,4,5].map(s=>(
      <Star key={s} size={size} style={{
        color: s<=Math.round(rating)?"#FBBF24":"#E5E7EB",
        fill:  s<=Math.round(rating)?"#FBBF24":"none",
      }}/>
    ))}
  </span>
);

const getCity = (shop) => {
  const loc = shop?.location;
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  return loc.city || loc.address || "";
};

const SkeletonCard = () => (
  <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
    <div style={{ height:176, background:"linear-gradient(90deg,#F1F5F9 25%,#E9EEF5 50%,#F1F5F9 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
    <div style={{ padding:"14px 16px 18px" }}>
      <div style={{ height:14, background:"#F1F5F9", borderRadius:8, marginBottom:9, width:"65%", animation:"shimmer 1.4s infinite" }}/>
      <div style={{ height:11, background:"#F1F5F9", borderRadius:8, width:"42%", animation:"shimmer 1.4s infinite" }}/>
    </div>
  </div>
);

const ExplorePage = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const [query,        setQuery]        = useState(searchParams.get("search")   || "");
  const [city,         setCity]         = useState(searchParams.get("city")     || "");
  const [category,     setCategory]     = useState(searchParams.get("category") || "All");
  const [sort,         setSort]         = useState("rating");
  const [viewMode,     setViewMode]     = useState("grid");
  const [showOpen,     setShowOpen]     = useState(false);
  const [showVerified, setShowVerified] = useState(false);
  const [minRating,    setMinRating]    = useState(0);
  const [showFilters,  setShowFilters]  = useState(false);
  const [sortOpen,     setSortOpen]     = useState(false);

  const [shops,   setShops]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const activeFilters = [showOpen, showVerified, minRating > 0].filter(Boolean).length;

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query)              params.set("search",       query);
      if (city)               params.set("city",         city);
      if (category !== "All") params.set("category",     category);
      if (showOpen)           params.set("openOnly",     "true");
      if (showVerified)       params.set("verifiedOnly", "true");
      if (minRating)          params.set("minRating",    minRating);
      params.set("sort",  sort);
      params.set("page",  page);
      params.set("limit", 12);

      const res = await api.get(`/shops?${params}`);
      setShops(res?.data?.data ?? res?.data ?? []);
      setTotal(res?.data?.total ?? res?.data?.data?.length ?? 0);
    } catch {
      setShops([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, city, category, sort, page, showOpen, showVerified, minRating]);

  useEffect(() => { fetchShops(); }, [fetchShops]);
  useEffect(() => { setPage(1); }, [query, city, category, sort, showOpen, showVerified, minRating]);

  const clearFilters = () => { setShowOpen(false); setShowVerified(false); setMinRating(0); };

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FB", fontFamily:"'Plus Jakarta Sans',sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ping{0%{transform:scale(1);opacity:1}80%,100%{transform:scale(2);opacity:0}}

        /* Category pills */
        .cat-pill{
          padding:8px 18px;border-radius:100px;font-size:12px;font-weight:700;
          border:1.5px solid #E5E7EB;cursor:pointer;transition:all 0.22s;
          background:#fff;white-space:nowrap;flex-shrink:0;
          font-family:'Plus Jakarta Sans',sans-serif;color:#6B7280;
          -webkit-tap-highlight-color:transparent;
        }
        .cat-pill.on{color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(99,102,241,0.25);}
        .cat-pill:not(.on):hover{border-color:#818CF8;color:#4F46E5;background:#F5F3FF;}

        /* Grid cards */
        .gc{
          background:#fff;border-radius:20px;border:1.5px solid #F1F5F9;
          overflow:hidden;cursor:pointer;transition:all 0.28s cubic-bezier(0.4,0,0.2,1);
          animation:fadeUp 0.4s ease both;
          -webkit-tap-highlight-color:transparent;
        }
        .gc:hover{box-shadow:0 20px 52px rgba(99,102,241,0.13);transform:translateY(-5px);border-color:#C7D2FE;}
        .gc:hover .simg{transform:scale(1.07);}
        .gc:hover .sname{color:#4F46E5;}
        .simg{width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);}
        .sname{font-size:14px;font-weight:700;color:#0F172A;transition:color 0.2s;margin-bottom:3px;}

        /* List cards */
        .lc{
          background:#fff;border-radius:18px;border:1.5px solid #F1F5F9;
          overflow:hidden;cursor:pointer;transition:all 0.25s;
          display:flex;animation:fadeUp 0.4s ease both;
          -webkit-tap-highlight-color:transparent;
        }
        .lc:hover{box-shadow:0 12px 36px rgba(99,102,241,0.1);transform:translateY(-3px);border-color:#C7D2FE;}
        .lc:hover .sname{color:#4F46E5;}

        /* Tags */
        .tag{background:#F5F3FF;color:#7C3AED;font-size:10px;font-weight:700;border-radius:6px;padding:2px 7px;}

        /* Sort dropdown */
        .sort-dd{
          position:absolute;top:calc(100% + 8px);right:0;
          background:#fff;border:1.5px solid #F1F5F9;border-radius:16px;
          box-shadow:0 16px 48px rgba(0,0,0,0.12);z-index:50;
          min-width:180px;overflow:hidden;animation:slideDown 0.2s ease;
        }
        .sort-opt{
          padding:11px 16px;font-size:13px;font-weight:600;cursor:pointer;
          transition:background 0.15s;color:#374151;
          font-family:'Plus Jakarta Sans',sans-serif;
          display:flex;align-items:center;gap:8px;
        }
        .sort-opt:hover{background:#F5F3FF;color:#4F46E5;}
        .sort-opt.on{background:#EEF2FF;color:#4F46E5;}

        /* Toggle */
        .tog-track{width:42px;height:23px;border-radius:100px;position:relative;transition:background 0.2s;cursor:pointer;flex-shrink:0;}
        .tog-thumb{position:absolute;top:3px;width:17px;height:17px;background:#fff;border-radius:50%;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);}

        /* View toggle btn */
        .vbtn{padding:8px;border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;background:transparent;}
        .vbtn.on{background:linear-gradient(135deg,#4F46E5,#7C3AED);}

        /* Filter panel */
        .filter-panel{animation:slideDown 0.2s ease;}

        /* Pagination */
        .pag-btn{
          padding:9px 18px;border-radius:12px;border:1.5px solid #E5E7EB;
          background:#fff;font-size:13px;font-weight:600;
          font-family:'Plus Jakarta Sans',sans-serif;
          transition:all 0.2s;cursor:pointer;color:#374151;
        }
        .pag-btn:not(:disabled):hover{border-color:#818CF8;color:#4F46E5;background:#F5F3FF;}
        .pag-btn:disabled{color:#D1D5DB;cursor:not-allowed;}

        /* Search input */
        .srch-input{border:none;outline:none;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#0F172A;padding:14px 4px;flex:1;min-width:0;background:transparent;}
        .srch-input::placeholder{color:#A5B4FC;}

        /* ── RESPONSIVE ── */
        /* Mobile base */
        .wrap{max-width:1160px;margin:0 auto;padding:0 14px;}
        .results-grid{display:grid;grid-template-columns:1fr;gap:14px;}
        .toolbar{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}
        .toolbar-left,.toolbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .filter-grid{display:flex;flex-direction:column;gap:18px;}
        .search-bar{
          background:#fff;border-radius:14px;
          border:1.5px solid rgba(255,255,255,0.2);
          box-shadow:0 4px 24px rgba(0,0,0,0.12);
          overflow:hidden;display:flex;flex-direction:column;
        }
        .search-row{display:flex;align-items:center;padding:0 12px;gap:8px;}
        .search-divider-h{height:1px;background:rgba(255,255,255,0.1);margin:0 12px;}
        .search-divider-v{display:none;}
        .search-city-row{display:flex;align-items:center;padding:0 12px;gap:8px;}
        .search-btn-row{background:linear-gradient(135deg,#5B5FF5,#8B5CF6);padding:12px 16px;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;border:none;font-size:13px;font-weight:700;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;}

        /* Tablet ≥ 640px */
        @media(min-width:640px){
          .wrap{padding:0 20px;}
          .results-grid{grid-template-columns:repeat(2,1fr);gap:16px;}
          .toolbar{flex-direction:row;justify-content:space-between;align-items:center;}
          .filter-grid{flex-direction:row;flex-wrap:wrap;}
          .search-bar{flex-direction:row;border-radius:14px;}
          .search-row{flex:1;}
          .search-divider-h{display:none;}
          .search-divider-v{display:block;width:1px;background:rgba(255,255,255,0.15);align-self:stretch;margin:10px 0;}
          .search-city-row{width:150px;}
          .search-btn-row{padding:12px 22px;border-radius:0;}
        }

        /* Desktop ≥ 900px */
        @media(min-width:900px){
          .wrap{padding:0 24px;}
          .results-grid{grid-template-columns:repeat(3,1fr);gap:18px;}
          .search-city-row{width:170px;}
        }
      `}</style>

      <Navbar />

      {/* ── HERO HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#0F172A 0%,#1E3A8A 60%,#4338CA 100%)", padding:"clamp(28px,5vw,44px) 0 clamp(36px,6vw,52px)", position:"relative", overflow:"hidden" }}>
        {/* decorative orbs */}
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)", top:-150, right:-80, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.12),transparent 70%)", bottom:-80, left:-40, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }}/>

        <div className="wrap" style={{ position:"relative" }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>Home</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>›</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>Explore</span>
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:100, padding:"5px 12px", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:10, letterSpacing:"0.05em" }}>
                <Sparkles size={11}/> 2,400+ stores across India
              </div>
              <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.1 }}>
                Explore Stores
              </h1>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[{v:"2.4K+",l:"Reviews"},{v:"12+",l:"Cities"},{v:"4.7★",l:"Avg Rating"}].map((s,i)=>(
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.2rem", fontWeight:700, color:"#fff", lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2, fontWeight:500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar">
            <div className="search-row">
              <Search size={16} style={{ color:"#A5B4FC", flexShrink:0 }}/>
              <input className="srch-input" placeholder="Store name or keyword…" value={query} onChange={e=>setQuery(e.target.value)}/>
            </div>
            <div className="search-divider-h"/>
            <div className="search-divider-v"/>
            <div className="search-city-row">
              <MapPin size={14} style={{ color:"#A5B4FC", flexShrink:0 }}/>
              <input className="srch-input" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} style={{ width:"100%", padding:"14px 4px" }}/>
            </div>
            <button className="search-btn-row" onClick={fetchShops}>
              <Search size={14}/> Search
            </button>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding:"20px 14px 64px" }}>

        {/* ── CATEGORY PILLS ── */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, marginBottom:18, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
          {CATEGORIES.map(c=>{
            const col = CAT_COLORS[c] || "#4F46E5";
            return (
              <button key={c} className={`cat-pill ${category===c?"on":""}`}
                style={ category===c ? { background:`linear-gradient(135deg,${col},${col}cc)` } : {} }
                onClick={()=>setCategory(c)}>
                {c}
              </button>
            );
          })}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="toolbar-left">
            <button onClick={()=>{ setShowFilters(f=>!f); setSortOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:6, background:showFilters?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#fff", color:showFilters?"#fff":"#374151", border:`1.5px solid ${showFilters?"transparent":"#E5E7EB"}`, borderRadius:11, padding:"9px 16px", fontSize:12, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer", transition:"all 0.22s", boxShadow:showFilters?"0 4px 14px rgba(99,102,241,0.25)":"none" }}>
              <SlidersHorizontal size={13}/>
              Filters
              {activeFilters > 0 && (
                <span style={{ background:"#EF4444", color:"#fff", borderRadius:"50%", width:17, height:17, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{activeFilters}</span>
              )}
            </button>

            <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:500 }}>
              <strong style={{ color:"#0F172A", fontWeight:700 }}>{loading?"…":total}</strong> stores
            </span>

            {/* Active filter chips */}
            {showOpen && (
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:100, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#059669" }}>
                Open Now <X size={11} style={{ cursor:"pointer" }} onClick={()=>setShowOpen(false)}/>
              </div>
            )}
            {showVerified && (
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"#EEF2FF", border:"1px solid #C7D2FE", borderRadius:100, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#4F46E5" }}>
                Verified <X size={11} style={{ cursor:"pointer" }} onClick={()=>setShowVerified(false)}/>
              </div>
            )}
            {minRating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:100, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#D97706" }}>
                {minRating}+ ★ <X size={11} style={{ cursor:"pointer" }} onClick={()=>setMinRating(0)}/>
              </div>
            )}
          </div>

          <div className="toolbar-right">
            {/* Sort */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>{ setSortOpen(o=>!o); setShowFilters(false); }}
                style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:11, padding:"9px 14px", fontSize:12, fontWeight:700, color:"#374151", fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer", transition:"all 0.2s" }}>
                <ArrowUpDown size={12}/>
                <span style={{ display:"none" }} className="sort-label">{SORT_OPTIONS.find(o=>o.value===sort)?.label}</span>
                Sort
                <ChevronDown size={11} style={{ transform:sortOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
              </button>
              {sortOpen && (
                <div className="sort-dd">
                  {SORT_OPTIONS.map(o=>(
                    <div key={o.value} className={`sort-opt ${sort===o.value?"on":""}`} onClick={()=>{ setSort(o.value); setSortOpen(false); }}>
                      {sort===o.value && <div style={{ width:6, height:6, borderRadius:"50%", background:"#4F46E5", flexShrink:0 }}/>}
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle */}
            <div style={{ display:"flex", gap:3, background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:11, padding:3 }}>
              {[["grid",Grid3X3],["list",List]].map(([m,Icon])=>(
                <button key={m} className={`vbtn ${viewMode===m?"on":""}`} onClick={()=>setViewMode(m)}>
                  <Icon size={14} style={{ color:viewMode===m?"#fff":"#9CA3AF" }}/>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="filter-panel" style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:"20px 20px 24px", marginBottom:18, boxShadow:"0 8px 32px rgba(99,102,241,0.07)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:"1rem", color:"#0F172A" }}>Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} style={{ background:"none", border:"none", color:"#EF4444", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                  <X size={12}/> Clear all
                </button>
              )}
            </div>
            <div className="filter-grid">
              {/* Status toggles */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#9CA3AF", marginBottom:14 }}>Status</p>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[["Open Now",showOpen,setShowOpen,"#10B981"],["Verified Only",showVerified,setShowVerified,"#4F46E5"]].map(([label,val,setter,col])=>(
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>setter(v=>!v)}>
                      <div className="tog-track" style={{ background:val?col:"#E5E7EB" }}>
                        <div className="tog-thumb" style={{ left:val?"calc(100% - 20px)":3 }}/>
                      </div>
                      <span style={{ fontSize:13, color:"#374151", fontWeight:600 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Min rating */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#9CA3AF", marginBottom:14 }}>Min Rating</p>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {[0,3,3.5,4,4.5].map(r=>(
                    <button key={r} onClick={()=>setMinRating(r)}
                      style={{ padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:700, border:`1.5px solid ${minRating===r?"#4F46E5":"#E5E7EB"}`, background:minRating===r?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#fff", color:minRating===r?"#fff":"#6B7280", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:4, transition:"all 0.2s" }}>
                      {r===0 ? "Any" : <><Star size={10} style={{ fill:"currentColor" }}/>{r}+</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {loading ? (
          <div className="results-grid">
            {[1,2,3,4,5,6].map(n=><SkeletonCard key={n}/>)}
          </div>
        ) : shops.length === 0 ? (
          <div style={{ textAlign:"center", padding:"clamp(48px,8vw,80px) 24px", background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9" }}>
            <div style={{ width:72, height:72, borderRadius:20, background:"#F8F9FB", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Store size={32} style={{ color:"#D1D5DB" }}/>
            </div>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"#0F172A", marginBottom:8, fontSize:"1.1rem" }}>No stores found</h3>
            <p style={{ color:"#9CA3AF", fontSize:13, marginBottom:20, lineHeight:1.6 }}>Try adjusting your filters or search term.</p>
            <button onClick={()=>{ setQuery(""); setCategory("All"); clearFilters(); }}
              style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)", color:"#fff", border:"none", borderRadius:12, padding:"11px 24px", fontSize:13, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer" }}>
              Clear Search
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="results-grid">
            {shops.map((shop, idx)=>(
              <div key={shop._id} className="gc" style={{ animationDelay:`${idx*0.05}s` }} onClick={()=>navigate(`/store/${shop._id}`)}>
                <div style={{ position:"relative", height:176, overflow:"hidden" }}>
                  <img src={getImage(shop)} alt={shop.name} className="simg" onError={(e)=>{e.target.src=FALLBACK_IMG;}}/>
                  {/* gradient overlay */}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 55%)" }}/>
                  {/* top left badges */}
                  <div style={{ position:"absolute", top:10, left:10, display:"flex", gap:5, flexWrap:"wrap" }}>
                    <span style={{ background:shop.isOpen?"rgba(5,150,105,0.88)":"rgba(220,38,38,0.88)", color:"#fff", fontSize:9, fontWeight:700, borderRadius:100, padding:"3px 8px", backdropFilter:"blur(4px)" }}>
                      {shop.isOpen?"● Open":"● Closed"}
                    </span>
                    {shop.isVerified && (
                      <span style={{ background:"rgba(79,70,229,0.88)", color:"#fff", fontSize:9, fontWeight:700, borderRadius:100, padding:"3px 8px", backdropFilter:"blur(4px)" }}>✓ Verified</span>
                    )}
                  </div>
                  {/* top right rating */}
                  <div style={{ position:"absolute", top:10, right:10, background:"rgba(255,255,255,0.92)", borderRadius:100, padding:"3px 9px", display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color:"#92400E", backdropFilter:"blur(4px)" }}>
                    <Star size={10} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>{shop.avgRating>0?Number(shop.avgRating).toFixed(1):"New"}
                  </div>
                  {/* bottom category */}
                  <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(255,255,255,0.9)", borderRadius:8, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#374151", backdropFilter:"blur(4px)" }}>
                    {shop.category}
                  </div>
                </div>
                <div style={{ padding:"13px 15px 15px" }}>
                  <div className="sname">{shop.name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#9CA3AF", marginBottom:9 }}>
                    <MapPin size={11}/>{getCity(shop)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <Stars rating={shop.avgRating||0}/>
                    <span style={{ fontSize:10, color:"#9CA3AF", fontWeight:500 }}>{shop.reviewCount||0} reviews</span>
                  </div>
                  {shop.tags?.length > 0 && (
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:9 }}>
                      {shop.tags.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {shops.map((shop, idx)=>(
              <div key={shop._id} className="lc" style={{ animationDelay:`${idx*0.04}s` }} onClick={()=>navigate(`/store/${shop._id}`)}>
                <div style={{ position:"relative", width:120, flexShrink:0, overflow:"hidden" }}>
                  <img src={getImage(shop)} alt={shop.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={(e)=>{e.target.src=FALLBACK_IMG;}}/>
                  <div style={{ position:"absolute", bottom:7, left:7, background:"rgba(255,255,255,0.9)", borderRadius:100, padding:"2px 7px", display:"flex", alignItems:"center", gap:3, fontSize:10, fontWeight:700, color:"#92400E" }}>
                    <Star size={9} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>{shop.avgRating>0?Number(shop.avgRating).toFixed(1):"New"}
                  </div>
                </div>
                <div style={{ flex:1, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", minWidth:0 }}>
                  <div style={{ flex:1, minWidth:140 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                      <span className="sname">{shop.name}</span>
                      <span style={{ background:"#EEF2FF", color:"#4F46E5", fontSize:10, fontWeight:700, borderRadius:6, padding:"2px 7px" }}>{shop.category}</span>
                      <span style={{ background:shop.isOpen?"#ECFDF5":"#FEF2F2", color:shop.isOpen?"#059669":"#DC2626", fontSize:9, fontWeight:700, borderRadius:100, padding:"2px 7px" }}>
                        {shop.isOpen?"Open":"Closed"}
                      </span>
                    </div>
                    <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:7, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{getCity(shop)}</span>
                      <span>· {shop.reviewCount||0} reviews</span>
                    </div>
                    {shop.tags?.length > 0 && (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {shop.tags.slice(0,3).map(t=><span key={t} className="tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <Stars rating={shop.avgRating||0} size={14}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {total > 12 && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10, marginTop:36, flexWrap:"wrap" }}>
            <button className="pag-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            <div style={{ display:"flex", gap:6 }}>
              {Array.from({ length:Math.min(5, Math.ceil(total/12)) }, (_,i) => {
                const pg = i + 1;
                return (
                  <button key={pg} onClick={()=>setPage(pg)}
                    style={{ width:36, height:36, borderRadius:10, border:`1.5px solid ${page===pg?"transparent":"#E5E7EB"}`, background:page===pg?"linear-gradient(135deg,#4F46E5,#7C3AED)":"#fff", color:page===pg?"#fff":"#374151", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.2s" }}>
                    {pg}
                  </button>
                );
              })}
            </div>
            <button className="pag-btn" disabled={page>=Math.ceil(total/12)} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;