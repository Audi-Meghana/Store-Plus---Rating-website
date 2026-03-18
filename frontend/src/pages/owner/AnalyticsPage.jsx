import { useState, useEffect, useCallback } from "react";
import { Star, TrendingUp, TrendingDown, BarChart2, Calendar, Menu, Award, Minus } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../../services/api";
import Sidebar, { useSidebar, MobileMenuButton } from "../../components/common/Sidebar";

const PERIODS = ["7d", "1m", "3m", "6m"];
const STAR_COLORS = { 5: "#22c55e", 4: "#84cc16", 3: "#facc15", 2: "#f97316", 1: "#ef4444" };

const filterByPeriod = (reviews, period) => {
  const days = { "7d": 7, "1m": 30, "3m": 90, "6m": 180 }[period] ?? 30;
  const cutoff = Date.now() - days * 86400000;
  return reviews.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
};

const buildRatingTrend = (reviews) => {
  const map = {};
  reviews.forEach((r) => {
    const d     = new Date(r.createdAt);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!map[label]) map[label] = { month: label, sum: 0, count: 0, ts: d.getTime() };
    map[label].sum   += r.rating;
    map[label].count += 1;
  });
  return Object.values(map).sort((a, b) => a.ts - b.ts)
    .map(({ month, sum, count }) => ({ month, rating: +(sum / count).toFixed(2) }));
};

const buildReviewVolume = (reviews) => {
  const map = {};
  reviews.forEach((r) => {
    const d    = new Date(r.createdAt);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const wk   = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    const lbl  = `W${wk} '${String(d.getFullYear()).slice(2)}`;
    if (!map[lbl]) map[lbl] = { week: lbl, reviews: 0, ts: d.getTime() };
    map[lbl].reviews += 1;
  });
  return Object.values(map).sort((a, b) => a.ts - b.ts).map(({ week, reviews }) => ({ week, reviews }));
};

const buildBreakdown = (reviews) =>
  [5, 4, 3, 2, 1].map((star) => ({ name: star, value: reviews.filter((r) => r.rating === star).length }));

const deriveInsights = (trend) => {
  if (!trend.length) return null;
  const best  = trend.reduce((a, b) => b.rating > a.rating ? b : a, trend[0]);
  const worst = trend.reduce((a, b) => b.rating < a.rating ? b : a, trend[0]);
  let trendDir = 0;
  if (trend.length >= 2) {
    const mid   = Math.floor(trend.length / 2);
    const first = trend.slice(0, mid).reduce((s, r) => s + r.rating, 0) / mid;
    const last  = trend.slice(mid).reduce((s, r) => s + r.rating, 0) / (trend.length - mid);
    trendDir = last - first;
  }
  return { best, worst, trendDir };
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1.5px solid #F1F5F9", borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.09)", fontSize:12 }}>
      <p style={{ fontWeight:700, color:"#374151", marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight:600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(p.name === "rating" ? 1 : 0) : p.value}
        </p>
      ))}
    </div>
  );
};

const StarRow = ({ name, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:2, width:28, justifyContent:"flex-end", flexShrink:0 }}>
        <span style={{ fontSize:11, color:"#6B7280" }}>{name}</span>
        <Star size={9} style={{ color:"#FBBF24", fill:"#FBBF24" }} />
      </div>
      <div style={{ flex:1, height:8, background:"#F3F4F6", borderRadius:100, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:100, background:color, width:`${pct}%`, transition:"width 0.7s" }} />
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:"#374151", width:52, textAlign:"right", flexShrink:0 }}>
        {value} <span style={{ color:"#9CA3AF" }}>({pct}%)</span>
      </span>
    </div>
  );
};

const KPICard = ({ label, value, sub, trend }) => {
  const TrendIcon  = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "#16A34A"  : trend < 0 ? "#DC2626"    : "#9CA3AF";
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:"16px 16px", border:"1.5px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <p style={{ fontSize:22, fontWeight:800, color:"#0F172A", lineHeight:1 }}>{value ?? "—"}</p>
        {trend !== undefined && <TrendIcon size={15} style={{ color:trendColor, flexShrink:0 }} />}
      </div>
      <p style={{ fontSize:12, color:"#6B7280", marginTop:6 }}>{label}</p>
      {sub && <p style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{sub}</p>}
    </div>
  );
};

const axisStyle  = { fontSize:10, fill:"#9CA3AF" };
const gridProps  = { strokeDasharray:"3 3", stroke:"#F3F4F6" };

const AnalyticsPage = () => {
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();
  const [period,  setPeriod]  = useState("1m");
  const [loading, setLoading] = useState(true);
  const [shop,    setShop]    = useState(null);
  const [reviews, setReviews] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const shopRes  = await api.get("/shops/me");
      const shopData = shopRes?.data?.data ?? shopRes?.data ?? {};
      setShop(shopData);
      const shopId = shopData._id;
      if (!shopId) return;
      const reviewRes = await api.get(`/shops/${shopId}/reviews`, { params: { limit: 1000, sort: "newest" } });
      const payload   = reviewRes?.data ?? {};
      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
    } catch (e) {
      console.error("Analytics error:", e?.response?.data ?? e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const periodReviews = filterByPeriod(reviews, period);
  const ratingTrend   = buildRatingTrend(periodReviews);
  const reviewVolume  = buildReviewVolume(periodReviews);
  const breakdown     = buildBreakdown(reviews);
  const totalReviews  = shop?.reviewCount ?? reviews.length;
  const avgRating     = shop?.avgRating ?? (reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
  const profileViews  = shop?.profileViews ?? 0;
  const insights      = deriveInsights(ratingTrend);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"#F8F9FB", flexDirection:"column", gap:12 }}>
      <svg style={{ animation:"spin 0.8s linear infinite", width:28, height:28, color:"#22c55e" }} fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p style={{ fontSize:13, color:"#9CA3AF" }}>Loading analytics…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F8F9FB", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        .ap-grid-kpi { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .ap-grid-ins { display:grid; grid-template-columns:1fr; gap:10px; }
        .ap-grid-bkd { display:flex; flex-direction:column; gap:20px; }
        @media(min-width:640px){
          .ap-grid-kpi { grid-template-columns:repeat(2,1fr); gap:14px; }
          .ap-grid-ins { grid-template-columns:repeat(3,1fr); gap:14px; }
        }
        @media(min-width:1024px){
          .ap-grid-kpi { grid-template-columns:repeat(4,1fr); gap:16px; }
          .ap-grid-bkd { flex-direction:row; align-items:center; }
        }
      `}</style>

      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <header style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <MobileMenuButton onClick={openMobile} role="shop_owner" />
            <div>
              <h1 style={{ fontSize:17, fontWeight:800, color:"#0F172A", margin:0 }}>Analytics</h1>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0, display:"flex", alignItems:"center", gap:4 }}>
                <Calendar size={10} /> Detailed performance breakdown
              </p>
            </div>
          </div>
          {/* Period toggle */}
          <div style={{ display:"flex", background:"#F3F4F6", borderRadius:10, padding:3, gap:2 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding:"5px 10px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700, fontFamily:"inherit",
                background: period === p ? "#fff"    : "transparent",
                color:      period === p ? "#2563EB" : "#9CA3AF",
                boxShadow:  period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>{p}</button>
            ))}
          </div>
        </header>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 40px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* KPI */}
          <div className="ap-grid-kpi">
            <KPICard label="Avg Rating"          value={avgRating ? `${Number(avgRating).toFixed(1)} ★` : "—"} trend={insights?.trendDir ?? 0} />
            <KPICard label="Total Reviews"        value={totalReviews} />
            <KPICard label="Profile Views"        value={profileViews} />
            <KPICard label={`Reviews (${period})`} value={periodReviews.length} sub={`of ${totalReviews} total`} />
          </div>

          {/* Insights */}
          {insights && ratingTrend.length > 0 && (
            <div className="ap-grid-ins">
              {[
                { bg:"#F0FDF4", border:"#BBF7D0", icon:<Award size={18} style={{color:"#16A34A"}} />, label:"Best month",    labelColor:"#15803D", val:`${insights.best.month} · ${Number(insights.best.rating).toFixed(1)}★`,   valColor:"#14532D" },
                { bg:"#FEF2F2", border:"#FECACA", icon:<TrendingDown size={18} style={{color:"#EF4444"}} />, label:"Lowest month",   labelColor:"#DC2626", val:`${insights.worst.month} · ${Number(insights.worst.rating).toFixed(1)}★`, valColor:"#991B1B" },
                {
                  bg: insights.trendDir > 0 ? "#EFF6FF" : insights.trendDir < 0 ? "#FFF7ED" : "#F8F9FB",
                  border: insights.trendDir > 0 ? "#BFDBFE" : insights.trendDir < 0 ? "#FED7AA" : "#E5E7EB",
                  icon: insights.trendDir > 0 ? <TrendingUp size={18} style={{color:"#2563EB"}} /> : insights.trendDir < 0 ? <TrendingDown size={18} style={{color:"#EA580C"}} /> : <Minus size={18} style={{color:"#9CA3AF"}} />,
                  label: "Overall trend", labelColor: insights.trendDir > 0 ? "#1D4ED8" : insights.trendDir < 0 ? "#C2410C" : "#6B7280",
                  val: insights.trendDir > 0.1 ? "Improving" : insights.trendDir < -0.1 ? "Declining" : "Stable", valColor:"#0F172A",
                },
              ].map((item, i) => (
                <div key={i} style={{ background:item.bg, border:`1.5px solid ${item.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:item.labelColor, margin:0 }}>{item.label}</p>
                    <p style={{ fontSize:13, fontWeight:800, color:item.valColor, margin:0 }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rating Trend chart */}
          <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"18px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:"#0F172A", margin:0 }}>Rating Trend</h2>
              <span style={{ fontSize:10, color:"#9CA3AF", background:"#F8FAFC", padding:"3px 8px", borderRadius:8, fontWeight:600 }}>{period}</span>
            </div>
            {ratingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={ratingTrend} margin={{ top:4, right:8, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis domain={[1,5]} tick={axisStyle} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="rating" stroke="#22c55e" strokeWidth={2.5} fill="url(#rg)" dot={{ r:4, fill:"#22c55e", strokeWidth:2, stroke:"#fff" }} name="rating" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:100, color:"#9CA3AF" }}>
                <TrendingUp size={24} style={{ opacity:0.3, marginBottom:6 }} />
                <p style={{ fontSize:12 }}>No rating data for this period.</p>
              </div>
            )}
          </div>

          {/* Review Volume chart */}
          <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"18px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:"#0F172A", margin:0 }}>Review Volume</h2>
              <span style={{ fontSize:10, color:"#9CA3AF", background:"#F8FAFC", padding:"3px 8px", borderRadius:8, fontWeight:600 }}>{period}</span>
            </div>
            {reviewVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={reviewVolume} margin={{ top:4, right:8, left:0, bottom:0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="reviews" fill="#3b82f6" radius={[4,4,0,0]} name="reviews" maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:80, color:"#9CA3AF" }}>
                <BarChart2 size={22} style={{ opacity:0.3, marginBottom:6 }} />
                <p style={{ fontSize:12 }}>No volume data for this period.</p>
              </div>
            )}
          </div>

          {/* Rating Breakdown */}
          <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"18px 16px" }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#0F172A", margin:"0 0 4px" }}>Rating Breakdown</h2>
            <p style={{ fontSize:11, color:"#9CA3AF", marginBottom:16 }}>All-time distribution</p>
            {breakdown.some(r => r.value > 0) ? (
              <div className="ap-grid-bkd">
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  {breakdown.map(r => (
                    <StarRow key={r.name} name={r.name} value={r.value} total={totalReviews} color={STAR_COLORS[r.name] ?? "#22c55e"} />
                  ))}
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                  <PieChart width={160} height={160}>
                    <Pie data={breakdown.filter(r => r.value > 0)} cx={80} cy={80} innerRadius={44} outerRadius={68} dataKey="value" nameKey="name" paddingAngle={2}>
                      {breakdown.filter(r => r.value > 0).map(entry => (
                        <Cell key={entry.name} fill={STAR_COLORS[entry.name] ?? "#22c55e"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} review${v!==1?"s":""}`, `${n}★`]} />
                  </PieChart>
                  <p style={{ fontSize:11, color:"#9CA3AF" }}>{totalReviews} total</p>
                  <p style={{ fontSize:16, fontWeight:800, color:"#0F172A" }}>{avgRating ? `${Number(avgRating).toFixed(1)} ★` : "—"}</p>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:80, color:"#9CA3AF" }}>
                <Star size={22} style={{ opacity:0.3, marginBottom:6 }} />
                <p style={{ fontSize:12 }}>No reviews yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;